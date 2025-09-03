import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../lib/supabase/server';

const labelToAttr = {
  'job_quality': 'job_quality',
  'timeliness': 'timeliness',
  'cleanliness': 'cleanliness',
  'respectfulness': 'respectfulness',
  'reliability': 'reliability',
  'Job quality': 'job_quality',
  'Timeliness': 'timeliness',
  'Clean & Organized': 'cleanliness',
  'Professional': 'respectfulness',
  'Reliable & Trustworthy': 'reliability',
};

export async function POST(req, { params }) {
  const provider_id = params.id;
  const body = await req.json().catch(() => ({}));
  let { attribute, vote, text, user_id } = body || {};
  if (!provider_id || !attribute || !vote || !user_id) {
    return NextResponse.json({ error: 'provider_id, attribute, vote, user_id required' }, { status: 400 });
  }
  const attrEnum = labelToAttr[attribute] || attribute;
  if (!['job_quality', 'timeliness', 'cleanliness', 'respectfulness', 'reliability'].includes(attrEnum)) {
    return NextResponse.json({ error: 'invalid attribute' }, { status: 400 });
  }
  if (!['like', 'note'].includes(vote)) {
    return NextResponse.json({ error: 'invalid vote' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from('provider_attribute_vote')
    .upsert({ provider_id, voter_user_id: user_id, attribute: attrEnum, vote, text: text || null })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


