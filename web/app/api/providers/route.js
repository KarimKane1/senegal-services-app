import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { name, service_type, city = '', phone_hash, phone_enc } = body || {};
  if (!name || !service_type || !phone_hash) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = supabaseServer();
  const { data: exists, error: existsErr } = await supabase
    .from('provider')
    .select('id')
    .eq('phone_hash', phone_hash)
    .maybeSingle();
  if (existsErr) return NextResponse.json({ error: existsErr.message }, { status: 500 });
  if (exists) return NextResponse.json({ id: exists.id, deduped: true }, { status: 200 });

  const { data, error } = await supabase
    .from('provider')
    .insert({
      name,
      service_type,
      city,
      phone_hash,
      phone_enc: phone_enc ? Buffer.from(phone_enc, 'hex') : null,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, deduped: false }, { status: 201 });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const service = searchParams.get('service');
  const city = searchParams.get('city');
  const page = Number(searchParams.get('page') || '1');
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = supabaseServer();
  let query = supabase.from('provider').select('id,name,service_type,city,photo_url');
  if (q) query = query.ilike('name', `%${q}%`);
  if (service) query = query.eq('service_type', service);
  if (city) query = query.eq('city', city);
  query = query.range(from, to);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data, page, pageSize });
}


