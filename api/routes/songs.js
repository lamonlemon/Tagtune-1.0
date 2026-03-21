import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { video_id } = req.query;

    if (!video_id) {
      return res.status(400).json({ error: 'Missing video_id' });
    }

    const targetUrl = `https://music.youtube.com/watch?v=${video_id}`;
    const altTargetUrl = `https://youtube.com/watch?v=${video_id}`; // Just in case

    // Lookup song
    const { data: song, error: songError } = await supabase
      .from('songs')
      .select(`
        song_index, title, original_song_id, artist_id, group_id,
        language, release_year, url,
        song_featuring ( artist_id ),
        song_producers ( artist_id ),
        artists!songs_artist_id_fkey ( name ),
        song_genres (
          primary_genre_id, sub_genre_id, micro_genre_id
        )
      `)
      .or(`url.eq.${targetUrl},url.eq.${altTargetUrl}`)
      .single();

    if (songError || !song) {
      console.log('Song not found in DB:', video_id, songError);
      return res.status(404).json({ error: 'Song not found in database. Please ask the user for another link.' });
    }

    // Determine derived properties
    const is_cover = song.original_song_id !== null && song.original_song_id !== song.song_index;
    const { primary_genre_id, sub_genre_id, micro_genre_id } = song.song_genres || {};

    res.json({
      song_index: song.song_index,
      title: song.title,
      artist_name: song.artists?.name || 'Unknown Artist',
      artist_id: song.artist_id,
      group_id: song.group_id,
      song_featuring: song.song_featuring || [],
      song_producers: song.song_producers || [],
      url: song.url,
      thumbnail: `https://img.youtube.com/vi/${video_id}/hqdefault.jpg`,
      is_cover,
      language: song.language,
      primary_genre_id,
      sub_genre_id,
      micro_genre_id
    });
  } catch (err) {
    console.error('Error fetching song:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
