import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase/server';
import crypto from 'crypto';

function normalizePhone(input) {
  if (!input) return '';
  const trimmed = String(input).replace(/\s+/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  return `+221${trimmed.replace(/[^0-9]/g, '')}`;
}

function hashPhoneE164(e164) {
  const saltHex = process.env.ENCRYPTION_KEY_HEX || '';
  const salt = Buffer.from(saltHex, 'hex');
  const prefix = salt.length ? salt : Buffer.from('jokko-default-salt');
  return crypto
    .createHash('sha256')
    .update(Buffer.concat([prefix, Buffer.from(e164)])).digest('hex');
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { user_id, phone_e164 } = body || {};
    if (!user_id || !phone_e164) {
      return NextResponse.json({ error: 'user_id and phone_e164 are required' }, { status: 400 });
    }
    const e164 = normalizePhone(phone_e164);
    const phone_hash = hashPhoneE164(e164);
    const supabase = supabaseServer();

    // Find provider by phone hash
    const { data: prov, error: findErr } = await supabase
      .from('provider')
      .select('id,owner_user_id')
      .eq('phone_hash', phone_hash)
      .maybeSingle();
    if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });

    if (!prov) {
      return NextResponse.json({ claimed: false, provider_id: null, recommendationCount: 0 });
    }

    // Claim if unowned
    if (!prov.owner_user_id) {
      await supabase
        .from('provider')
        .update({ owner_user_id: user_id })
        .eq('id', prov.id);
    }

    // Count recommendations for this provider
    const countResponse = await supabase
      .from('recommendation')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', prov.id);
    const count = countResponse?.count || 0;

    return NextResponse.json({ claimed: !prov.owner_user_id, provider_id: prov.id, recommendationCount: count || 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}


