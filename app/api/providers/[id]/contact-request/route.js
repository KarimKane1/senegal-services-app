import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../lib/supabase/server';

export async function POST(req, { params }) {
  const provider_id = params.id;
  const body = await req.json().catch(() => ({}));
  const { requester_user_id } = body || {};
  if (!requester_user_id) return NextResponse.json({ error: 'requester_user_id required' }, { status: 400 });
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('contact_request')
    .insert({ provider_id, requester_user_id })
    .select('id,status')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}


