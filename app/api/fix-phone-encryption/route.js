import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase/server';
import crypto from 'crypto';

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
  
  try {
    const keyHex = process.env.ENCRYPTION_KEY_HEX;
    if (!keyHex || keyHex.length !== 64) return null;
    
    const key = Buffer.from(keyHex, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(e164, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, ciphertext]).toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

export async function POST() {
  try {
    const supabase = supabaseServer();
    
    // Get all providers that have phone_hash but need phone_enc fixed
    const { data: providers, error } = await supabase
      .from('provider')
      .select('id,phone_hash,phone_enc')
      .not('phone_hash', 'is', null);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`Found ${providers.length} providers to fix`);
    
    // Get all users with phone numbers
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id,phone_e164')
      .not('phone_e164', 'is', null);
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    
    console.log(`Found ${users.length} users with phone numbers`);
    
    let fixed = 0;
    let errors = 0;
    
    // For each provider, try to find matching phone number and re-encrypt
    for (const provider of providers) {
      try {
        // Find matching user by phone hash
        let matchingPhone = null;
        for (const user of users) {
          if (user.phone_e164) {
            const hash = hashPhoneE164(user.phone_e164);
            if (hash === provider.phone_hash) {
              matchingPhone = user.phone_e164;
              break;
            }
          }
        }
        
        if (matchingPhone) {
          // Re-encrypt the phone number properly
          const encryptedHex = encryptPhone(matchingPhone);
          if (encryptedHex) {
            const { error: updateError } = await supabase
              .from('provider')
              .update({ phone_enc: `\\x${encryptedHex}` })
              .eq('id', provider.id);
            
            if (updateError) {
              console.error(`Error updating provider ${provider.id}:`, updateError);
              errors++;
            } else {
              console.log(`Fixed provider ${provider.id} with phone ${matchingPhone}`);
              fixed++;
            }
          } else {
            console.error(`Failed to encrypt phone for provider ${provider.id}`);
            errors++;
          }
        } else {
          console.log(`No matching phone found for provider ${provider.id}`);
          errors++;
        }
      } catch (error) {
        console.error(`Error processing provider ${provider.id}:`, error);
        errors++;
      }
    }
    
    return NextResponse.json({
      message: 'Phone encryption fix completed',
      total: providers.length,
      fixed,
      errors
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
