import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../lib/supabase/server';

export async function GET(_req, { params }) {
  const id = params.id;
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('recommendation')
    .select(`
      id,
      created_at,
      note,
      recommender_user_id,
      users!recommender_user_id(id,name,photo_url)
    `)
    .eq('provider_id', id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data || []).map((row) => {
    let qualities = [];
    let watchFor = [];
    const note = row.note || '';
    const likedMatch = note.match(/Liked:\s*([^|]+)/i);
    const watchMatch = note.match(/Watch:\s*([^|]+)/i);
    if (likedMatch && likedMatch[1]) qualities = likedMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    if (watchMatch && watchMatch[1]) watchFor = watchMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    return {
      id: row.users?.id || row.id,
      name: row.users?.name || 'Member',
      location: 'Dakar',
      avatar: row.users?.photo_url || 'https://placehold.co/64x64',
      dateAdded: row.created_at,
      qualities,
      watchFor,
    };
  });

  return NextResponse.json({ items });
}


