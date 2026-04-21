import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from "@/auth"

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const video_id = searchParams.get('video_id');

    if (!video_id) {
      return NextResponse.json({ error: 'Missing video_id' }, { status: 400 });
    }

    const targetUrl = `https://music.youtube.com/watch?v=${video_id}`;
    const altTargetUrl = `https://youtube.com/watch?v=${video_id}`;

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
      return NextResponse.json({ error: 'Song not found in database. Please ask the user for another link.' }, { status: 404 });
    }

    const is_cover = song.original_song_id !== null && song.original_song_id !== song.song_index;
    const { primary_genre_id, sub_genre_id, micro_genre_id } = song.song_genres || {};

    return NextResponse.json({
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
