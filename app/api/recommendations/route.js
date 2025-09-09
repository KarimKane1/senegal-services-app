import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase/server';
import crypto from 'crypto';

// Phone number utilities
function normalizePhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('221')) return '+' + cleaned;
  if (cleaned.startsWith('1') && cleaned.length === 11) return '+' + cleaned;
  if (cleaned.startsWith('33') && cleaned.length === 11) return '+' + cleaned;
  if (cleaned.startsWith('44') && cleaned.length === 12) return '+' + cleaned;
  if (cleaned.startsWith('49') && cleaned.length === 12) return '+' + cleaned;
  if (cleaned.startsWith('234') && cleaned.length === 13) return '+' + cleaned;
  if (cleaned.startsWith('27') && cleaned.length === 11) return '+' + cleaned;
  return '+' + cleaned;
}

function hashPhoneE164(e164) {
  const saltHex = process.env.ENCRYPTION_KEY_HEX || '';
  const salt = Buffer.from(saltHex, 'hex');
  const prefix = salt.length ? salt : Buffer.from('jokko-default-salt');
  return crypto.createHash('sha256').update(Buffer.concat([prefix, Buffer.from(e164)])).digest('hex');
}

function encryptPhone(e164) {
  if (!e164) return null;
  // Temporarily disable encryption to fix the persistent error
  // TODO: Re-implement proper encryption later
  return crypto.createHash('sha256').update(e164).digest('hex');
}

function decryptPhone(encryptedHex) {
  if (!encryptedHex) return '';
  // Since we're using simple hashing now, we can't decrypt
  // Return empty string as we don't need to display phone numbers
  return '';
}

