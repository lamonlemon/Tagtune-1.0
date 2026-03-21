import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { 
      seed_song_index, 
      primary_genre_id, 
      language, 
      cover_filter, // 'both', 'cover', 'original'
      sub_genre_id, 
      count = 20, 
      regenerate = false,
      artist_id,
      feat_artist_id,
      prod_artist_id,
      group_id
    } = req.body;

    // Step 1: Hard filters using Supabase query
    let query = supabase
      .from('songs')
      .select(`
        song_index, title, url, language, release_year, original_song_id, group_id, album_id,
        artists!songs_artist_id_fkey ( artist_id, name ),
        song_featuring ( artist_id ),
        song_producers ( artist_id ),
        song_genres (
          primary_genre_id, sub_genre_id, micro_genre_id
        )
      `);
      
    if (primary_genre_id) {
      query = query.eq('song_genres.primary_genre_id', primary_genre_id);
    }

    if (language) {
      query = query.eq('language', language);
    }
    
    if (seed_song_index) {
       query = query.neq('song_index', seed_song_index);
    }

    const { data: filterResults, error: filterError } = await query;

    if (filterError) {
      console.error('Error querying DB:', filterError);
      return res.status(500).json({ error: 'Database error' });
    }

    // Filter cover/original purely in JS since Supabase filters on joined columns can be tricky without RPC
    let candidates = filterResults.filter(s => {
      if (!s.song_genres) return false;

      const isCover = s.original_song_id !== null && s.original_song_id !== s.song_index;
      if (cover_filter === 'cover' && !isCover) return false;
      if (cover_filter === 'original' && isCover) return false;
      return true;
    });

    // We need the seed song to do the scoring
    let seedSong = null;
    if (seed_song_index) {
      const { data } = await supabase
        .from('songs')
        .select(`
          song_index, language, release_year, group_id,
          song_genres (primary_genre_id, sub_genre_id, micro_genre_id)
        `)
        .eq('song_index', seed_song_index)
        .single();
      seedSong = data;
    }

    // Step 2 & 3: Scoring & Deduplication
    let scoredCandidates = candidates.map(s => {
      let score = 0;
      let reasons = [];

      // If seed explicitly requested sub_genre match
      if (sub_genre_id && s.song_genres && s.song_genres.sub_genre_id === sub_genre_id) {
        score += 25;
        reasons.push('Same sub genre');
      }

      // User Selected Tags Scoring
      if (group_id && s.group_id === group_id) {
        score += 30;
        reasons.push('Group (User Tag)');
      }
      if (artist_id) {
        if (s.artists && s.artists.artist_id === artist_id) {
          score += 30;
          reasons.push('Artist (User Tag)');
        } else if (s.song_featuring && s.song_featuring.some(f => f.artist_id === artist_id)) {
          score += 20;
          reasons.push('Featuring (User Tag)');
        }
      }
      if (feat_artist_id && s.song_featuring && s.song_featuring.some(f => f.artist_id === feat_artist_id)) {
        score += 25;
        reasons.push('Featuring (User Tag)');
      }
      if (prod_artist_id && s.song_producers && s.song_producers.some(p => p.artist_id === prod_artist_id)) {
        score += 25;
        reasons.push('Producer (User Tag)');
      }

      if (seedSong) {
        if (seedSong.song_genres?.micro_genre_id && s.song_genres?.micro_genre_id === seedSong.song_genres.micro_genre_id) {
          score += 40;
          reasons.push('Same micro genre');
        } else if (!sub_genre_id && seedSong.song_genres?.sub_genre_id && s.song_genres?.sub_genre_id === seedSong.song_genres.sub_genre_id) {
          score += 25;
          reasons.push('Same sub genre');
        } else if (seedSong.song_genres?.primary_genre_id && s.song_genres?.primary_genre_id === seedSong.song_genres.primary_genre_id) {
          score += 10;
          reasons.push('Same primary genre');
        }

        if (!group_id && seedSong.group_id && s.group_id === seedSong.group_id) {
          score += 15;
          reasons.push('Same artist group');
        }
        if (seedSong.language && s.language === seedSong.language) {
          score += 10;
          reasons.push('Same language');
        }
        // Same decade
        if (seedSong.release_year && s.release_year) {
          const seedDecade = Math.floor(seedSong.release_year / 10) * 10;
          const sDecade = Math.floor(s.release_year / 10) * 10;
          if (seedDecade === sDecade) {
            score += 5;
            reasons.push('Same release decade');
          }
        }
      }

      // Add cover reason
      const isCover = s.original_song_id !== null && s.original_song_id !== s.song_index;
      if (isCover) reasons.push('Cover song');

      if (reasons.length === 0) reasons.push('Tag match');

      return {
        song_index: s.song_index,
        title: s.title,
        artist_name: s.artists?.name || 'Unknown',
        url: s.url,
        language: s.language,
        is_cover: isCover,
        score,
        match_reasons: reasons,
        album_id: s.album_id // for deduplication later
      };
    });

    // Sort by score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Take top 50
    let top50 = scoredCandidates.slice(0, 50);

    // Shuffle top 50 if regenerate
    if (regenerate) {
       top50 = top50.sort(() => Math.random() - 0.5);
    }

    // Deduplicate (max 2 per artist, max 2 per album)
    const artistCounts = {};
    const albumCounts = {};
    const finalSelection = [];

    for (let song of top50) {
      if (finalSelection.length >= count) break;
      
      artistCounts[song.artist_name] = (artistCounts[song.artist_name] || 0) + 1;
      if (song.album_id) {
        albumCounts[song.album_id] = (albumCounts[song.album_id] || 0) + 1;
      }

      if (artistCounts[song.artist_name] > 2) continue;
      if (song.album_id && albumCounts[song.album_id] > 2) continue;

      finalSelection.push(song);
    }

    res.json(finalSelection);

  } catch (err) {
    console.error('Error generating recommendation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
