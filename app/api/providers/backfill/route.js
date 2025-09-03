import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase/server';
import crypto from 'crypto';

function normalizePhone(input) {
  if (!input) return '';
  const trimmed = String(input).replace(/\s+/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  return `+221${trimmed.replace(/[^0-9]/g, '')}`;
}

export async function POST() {
  const supabase = supabaseServer();
  // 1) Add phone_e164 column if missing
  try {
    await supabase.rpc('noop');
  } catch {}
  try {
    // Use SQL via service role
    await supabase.query?.(`alter table if exists provider add column if not exists phone_e164 text`);
  } catch {}

  // 2) Load all providers
  const { data: providers, error } = await supabase.from('provider').select('id,phone_enc,phone_hash,phone_e164');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const keyHex = process.env.ENCRYPTION_KEY_HEX;
  const encrypt = (e164) => {
    try {
      if (keyHex && keyHex.length === 64) {
        const key = Buffer.from(keyHex, 'hex');
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const ciphertext = Buffer.concat([cipher.update(e164, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return `\\x${Buffer.concat([iv, tag, ciphertext]).toString('hex')}`;
      }
      return `\\x${Buffer.from(e164, 'utf8').toString('hex')}`;
    } catch {
      return null;
    }
  };

  const saltHex = process.env.ENCRYPTION_KEY_HEX || '';
  const salt = Buffer.from(saltHex, 'hex');
  const prefix = salt.length ? salt : Buffer.from('jokko-default-salt');
  const hashPhone = (e164) => crypto.createHash('sha256').update(Buffer.concat([prefix, Buffer.from(e164)])).digest('hex');

  // 3) Build hash->phone from users
  const { data: users } = await supabase.from('users').select('phone_e164').not('phone_e164','is',null);
  const hashToPhone = new Map();
  for (const u of users || []) {
    const e164 = normalizePhone(u.phone_e164);
    hashToPhone.set(hashPhone(e164), e164);
  }

  let updated = 0;
  for (const p of providers || []) {
    const already = p.phone_e164 && p.phone_e164.trim();
    let e164 = already || (hashToPhone.get(p.phone_hash) || '');
    if (!e164) continue;
    e164 = normalizePhone(e164);
    const enc = encrypt(e164);
    try {
      await supabase.from('provider').update({ phone_e164: e164, phone_enc: enc }).eq('id', p.id);
      updated += 1;
    } catch {}
  }

  return NextResponse.json({ updated });
}


