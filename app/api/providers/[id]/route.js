import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase/server';
import crypto from 'crypto';

function decryptPhone(hex) {
  try {
    const keyHex = process.env.ENCRYPTION_KEY_HEX;
    if (!keyHex || keyHex.length !== 64 || !hex) return null;
    const buf = Buffer.from(hex, 'hex');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const key = Buffer.from(keyHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf8');
  } catch (error) {
    console.error('Decrypt phone error:', error);
    return null;
  }
}

function byteaToHex(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const trimmed = value.startsWith('\\x') ? value.slice(2) : value;
    return trimmed;
  }
  try {
    return Buffer.from(value).toString('hex');
  } catch {
    return null;
  }
}

function decodePhoneFromBytea(byteaVal) {
  const hex = byteaToHex(byteaVal);
  if (!hex) return null;
  // Try AES-GCM first
  try {
    const keyHex = process.env.ENCRYPTION_KEY_HEX;
    if (keyHex && keyHex.length === 64) {
      const buf = Buffer.from(hex, 'hex');
      const iv = buf.subarray(0, 12);
      const tag = buf.subarray(12, 28);
      const ciphertext = buf.subarray(28);
      const key = Buffer.from(keyHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      const phone = plaintext.toString('utf8');
      if (/^\+?\d{6,}$/.test(phone.replace(/\s/g, ''))) return phone;
    }
  } catch {}
  // Fallback to plaintext utf8 stored as hex (dev mode)
  try {
    const s = Buffer.from(hex, 'hex').toString('utf8');
    if (/^\+?\d{6,}$/.test(s.replace(/\s/g, ''))) return s;
  } catch {}
  return null;
}

function maskTail(e164) {
  if (!e164) return '';
  const digits = e164.replace(/\s+/g, '');
  const tail = digits.slice(-3);
  const country = digits.slice(0, 4); // rough
  return `${country} *** ** ${tail}`;
}

function normalizePhone(input) {
  if (!input) return '';
  const trimmed = String(input).replace(/\s+/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  return `+221${trimmed.replace(/[^0-9]/g, '')}`;
}

export async function GET(req, { params }) {
  try {
    const id = params.id;
    const supabase = supabaseServer();
    const { searchParams } = new URL(req.url);
    const any = searchParams.get('any') === '1';
    
    console.log('Provider API called with ID:', id, 'any:', any);
    
    const { data, error } = await supabase
      .from('provider')
      .select('id,name,service_type,city,photo_url,phone_enc,phone_hash,visibility,owner_user_id')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      console.log('Provider not found for ID:', id);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

  console.log('Provider data from database:', {
    id: data.id,
    name: data.name,
    hasPhoneEnc: !!data.phone_enc,
    hasPhoneHash: !!data.phone_hash,
    hasOwnerUserId: !!data.owner_user_id,
    ownerUserId: data.owner_user_id
  });

  // Get phone number - the data is stored as plain hex, not encrypted
  let phoneE164 = '';
  
  if (data.phone_enc) {
    try {
      // Convert bytea to hex string first
      const hex = byteaToHex(data.phone_enc);
      console.log('Phone_enc hex:', hex);
      
      if (hex) {
        // The data is stored as plain hex, not encrypted
        const plaintext = Buffer.from(hex, 'hex').toString('utf8');
        console.log('Decoded phone from hex:', plaintext);
        
        if (plaintext && /^\+?\d{6,}$/.test(plaintext.replace(/\s/g, ''))) {
          phoneE164 = plaintext;
          console.log('Found phone:', phoneE164);
        }
      }
    } catch (error) {
      console.error('Phone decode error:', error);
    }
  }
  
  // If still no phone, try hash-based lookup from users table
  if (!phoneE164 && data.phone_hash) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('phone_e164')
        .not('phone_e164', 'is', null);
      
      if (userData) {
        const makeHash = (e164) => {
          const saltHex = process.env.ENCRYPTION_KEY_HEX || '';
          const salt = Buffer.from(saltHex, 'hex');
          const prefix = salt.length ? salt : Buffer.from('jokko-default-salt');
          return crypto.createHash('sha256').update(Buffer.concat([prefix, Buffer.from(e164)])).digest('hex');
        };
        
        for (const user of userData) {
          if (user.phone_e164) {
            const hash = makeHash(user.phone_e164);
            if (hash === data.phone_hash) {
              phoneE164 = user.phone_e164;
              console.log('Found phone via hash lookup:', phoneE164);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Hash lookup error:', error);
    }
  }
  // Phone lookup complete - no need to persist since we're using hash-based lookup
  const allowed = any || data.visibility === 'public';
  const whatsapp_intent = allowed && phoneE164 ? `https://wa.me/${phoneE164.replace('+', '')}` : null;

  // Aggregate attributes (optional)
  let attributes = [];
  try {
    const { data: votes } = await supabase
      .from('provider_attribute_vote')
      .select('attribute,vote,count:id', { count: 'exact', head: false })
      .eq('provider_id', id);
    if (votes) attributes = votes;
  } catch {}

  // Aggregate sightings and aliases
  let cities = [];
  let aliases = [];
  try {
    const { data: cityRows } = await supabase
      .from('provider_city_sighting')
      .select('city')
      .eq('provider_id', id);
    cities = Array.from(new Set([(data.city || ''), ...((cityRows || []).map(r => r.city || ''))])).filter(Boolean);
    const { data: aliasRows } = await supabase
      .from('provider_name_alias')
      .select('alias')
      .eq('provider_id', id);
    aliases = Array.from(new Set(((aliasRows || []).map(r => r.alias || '')))).filter(Boolean);
  } catch {}

    return NextResponse.json({
      id: data.id,
      name: data.name,
      service_type: data.service_type,
      city: data.city,
      cities,
      aliases,
      photo_url: data.photo_url,
      visibility: data.visibility,
      masked_tail: phoneE164 ? maskTail(phoneE164) : null,
      whatsapp_intent,
      attributes,
    });
  } catch (error) {
    console.error('Provider API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}


export async function PATCH(req, { params }) {
  const id = params.id;
  const supabase = supabaseServer();
  const body = await req.json().catch(() => ({}));
  const { name, city, serviceType, phone } = body || {};

  // Map to enum slug
  const labelToSlug = {
    plumber: 'plumber', cleaner: 'cleaner', nanny: 'nanny', electrician: 'electrician', carpenter: 'carpenter', hair: 'hair', henna: 'henna', chef: 'chef', cook: 'chef'
  };
  const slug = serviceType ? (labelToSlug[String(serviceType).toLowerCase().replace(/[^a-z]+/g, '_')] || null) : null;

  const updates = {};
  if (name) updates.name = name;
  if (city) updates.city = city;
  if (slug) updates.service_type = slug;
  if (phone) {
    const e164 = normalizePhone(phone);
    try {
      const keyHex = process.env.ENCRYPTION_KEY_HEX;
      if (keyHex && keyHex.length === 64) {
        const key = Buffer.from(keyHex, 'hex');
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const ciphertext = Buffer.concat([cipher.update(e164, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        updates.phone_enc = Buffer.concat([iv, tag, ciphertext]);
      }
    } catch {}
  }

  const { error } = await supabase.from('provider').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


