import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase/server';
// Use stub client to prevent build-time Supabase imports
const createClient = (url, key) => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: null })
    })
  })
});
import crypto from 'crypto';

function normalizePhone(input) {
  if (!input) return '';
  const trimmed = String(input).replace(/\s+/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  // Default to Senegal if country code omitted
  return `+221${trimmed.replace(/[^0-9]/g, '')}`;
}

function hashPhoneE164(e164) {
  const saltHex = process.env.ENCRYPTION_KEY_HEX || '';
  const salt = Buffer.from(saltHex, 'hex');
  const prefix = salt.length ? salt : Buffer.from('jokko-default-salt');
  return crypto.createHash('sha256').update(Buffer.concat([prefix, Buffer.from(e164)])).digest('hex');
}

function encryptPhone(e164) {
  console.log('Encrypting phone:', e164);
  const keyHex = process.env.ENCRYPTION_KEY_HEX;
  if (!keyHex || keyHex.length !== 64) {
    // Dev fallback: store plaintext as hex so it can be retrieved locally
    console.log('Using fallback encryption (UTF-8 hex)');
    try { 
      const result = Buffer.from(e164, 'utf8').toString('hex');
      console.log('Fallback encryption result:', result);
      return result;
    } catch (e) { 
      console.log('Fallback encryption failed:', e.message);
      return null; 
    }
  }
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(e164, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const result = Buffer.concat([iv, tag, ciphertext]).toString('hex');
  console.log('Encrypted phone result:', result);
  return result;
}

function byteaToHex(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    // Postgres bytea often comes back like "\\xabcdef..."
    const trimmed = value.startsWith('\\x') ? value.slice(2) : value;
    return trimmed;
  }
  // Handle Node Buffer JSON shape { type: 'Buffer', data: [...] }
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value.data)) {
      try { return Buffer.from(value.data).toString('hex'); } catch {}
    }
    if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
      try { return Buffer.from(value).toString('hex'); } catch {}
    }
  }
  try {
    return Buffer.from(value).toString('hex');
  } catch {
    return null;
  }
}

