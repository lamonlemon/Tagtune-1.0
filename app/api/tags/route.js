import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const [genresRes, artistsRes, groupsRes] = await Promise.all([
      supabase.from('genres').select('*').order('name'),
      supabase.from('artists').select('*').order('name'),
      supabase.from('groups').select('*').order('name')
    ]);
    return NextResponse.json({
      genres: genresRes.data || [],
      artists: artistsRes.data || [],
      groups: groupsRes.data || []
    });
  } catch (err) {
    console.error('Failed to fetch tags:', err);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
