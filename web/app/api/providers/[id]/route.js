import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(_, { params }) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('provider')
    .select('id,name,service_type,city,photo_url,visibility')
    .eq('id', params.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}