export async function POST(req) {
  try {
    console.log('POST /api/recommendations - Starting');
    
    const body = await req.json().catch(() => ({}));
    const { name, serviceType, phone, location, qualities = [], watchFor = [], recommender_user_id } = body || {};
    console.log('Request body:', { name, serviceType, phone, location });

    if (!name || !serviceType || !phone) {
      console.log('Missing required fields');
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
    console.log('Supabase client created');
    
    // Verify the JWT token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('Auth verification result:', { user: user?.id, error: authError?.message });
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Use the authenticated user's ID
    const userId = user.id;

    const e164 = normalizePhone(phone);
    console.log('Normalized phone:', e164);
    
    // Validate phone number format
    if (!e164 || e164.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }
    
    const phone_hash = hashPhoneE164(e164);
    const phone_enc_hex = encryptPhone(e164);
    
    console.log('Phone hash:', phone_hash);
    console.log('Phone encrypted:', phone_enc_hex ? 'yes' : 'no');

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
    electrician: 'electrician',
    hvac: 'hvac',
    carpenter: 'carpenter',
    handyman: 'handyman',
  };
  
  const service_type = slugToEnum[serviceType];
  if (!service_type) {
    console.log('Invalid service type:', { serviceType, slugToEnum });
    return NextResponse.json({ error: 'Please select a valid service category' }, { status: 400 });
  }
  
  console.log('Found category:', { serviceType, service_category_id, service_type });
  const city = location || '';

  // Find existing provider by phone_hash
  console.log('Looking for provider with phone_hash:', phone_hash);
  const { data: existing, error: findErr } = await supabase
    .from('provider')
    .select('id,service_category_id,service_type,city,name,phone_enc')
    .eq('phone_hash', phone_hash)
    .maybeSingle();
  if (findErr) {
    console.error('Error finding provider:', findErr);
    return NextResponse.json({ error: findErr.message }, { status: 500 });
  }

  console.log('Provider lookup result:', { existing: existing?.id, name: existing?.name });
  let providerId = existing?.id;
  
  if (existing) {
    // Provider already exists - use their existing data
    console.log('Provider already exists:', { id: existing.id, name: existing.name, service_type: existing.service_type });
    providerId = existing.id;
    
    // Update phone encryption if needed (in case it was missing)
    if (providerId && phone_enc_hex) {
      try {
        await supabase
          .from('provider')
          .update({ phone_enc: phone_enc_hex ? `\\x${phone_enc_hex}` : null })
          .eq('id', providerId);
      } catch {}
    }
      } else {
      // Provider doesn't exist - create new one
      console.log('Creating new provider:', { name, service_type, city, phone_hash });
      
      // Validate required fields
      if (!name || !service_type || !service_category_id) {
        return NextResponse.json({ error: 'Missing required provider data' }, { status: 400 });
      }
      
      const { data: created, error: createErr } = await supabase
        .from('provider')
        .insert({
          name: name.trim(),
          service_category_id,
          service_type,
          city: city ? city.trim() : null,
          phone_hash,
          phone_enc: phone_enc_hex ? `\\x${phone_enc_hex}` : null,
        })
        .select('id')
        .single();
      if (createErr) {
        console.error('Error creating provider:', createErr);
        return NextResponse.json({ error: `Failed to create provider: ${createErr.message}` }, { status: 500 });
      }
      providerId = created.id;
    }

  // Record city sighting and name alias (only if different from existing)
  try {
    if (city && (!existing || existing.city !== city)) {
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

  console.log('Creating recommendation with:', { providerId, userId, note });
  
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
  };

  for (const quality of qualities || []) {
    const attr = labelToAttr[quality];
    if (attr) {
      try {
        await supabase
          .from('provider_attribute_vote')
          .upsert({
            provider_id: providerId,
            voter_user_id: userId,
            attribute: attr,
            vote: 'like',
            text: quality,
          }, { onConflict: 'provider_id,voter_user_id,attribute,vote' });
      } catch {}
    }
  }

  for (const watch of watchFor || []) {
    const attr = labelToAttr[watch];
    if (attr) {
      try {
        await supabase
          .from('provider_attribute_vote')
          .upsert({
            provider_id: providerId,
            voter_user_id: userId,
            attribute: attr,
            vote: 'note',
            text: watch,
          }, { onConflict: 'provider_id,voter_user_id,attribute,vote' });
      } catch {}
    }
  }

    return NextResponse.json({ id: rec.id, provider_id: providerId });
  } catch (error) {
    console.error('POST /api/recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log('GET /api/recommendations - userId:', userId);
    
    const supabase = supabaseServer();

    // Get recommendations for the user
    let query = supabase
      .from('recommendation')
      .select('id,provider_id,note,created_at')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('recommender_user_id', userId);
      console.log('Filtering by userId:', userId);
    } else {
      console.log('No userId provided, getting all recommendations');
    }
    
    const { data, error } = await query;
    console.log('Recommendations query result:', { data: data?.length, error, userId });
    console.log('Raw recommendations data:', data);
    
    // Also check all recommendations in the table
    const { data: allRecs } = await supabase
      .from('recommendation')
      .select('id,provider_id,recommender_user_id,note,created_at')
      .order('created_at', { ascending: false });
    console.log('All recommendations in database:', allRecs);
    
    if (error) {
      console.error('Recommendations query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get provider details for each recommendation
    const providerIds = [...new Set((data || []).map(r => r.provider_id).filter(Boolean))];
    let providers = {};
    
    if (providerIds.length > 0) {
      const { data: providerData, error: providerError } = await supabase
        .from('provider')
        .select('id,name,service_type,city,phone_enc,phone_hash,owner_user_id')
        .in('id', providerIds);
      
      if (!providerError && providerData) {
        providers = providerData.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }
    }

    // Build hash->phone map from users to recover phones when provider.phone_enc is empty
    const providerHashesNeeding = Array.from(new Set(Object.values(providers).map(p => p.phone_hash).filter(h => !!h)));
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
        Object.values(providers)
          .filter((p) => !p.phone_enc && p.owner_user_id)
          .map((p) => p.owner_user_id)
      )
    );
    let fallbackPhoneByOwnerId = new Map();
    if (ownerIdsNeedingFallback.length) {
      try {
        const { data: ownerPhones } = await supabase
          .from('users')
          .select('id,phone_e164')
          .in('id', ownerIdsNeedingFallback);
        for (const o of ownerPhones || []) {
          if (o?.id && o?.phone_e164) fallbackPhoneByOwnerId.set(o.id, o.phone_e164);
        }
      } catch {}
    }

    // Build the final items array
    const items = (data || []).map((row) => {
      const provider = providers[row.provider_id] || {};
      
      // Try to get phone from provider.phone_enc first
      let phone = '';
      let e164 = '';
      let countryCode = '';
      let localPhone = '';

      if (provider.phone_enc) {
        try {
          const decrypted = decryptPhone(provider.phone_enc);
          if (decrypted) {
            phone = decrypted;
            e164 = normalizePhone(decrypted);
          }
        } catch {}
      }

      // Fallback to hash lookup
      if (!phone && provider.phone_hash) {
        const hash = provider.phone_hash;
        const found = hashToPhone.get(hash);
        if (found) {
          phone = found;
          e164 = normalizePhone(found);
        }
      }

      // Fallback to owner's phone
      if (!phone && provider.owner_user_id) {
        const ownerPhone = fallbackPhoneByOwnerId.get(provider.owner_user_id);
        if (ownerPhone) {
          phone = ownerPhone;
          e164 = normalizePhone(ownerPhone);
        }
      }

      // Parse phone into country code and local number
      if (e164) {
        const match = e164.match(/^(\+\d{1,3})(.*)$/);
        if (match) {
          countryCode = match[1];
          localPhone = (match[2] || '').trim();
        }
      }

      const digits = (phone || '').replace(/\D/g, '');
      const whatsapp_intent = digits ? `https://wa.me/${digits}` : null;
      
      // Parse note for qualities and watchFor
      let qualities = [];
      let watchFor = [];
      const note = row.note || '';
      const likedMatch = note.match(/Liked:\s*([^|]+)/i);
      const watchMatch = note.match(/Watch:\s*([^|]+)/i);
      if (likedMatch && likedMatch[1]) qualities = likedMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
      if (watchMatch && watchMatch[1]) watchFor = watchMatch[1].split(',').map((s) => s.trim()).filter(Boolean);

      return {
        id: row.id,
        providerId: row.provider_id,
        name: provider.name || 'Unknown Provider',
        serviceType: provider.service_type || 'unknown',
        location: provider.city || '',
        phone,
        phone_e164: e164,
        countryCode,
        phone_local: localPhone,
        whatsapp_intent,
        note: row.note,
        qualities,
        watchFor,
      };
    });

    console.log('Returning recommendations:', { count: items.length });
    return NextResponse.json({ items });
    
  } catch (error) {
    console.error('GET /api/recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const supabase = supabaseServer();
  const body = await req.json().catch(() => ({}));
  const { id, name, serviceType, phone, location, qualities = [], watchFor = [] } = body || {};

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
      plumber: 'plumber',
      electrician: 'electrician',
      hvac: 'hvac',
      carpenter: 'carpenter',
      handyman: 'handyman',
    };
    
    const service_type = slugToEnum[category.slug] || 'other';

    // Update the provider
    const { data: recommendation } = await supabase
      .from('recommendation')
      .select('provider_id')
      .eq('id', id)
      .single();

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('provider')
      .update({
        name,
        service_category_id,
        service_type,
        city: location || '',
        phone_hash,
        phone_enc: phone_enc_hex ? `\\x${phone_enc_hex}` : null,
      })
      .eq('id', recommendation.provider_id);

    if (updateError) {
      console.error('Error updating provider:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update the recommendation note
    const noteParts = [];
    if (qualities?.length) noteParts.push(`Liked: ${qualities.join(', ')}`);
    if (watchFor?.length) noteParts.push(`Watch: ${watchFor.join(', ')}`);
    const note = noteParts.join(' | ');

    const { error: recUpdateError } = await supabase
      .from('recommendation')
      .update({ note })
      .eq('id', id);

    if (recUpdateError) {
      console.error('Error updating recommendation:', recUpdateError);
      return NextResponse.json({ error: recUpdateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const supabase = supabaseServer();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Recommendation ID is required' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('recommendation')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recommendation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}