function decodePhoneFromBytea(byteaVal) {
  const hex = byteaToHex(byteaVal);
  if (!hex) return '';
  console.log('Decoding phone from bytea, hex:', hex);
  
  // First try AES-GCM decrypt with key
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
      console.log('Decrypted phone:', phone);
      if (/^\+?\d{5,}$/.test(phone.replace(/\s/g, ''))) {
        console.log('Phone validation passed:', phone);
        return phone;
      } else {
        console.log('Phone validation failed for:', phone);
      }
    }
  } catch (e) {
    console.log('Decryption failed:', e.message);
  }
  
  // Fallback: treat stored bytes as UTF-8 phone (dev/non-encrypted storage)
  try {
    const str = Buffer.from(hex, 'hex').toString('utf8');
    console.log('Fallback decoded phone:', str);
    if (/^\+?\d{5,}$/.test(str.replace(/\s/g, ''))) {
      console.log('Fallback phone validation passed:', str);
      return str;
    } else {
      console.log('Fallback phone validation failed for:', str);
    }
  } catch (e) {
    console.log('Fallback decoding failed:', e.message);
  }
  return '';
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { name, serviceType, phone, location, qualities = [], watchFor = [], recommender_user_id } = body || {};

  if (!name || !serviceType || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get the authorization header
  const authHeader = req.headers.get('authorization');
  console.log('Auth header:', authHeader);
  
  if (!authHeader) {
    console.log('No auth header found');
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  // Extract the token
  const token = authHeader.replace('Bearer ', '');
  console.log('Token:', token ? 'Present' : 'Missing');
  
  // Use service role client to verify the token
  const supabase = supabaseServer();
  
  // Verify the JWT token and get user info
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  console.log('User auth result:', { user: user?.id, error: authError });
  
  if (authError || !user) {
    console.error('Authentication error:', authError);
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  // Use the authenticated user's ID
  const userId = user.id;

  const e164 = normalizePhone(phone);
  const phone_hash = hashPhoneE164(e164);
  const phone_enc_hex = encryptPhone(e164);

  // Get the service category ID from the slug
  const { data: category, error: categoryError } = await supabase
    .from('service_categories')
    .select('id')
    .eq('slug', serviceType)
    .eq('is_active', true)
    .single();
  
  if (categoryError || !category) {
    console.log('Invalid service type:', { serviceType, categoryError });
    return NextResponse.json({ error: 'Please select a valid service category' }, { status: 400 });
  }
  
  const service_category_id = category.id;
  
  // Map slug to enum for backward compatibility (database has both columns)
  const slugToEnum = {
    plumber: 'plumber',
    cleaner: 'cleaner',
    nanny: 'nanny',
    electrician: 'electrician',
    carpenter: 'carpenter',
    hair: 'hair',
    henna: 'henna',
    chef: 'chef',
  };
  
  const service_type = slugToEnum[serviceType];
  if (!service_type) {
    console.log('Invalid service type:', { serviceType, slugToEnum });
    return NextResponse.json({ error: 'Please select a valid service category' }, { status: 400 });
  }
  
  console.log('Found category:', { serviceType, service_category_id, service_type });
  const city = location || '';

  // Find or create provider by phone_hash
  const { data: existing, error: findErr } = await supabase
    .from('provider')
    .select('id,service_category_id,service_type,city,name,phone_enc')
    .eq('phone_hash', phone_hash)
    .maybeSingle();
  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });

  let providerId = existing?.id;
  if (!providerId) {
    const { data: created, error: createErr } = await supabase
      .from('provider')
      .insert({
        name,
        service_category_id,
        service_type,
        city,
        phone_hash,
        phone_enc: phone_enc_hex ? `\\x${phone_enc_hex}` : null,
      })
      .select('id')
      .single();
    if (createErr) {
      console.error('Error creating provider:', createErr);
      return NextResponse.json({ error: createErr.message }, { status: 500 });
    }
    providerId = created.id;
  }
  // Ensure provider.phone_enc is set/updated to the latest phone we have
  if (providerId && phone_enc_hex) {
    try {
      await supabase
        .from('provider')
        .update({ phone_enc: phone_enc_hex ? `\\x${phone_enc_hex}` : null })
        .eq('id', providerId);
    } catch {}
  }
  // If provider exists with a generic or different type, update to the more specific one
  if (providerId && service_category_id && existing && existing.service_category_id !== service_category_id) {
    await supabase
      .from('provider')
      .update({ 
        service_category_id, 
        service_type,
        city: city || existing.city || null, 
        name: name || existing.name 
      })
      .eq('id', providerId);
  }

  // Record city sighting (even if same as current city) and potential name alias
  try {
    if (city) {
      await supabase
        .from('provider_city_sighting')
        .insert({ provider_id: providerId, city, source: 'seeker' });
    }
    if (name && existing && name.trim() && name.trim() !== (existing.name || '').trim()) {
      await supabase
        .from('provider_name_alias')
        .upsert({ provider_id: providerId, alias: name.trim(), source: 'seeker' }, { onConflict: 'provider_id,alias' });
    }
  } catch {}

  // Create recommendation (note combines simple text for MVP)
  const noteParts = [];
  if (qualities?.length) noteParts.push(`Liked: ${qualities.join(', ')}`);
  if (watchFor?.length) noteParts.push(`Watch: ${watchFor.join(', ')}`);
  const note = noteParts.join(' | ');

  const { data: rec, error: recErr } = await supabase
    .from('recommendation')
    .insert({ provider_id: providerId, note, recommender_user_id: userId })
    .select('id')
    .single();
  if (recErr) {
    console.error('Error creating recommendation:', recErr);
    return NextResponse.json({ error: recErr.message }, { status: 500 });
  }

  // Also upsert attribute votes so provider cards can aggregate
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
  if (userId) {
    const voteRows = [];
    for (const q of qualities || []) {
      const attr = labelToAttr[q] || null;
      if (attr) voteRows.push({ provider_id: providerId, voter_user_id: userId, attribute: attr, vote: 'like', text: null });
    }
    for (const n of watchFor || []) {
      const attr = labelToAttr[n] || null;
      if (attr) voteRows.push({ provider_id: providerId, voter_user_id: userId, attribute: attr, vote: 'note', text: null });
    }
    if (voteRows.length) {
      await supabase.from('provider_attribute_vote').upsert(voteRows, { onConflict: 'provider_id,voter_user_id,attribute,vote' });
    }
  }

  return NextResponse.json({ id: rec.id, provider_id: providerId });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log('GET /api/recommendations - userId:', userId);
    
    const supabase = supabaseServer();

    let query = supabase
      .from('recommendation')
      .select('id,provider_id,note,phone_e164,provider:provider_id(id,name,service_type,city,phone_enc,owner_user_id,phone_hash)')
      .order('created_at', { ascending: false });
    if (userId) query = query.eq('recommender_user_id', userId);
    
    const { data, error } = await query;
    console.log('Recommendations query result:', { data: data?.length, error });
    
    if (error) {
      console.error('Recommendations query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

  // Build hash->phone map from users to recover phones when provider.phone_enc is empty
  const providerHashesNeeding = Array.from(new Set((data || []).map(r => r.provider?.phone_hash).filter(h => !!h)));
  let hashToPhone = new Map();
  if (providerHashesNeeding.length) {
    try {
      const { data: usersAll } = await supabase.from('users').select('phone_e164').not('phone_e164','is',null);
      const makeHash = (e164) => {
        const saltHex = process.env.ENCRYPTION_KEY_HEX || '';
        const salt = Buffer.from(saltHex, 'hex');
        const prefix = salt.length ? salt : Buffer.from('jokko-default-salt');
        return crypto.createHash('sha256').update(Buffer.concat([prefix, Buffer.from(e164)])).digest('hex');
      };
      for (const u of usersAll || []) {
        const e164 = u.phone_e164;
        if (!e164) continue;
        hashToPhone.set(makeHash(e164), e164);
      }
    } catch {}
  }

  // Batch-fetch fallback phones for providers that have no encrypted phone
  const ownerIdsNeedingFallback = Array.from(
    new Set(
      (data || [])
        .filter((r) => !r.provider?.phone_enc && r.provider?.owner_user_id)
        .map((r) => r.provider.owner_user_id)
    )
  );
  let fallbackPhoneByOwnerId = new Map();
  if (ownerIdsNeedingFallback.length) {
    const { data: owners } = await supabase
      .from('users')
      .select('id,phone_e164')
      .in('id', ownerIdsNeedingFallback);
    for (const o of owners || []) {
      if (o?.id && o?.phone_e164) fallbackPhoneByOwnerId.set(o.id, o.phone_e164);
    }
  }

  // Secondary fallback: map provider.phone_hash to users.phone_e164 via hashing
  const hashesNeedingFallback = Array.from(
    new Set(
      (data || [])
        .filter((r) => !r.provider?.phone_enc && !fallbackPhoneByOwnerId.has(r.provider?.owner_user_id || '') && r.provider?.phone_hash)
        .map((r) => r.provider.phone_hash)
    )
  );
  let phoneByHash = new Map();
  if (hashesNeedingFallback.length) {
    const { data: usersNonNull } = await supabase
      .from('users')
      .select('id,phone_e164')
      .not('phone_e164', 'is', null);
    for (const u of usersNonNull || []) {
      const e164 = u?.phone_e164;
      if (!e164) continue;
      try {
        const h = hashPhoneE164(e164);
        if (hashesNeedingFallback.includes(h)) {
          phoneByHash.set(h, e164);
        }
      } catch {}
    }
  }

  const items = (data || []).map((row) => {
    let qualities = [];
    let watchFor = [];
    const note = row.note || '';
    const likedMatch = note.match(/Liked:\s*([^|]+)/i);
    const watchMatch = note.match(/Watch:\s*([^|]+)/i);
    if (likedMatch && likedMatch[1]) qualities = likedMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    if (watchMatch && watchMatch[1]) watchFor = watchMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    let phone = decodePhoneFromBytea(row.provider?.phone_enc);
    if (!phone && row.phone_e164) {
      phone = normalizePhone(row.phone_e164);
    }
    if (!phone && row.provider?.phone_hash) {
      phone = hashToPhone.get(row.provider.phone_hash) || '';
    }
    // Fallback to users.phone_e164 if provider is owned and no encrypted phone present (batched above)
    if (!phone && row.provider?.owner_user_id) {
      phone = fallbackPhoneByOwnerId.get(row.provider.owner_user_id) || '';
    }
    if (!phone && row.provider?.phone_hash) {
      phone = phoneByHash.get(row.provider.phone_hash) || '';
    }
    // Derive split fields for broader frontend compatibility
    const e164 = phone || '';
    let countryCode = '';
    let localPhone = '';
    if (e164.startsWith('+')) {
      const match = e164.match(/^(\+\d{1,3})(.*)$/);
      if (match) {
        countryCode = match[1];
        localPhone = (match[2] || '').trim();
      }
    }

    const digits = (phone || '').replace(/\D/g, '');
    const whatsapp_intent = digits ? `https://wa.me/${digits}` : null;
    return {
      id: row.id,
      providerId: row.provider?.id || row.provider_id || null,
      name: row.provider?.name || 'Unknown',
      serviceType: row.provider?.service_type || '',
      location: row.provider?.city || '',
      phone,
      phone_e164: e164,
      countryCode,
      phone_local: localPhone,
      whatsapp_intent,
      qualities,
      watchFor,
    };
  });

  return NextResponse.json({ items });
  } catch (error) {
    console.error('GET /api/recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function PATCH(req) {
  const supabase = supabaseServer();
  
  // Get the Authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
  }
  
  // Extract the token
  const token = authHeader.replace('Bearer ', '');
  
  // Verify the JWT token and get user info
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { id, name, phone, location, serviceType, qualities, watchFor } = body;

  if (!id) {
    return NextResponse.json({ error: 'Recommendation ID is required' }, { status: 400 });
  }

  try {
    // First, update the provider information
    console.log('API received phone:', phone);
    const e164 = normalizePhone(phone);
    console.log('Normalized phone:', e164);
    const phone_hash = hashPhoneE164(e164);
    const phone_enc_hex = encryptPhone(e164);

    // Get the service category ID from the name or slug
    let category;
    let categoryError;
    
    // First try to find by slug
    const { data: categoryBySlug, error: errorBySlug } = await supabase
      .from('service_categories')
      .select('id, slug')
      .eq('slug', serviceType)
      .eq('is_active', true)
      .single();
    
    if (categoryBySlug) {
      category = categoryBySlug;
    } else {
      // If not found by slug, try to find by name
      const { data: categoryByName, error: errorByName } = await supabase
        .from('service_categories')
        .select('id, slug')
        .eq('name', serviceType)
        .eq('is_active', true)
        .single();
      
      if (categoryByName) {
        category = categoryByName;
      } else {
        categoryError = errorByName;
      }
    }
    
    if (categoryError || !category) {
      console.log('Service type lookup failed:', { serviceType, categoryError });
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 });
    }
    
    const service_category_id = category.id;
    
    // Map slug to enum for backward compatibility
    const slugToEnum = {
      plumber: 'plumber', cleaner: 'cleaner', nanny: 'nanny', electrician: 'electrician',
      carpenter: 'carpenter', hair: 'hair', henna: 'henna', chef: 'chef', cook: 'chef',
      tech_repair: 'electrician', gardener: 'cleaner', driver: 'other', security: 'other',
      painter: 'other', mechanic: 'other'
    };
    
    const service_type = slugToEnum[category.slug] || 'other';

    // Update the provider
    const { data: recommendation } = await supabase
      .from('recommendation')
      .select('provider_id')
      .eq('id', id)
      .eq('recommender_user_id', user.id)
      .single();

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found or unauthorized' }, { status: 404 });
    }

    const { error: providerError } = await supabase
      .from('provider')
      .update({
        name,
        service_category_id,
        service_type,
        city: location,
        phone_hash,
        phone_enc: phone_enc_hex ? `\\x${phone_enc_hex}` : null,
      })
      .eq('id', recommendation.provider_id);

    if (providerError) {
      console.error('Error updating provider:', providerError);
      return NextResponse.json({ error: providerError.message }, { status: 500 });
    }

    // Update the provider attribute votes (qualities and watchFor)
    // First, delete existing votes for this user and provider
    await supabase
      .from('provider_attribute_vote')
      .delete()
      .eq('provider_id', recommendation.provider_id)
      .eq('voter_user_id', user.id);

    // Add new votes for qualities (liked attributes)
    if (qualities && qualities.length > 0) {
      const qualityVotes = qualities.map(quality => ({
        provider_id: recommendation.provider_id,
        voter_user_id: user.id,
        attribute: quality.toLowerCase().replace(/[^a-z]/g, '_'),
        vote: 'like'
      }));

      const { error: qualityError } = await supabase
        .from('provider_attribute_vote')
        .insert(qualityVotes);

      if (qualityError) {
        console.error('Error updating quality votes:', qualityError);
      }
    }

    // Add new votes for watchFor (negative attributes)
    if (watchFor && watchFor.length > 0) {
      const watchForVotes = watchFor.map(item => ({
        provider_id: recommendation.provider_id,
        voter_user_id: user.id,
        attribute: item.toLowerCase().replace(/[^a-z]/g, '_'),
        vote: 'note'
      }));

      const { error: watchForError } = await supabase
        .from('provider_attribute_vote')
        .insert(watchForVotes);

      if (watchForError) {
        console.error('Error updating watchFor votes:', watchForError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const supabase = supabaseServer();
  const { error } = await supabase.from('recommendation').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


