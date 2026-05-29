import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from "@/auth";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      seed_song_index, 
      primary_tags = {},
      secondary_tags = {},
      count = 20, 
      regenerate = false
    } = await request.json();

    const has = (arr) => Array.isArray(arr) && arr.length > 0;

    const isFeatInner = has(primary_tags.feat_artist_ids);
    const isProdInner = has(primary_tags.prod_artist_ids);
    const allGenreIds = [
      ...(primary_tags.primary_genre_ids || []),
      ...(primary_tags.sub_genre_ids || []),
      ...(primary_tags.micro_genre_ids || [])
    ];
    const isGenreInner = allGenreIds.length > 0;

    let query = supabase
      .from('songs')
      .select(`
        song_index, title, url, language, release_year, original_song_id, group_id, album_id, artist_id,
        artists!songs_artist_id_fkey ( artist_id, name ),
        song_featuring${isFeatInner ? '!inner' : ''} ( artist_id ),
        song_producers${isProdInner ? '!inner' : ''} ( artist_id )
      `);
    
    if (has(primary_tags.languages)) {
      query = query.in('language', primary_tags.languages);
    }
    if (has(primary_tags.artist_ids)) {
      query = query.in('artist_id', primary_tags.artist_ids);
    }
    if (has(primary_tags.group_ids)) {
      query = query.in('group_id', primary_tags.group_ids);
    }
    if (has(primary_tags.feat_artist_ids)) {
      query = query.in('song_featuring.artist_id', primary_tags.feat_artist_ids);
    }
    if (has(primary_tags.prod_artist_ids)) {
      query = query.in('song_producers.artist_id', primary_tags.prod_artist_ids);
    }
    if (primary_tags.cover_filter === 'cover') {
      query = query.not('original_song_id', 'is', null);
    } else if (primary_tags.cover_filter === 'original') {
      query = query.is('original_song_id', null);
    }
    
    if (seed_song_index) {
       query = query.neq('song_index', seed_song_index);
    }

    const { data: filterResults, error: filterError } = await query;

    if (filterError) {
      console.error('Error querying DB:', filterError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let candidates = filterResults.filter(s => {
      const isCover = s.original_song_id !== null && s.original_song_id !== s.song_index;
      if (primary_tags.cover_filter === 'cover' && !isCover) return false;
      if (primary_tags.cover_filter === 'original' && isCover) return false;
      return true;
    });

    const genreMap = {};
    await Promise.all(candidates.map(async (s) => {
      const { data } = await supabase.rpc('get_effective_genre', {
        p_song_index: s.song_index
      });
      if (data && data.length > 0) {
        genreMap[s.song_index] = data[0];
      }
    }));

    candidates = candidates.map(s => ({
      ...s,
      effective_genre: genreMap[s.song_index] || null
    }));

    // Post-RPC Primary Genre Filtering (Hard Filters)
    if (isGenreInner) {
      candidates = candidates.filter(s => {
        const eg = s.effective_genre;
        if (!eg) return false;
        
        if (has(primary_tags.primary_genre_ids) && !primary_tags.primary_genre_ids.includes(eg.primary_genre_id)) return false;
        if (has(primary_tags.sub_genre_ids) && !primary_tags.sub_genre_ids.includes(eg.sub_genre_id)) return false;
        if (has(primary_tags.micro_genre_ids) && !primary_tags.micro_genre_ids.includes(eg.micro_genre_id)) return false;
        
        return true;
      });
    }

    candidates = shuffle(candidates);

    let seedSong = null;
    if (seed_song_index) {
      const { data } = await supabase
        .from('songs')
        .select(`
          song_index, language, release_year, group_id
        `)
        .eq('song_index', seed_song_index)
        .single();
      
      if (data) {
        // Resolve effective genre for seed song too
        const { data: genreData } = await supabase.rpc('get_effective_genre', {
          p_song_index: seed_song_index
        });
        seedSong = {
          ...data,
          effective_genre: (genreData && genreData.length > 0) ? genreData[0] : null
        };
      }
    }

    let scoredCandidates = candidates.map(s => {
      let score = 0;
      let reasons = [];

      if (has(secondary_tags.group_ids) && secondary_tags.group_ids.includes(s.group_id)) {
        score += 30;
        reasons.push('Group (User Tag)');
      }
      if (has(secondary_tags.artist_ids)) {
        if (secondary_tags.artist_ids.includes(s.artist_id)) {
          score += 30;
          reasons.push('Artist (User Tag)');
        } else if (s.song_featuring && s.song_featuring.some(f => secondary_tags.artist_ids.includes(f.artist_id))) {
          score += 20;
          reasons.push('Featuring (User Tag)');
        }
      }
      if (has(secondary_tags.feat_artist_ids) && s.song_featuring && s.song_featuring.some(f => secondary_tags.feat_artist_ids.includes(f.artist_id))) {
        score += 25;
        reasons.push('Featuring (User Tag)');
      }
      if (has(secondary_tags.prod_artist_ids) && s.song_producers && s.song_producers.some(p => secondary_tags.prod_artist_ids.includes(p.artist_id))) {
        score += 25;
        reasons.push('Producer (User Tag)');
      }
      if (has(secondary_tags.primary_genre_ids) && secondary_tags.primary_genre_ids.includes(s.effective_genre?.primary_genre_id)) {
         score += 20;
         reasons.push('Genre (User Tag)');
      }
      if (has(secondary_tags.sub_genre_ids) && secondary_tags.sub_genre_ids.includes(s.effective_genre?.sub_genre_id)) {
         score += 25;
         reasons.push('Sub Genre (User Tag)');
      }
      if (has(secondary_tags.micro_genre_ids) && secondary_tags.micro_genre_ids.includes(s.effective_genre?.micro_genre_id)) {
         score += 30;
         reasons.push('Micro Genre (User Tag)');
      }
      if (has(secondary_tags.languages) && secondary_tags.languages.includes(s.language)) {
         score += 20;
         reasons.push('Language (User Tag)');
      }

      if (seedSong) {
        if (seedSong.effective_genre?.micro_genre_id && s.effective_genre?.micro_genre_id === seedSong.effective_genre.micro_genre_id) {
          score += 40;
          reasons.push('Same micro genre');
        } else if (seedSong.effective_genre?.sub_genre_id && s.effective_genre?.sub_genre_id === seedSong.effective_genre.sub_genre_id) {
          score += 25;
          reasons.push('Same sub genre');
        } else if (seedSong.effective_genre?.primary_genre_id && s.effective_genre?.primary_genre_id === seedSong.effective_genre.primary_genre_id) {
          score += 10;
          reasons.push('Same primary genre');
        }

        if (seedSong.group_id && s.group_id === seedSong.group_id) {
          score += 15;
          reasons.push('Same artist group');
        }
        if (seedSong.language && s.language === seedSong.language) {
          score += 10;
          reasons.push('Same language');
        }
        if (seedSong.release_year && s.release_year) {
          const seedDecade = Math.floor(seedSong.release_year / 10) * 10;
          const sDecade = Math.floor(s.release_year / 10) * 10;
          if (seedDecade === sDecade) {
            score += 5;
            reasons.push('Same release decade');
          }
        }
      }

      const isCover = s.original_song_id !== null && s.original_song_id !== s.song_index;
      if (isCover) reasons.push('Cover song');
      if (reasons.length === 0) reasons.push('Tag match');

      return {
        song_index: s.song_index,
        title: s.title,
        artist_id: s.artist_id,
        artist_name: s.artists?.name || 'Unknown',
        url: s.url,
        language: s.language,
        is_cover: isCover,
        score,
        match_reasons: reasons,
        album_id: s.album_id,
        group_id: s.group_id,
        primary_genre_id: s.effective_genre?.primary_genre_id,
        song_primary_genres: s.effective_genre?.primary_genre_id,
        song_sub_genres: s.effective_genre?.sub_genre_id,
        song_micro_genres: s.effective_genre?.micro_genre_id,
        song_featuring: s.song_featuring,
        song_producers: s.song_producers,
      };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    const primaryGenreIds = primary_tags.primary_genre_ids || [];
    let poolForDedup;

    if (primaryGenreIds.length > 1) {
      const genreBuckets = {};
      primaryGenreIds.forEach(gid => { genreBuckets[gid] = []; });

      for (const song of scoredCandidates) {
        const gid = song.primary_genre_id;
        if (genreBuckets[gid]) {
          genreBuckets[gid].push(song);
        }
      }

      const merged = [];
      let maxLen = Math.max(...Object.values(genreBuckets).map(b => b.length));
      for (let i = 0; i < maxLen; i++) {
        for (const gid of primaryGenreIds) {
          if (genreBuckets[gid][i]) merged.push(genreBuckets[gid][i]);
        }
      }
      poolForDedup = merged;
    } else {
      poolForDedup = scoredCandidates;
    }

    if (regenerate) {
       poolForDedup = shuffle(poolForDedup);
    }

    const artistCounts = {};
    const albumCounts = {};
    const finalSelection = [];

    const primaryArtistIds = primary_tags.artist_ids || [];

    for (let song of poolForDedup) {
      if (finalSelection.length >= count) break;
      
      const isPrimaryArtist = primaryArtistIds.includes(song.artist_id);
      const currentArtistCount = artistCounts[song.artist_name] || 0;
      const currentAlbumCount = song.album_id ? (albumCounts[song.album_id] || 0) : 0;

      // Only apply 2-song artist limit if it's NOT a primary tagged artist
      if (!isPrimaryArtist && currentArtistCount >= 5) continue;
      // Maintain album limit to avoid too much repetition from one specific record
      if (song.album_id && currentAlbumCount >= 5) continue;

      artistCounts[song.artist_name] = currentArtistCount + 1;
      if (song.album_id) {
        albumCounts[song.album_id] = currentAlbumCount + 1;
      }

      finalSelection.push(song);
    }

    return NextResponse.json(finalSelection);

  } catch (err) {
    console.error('Error generating recommendation:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
