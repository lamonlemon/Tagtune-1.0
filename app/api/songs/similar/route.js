import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { video_id, count = 20, primary_tags = {} } = await request.json();

    if (!video_id) {
      return NextResponse.json({ error: 'Missing video_id' }, { status: 400 });
    }

    const targetUrl = `https://music.youtube.com/watch?v=${video_id}`;
    const altTargetUrl = `https://youtube.com/watch?v=${video_id}`;

    // 1. Resolve seed song details
    const { data: seedSong, error: seedError } = await supabase
      .from('songs')
      .select(`
        song_index, title, url, language, release_year, original_song_id, group_id, album_id, artist_id,
        artists!songs_artist_id_fkey ( name ),
        song_featuring ( artist_id ),
        song_producers ( artist_id )
      `)
      .or(`url.eq.${targetUrl},url.eq.${altTargetUrl}`)
      .single();

    if (seedError || !seedSong) {
      return NextResponse.json({ error: 'Song not found in database.' }, { status: 404 });
    }

    const seedSongIndex = seedSong.song_index;

    // 2. Fetch seed song vectors
    const { data: vectors, error: vectorError } = await supabase
      .from('song_vectors')
      .select('artist_vector, audio_vector')
      .eq('song_id', seedSongIndex)
      .single();

    if (vectorError || !vectors) {
       return NextResponse.json({ error: 'Vectors not found for this song.' }, { status: 404 });
    }

    const has = (arr) => Array.isArray(arr) && arr.length > 0;
    const allGenreIds = [
      ...(primary_tags.primary_genre_ids || []),
      ...(primary_tags.sub_genre_ids || []),
      ...(primary_tags.micro_genre_ids || [])
    ];
    const isGenreInner = allGenreIds.length > 0;

    const hasFilters = has(primary_tags.languages) || 
                       has(primary_tags.artist_ids) || 
                       has(primary_tags.group_ids) ||
                       isGenreInner ||
                       primary_tags.cover_filter;

    const matchCount = hasFilters ? 300 : count * 3;

    // 3. Call RPCs
    const [artistResponse, audioResponse] = await Promise.all([
      supabase.rpc('match_by_artist_vector', { 
        query_vector: vectors.artist_vector, 
        match_count: matchCount 
      }),
      supabase.rpc('match_by_audio_vector', { 
        query_vector: vectors.audio_vector, 
        match_count: matchCount 
      })
    ]);

    if (artistResponse.error) {
      console.error('Error in match_by_artist_vector:', artistResponse.error);
    }
    if (audioResponse.error) {
      console.error('Error in match_by_audio_vector:', audioResponse.error);
    }

    const artistMatches = artistResponse.data || [];
    const audioMatches = audioResponse.data || [];

    // 4. Merge results
    const combinedScores = {};

    artistMatches.forEach(match => {
      combinedScores[match.song_index] = {
        song_index: match.song_index,
        artist_similarity: match.similarity || 0,
        audio_similarity: 0
      };
    });

    audioMatches.forEach(match => {
      if (combinedScores[match.song_index]) {
        combinedScores[match.song_index].audio_similarity = match.similarity || 0;
      } else {
        combinedScores[match.song_index] = {
          song_index: match.song_index,
          artist_similarity: 0,
          audio_similarity: match.similarity || 0
        };
      }
    });

    // Remove seed song from similar recommendations
    if (combinedScores[seedSongIndex]) {
      delete combinedScores[seedSongIndex];
    }

    // Compute combined score and sort
    const sortedCandidates = Object.values(combinedScores)
      .map(candidate => ({
        song_index: candidate.song_index,
        score: 0.5 * candidate.artist_similarity + 0.5 * candidate.audio_similarity
      }))
      .sort((a, b) => b.score - a.score);

    const candidateIndexes = sortedCandidates.map(c => c.song_index);

    // Fetch seed song effective genre
    const { data: seedGenreData } = await supabase.rpc('get_effective_genre', {
      p_song_index: seedSongIndex
    });
    const seedEffectiveGenre = seedGenreData && seedGenreData.length > 0 ? seedGenreData[0] : null;

    const formattedSeedSong = {
      song_index: seedSong.song_index,
      title: seedSong.title,
      artist_id: seedSong.artist_id,
      artist_name: seedSong.artists?.name || 'Unknown',
      url: seedSong.url,
      language: seedSong.language,
      is_cover: seedSong.original_song_id !== null && seedSong.original_song_id !== seedSong.song_index,
      score: 9999,
      match_reasons: ["Input Song"],
      album_id: seedSong.album_id,
      group_id: seedSong.group_id,
      primary_genre_id: seedEffectiveGenre?.primary_genre_id,
      song_primary_genres: seedEffectiveGenre?.primary_genre_id,
      song_sub_genres: seedEffectiveGenre?.sub_genre_id,
      song_micro_genres: seedEffectiveGenre?.micro_genre_id,
      song_featuring: seedSong.song_featuring || [],
      song_producers: seedSong.song_producers || [],
    };

    if (candidateIndexes.length === 0) {
      return NextResponse.json([formattedSeedSong]);
    }

    // 5. Fetch full song details for candidates
    const { data: candidatesDetails, error: detailsError } = await supabase
      .from('songs')
      .select(`
        song_index, title, url, language, release_year, original_song_id, group_id, album_id, artist_id,
        artists!songs_artist_id_fkey ( name ),
        song_featuring ( artist_id ),
        song_producers ( artist_id )
      `)
      .in('song_index', candidateIndexes);

    if (detailsError) {
      console.error('Error fetching candidate details:', detailsError);
      return NextResponse.json({ error: 'Database error fetching details' }, { status: 500 });
    }

    // Phase 1: Filter candidates by language, artist, group, covers (available on songs table)
    let filtered = candidatesDetails || [];

    if (has(primary_tags.languages)) {
      filtered = filtered.filter(s => primary_tags.languages.includes(s.language));
    }
    
    if (has(primary_tags.artist_ids)) {
      filtered = filtered.filter(s => primary_tags.artist_ids.includes(s.artist_id));
    }

    if (has(primary_tags.feat_artist_ids)) {
      filtered = filtered.filter(s => s.song_featuring && s.song_featuring.some(f => primary_tags.feat_artist_ids.includes(f.artist_id)));
    }

    if (has(primary_tags.prod_artist_ids)) {
      filtered = filtered.filter(s => s.song_producers && s.song_producers.some(p => primary_tags.prod_artist_ids.includes(p.artist_id)));
    }

    if (has(primary_tags.group_ids)) {
      filtered = filtered.filter(s => primary_tags.group_ids.includes(s.group_id));
    }

    if (primary_tags.cover_filter === 'cover') {
      filtered = filtered.filter(s => {
        const isCover = s.original_song_id !== null && s.original_song_id !== s.song_index;
        return isCover;
      });
    } else if (primary_tags.cover_filter === 'original') {
      filtered = filtered.filter(s => {
        const isCover = s.original_song_id !== null && s.original_song_id !== s.song_index;
        return !isCover;
      });
    }

    // Phase 2: Filter by genre if genre filters are active
    const genreMap = {};
    if (isGenreInner) {
      const candidatesForGenreFetch = filtered.slice(0, 150);

      await Promise.all(candidatesForGenreFetch.map(async (s) => {
        const { data } = await supabase.rpc('get_effective_genre', {
          p_song_index: s.song_index
        });
        if (data && data.length > 0) {
          genreMap[s.song_index] = data[0];
        }
      }));

      filtered = candidatesForGenreFetch.filter(s => {
        const eg = genreMap[s.song_index];
        if (!eg) return false;
        
        if (has(primary_tags.primary_genre_ids) && !primary_tags.primary_genre_ids.includes(eg.primary_genre_id)) return false;
        if (has(primary_tags.sub_genre_ids) && !primary_tags.sub_genre_ids.includes(eg.sub_genre_id)) return false;
        if (has(primary_tags.micro_genre_ids) && !primary_tags.micro_genre_ids.includes(eg.micro_genre_id)) return false;
        
        return true;
      });
    }

    // Sort survivors by original vector similarity score rank
    filtered.sort((a, b) => {
      const idxA = candidateIndexes.indexOf(a.song_index);
      const idxB = candidateIndexes.indexOf(b.song_index);
      return idxA - idxB;
    });

    // Slice to the requested count
    const selectedCandidates = filtered.slice(0, count);

    // Fetch genres for selected candidates if we haven't already (needed for frontend tags render)
    if (!isGenreInner) {
      await Promise.all(selectedCandidates.map(async (s) => {
        const { data } = await supabase.rpc('get_effective_genre', {
          p_song_index: s.song_index
        });
        if (data && data.length > 0) {
          genreMap[s.song_index] = data[0];
        }
      }));
    }

    // Map to final format expected by PlaylistResult.jsx
    const finalSelection = selectedCandidates.map(s => {
      const isCover = s.original_song_id !== null && s.original_song_id !== s.song_index;
      const effective_genre = genreMap[s.song_index];
      
      const combinedCandidate = candidateIndexes.findIndex(id => id === s.song_index);

      return {
        song_index: s.song_index,
        title: s.title,
        artist_id: s.artist_id,
        artist_name: s.artists?.name || 'Unknown',
        url: s.url,
        language: s.language,
        is_cover: isCover,
        score: combinedCandidate !== -1 ? (candidateIndexes.length - combinedCandidate) * 10 : 0, 
        match_reasons: ["Vector similarity"],
        album_id: s.album_id,
        group_id: s.group_id,
        primary_genre_id: effective_genre?.primary_genre_id,
        song_primary_genres: effective_genre?.primary_genre_id,
        song_sub_genres: effective_genre?.sub_genre_id,
        song_micro_genres: effective_genre?.micro_genre_id,
        song_featuring: s.song_featuring,
        song_producers: s.song_producers,
      };
    });

    // Restore sorted order by score descending
    finalSelection.sort((a, b) => b.score - a.score);

    return NextResponse.json([formattedSeedSong, ...finalSelection]);

  } catch (err) {
    console.error('Error generating vector recommendation:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
