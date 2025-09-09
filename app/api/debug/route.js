import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase/server';

export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Check environment variables
    const envCheck = {
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY_HEX,
      encryptionKeyLength: process.env.ENCRYPTION_KEY_HEX?.length || 0,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
    
    // Check database connection
    const { data: providerData, error: providerError } = await supabase
      .from('provider')
      .select('id,name,phone_enc,phone_hash,owner_user_id')
      .limit(3);
    
    // Check users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id,phone_e164')
      .not('phone_e164', 'is', null)
      .limit(3);
    
    // Check recommendations
    const { data: recData, error: recError } = await supabase
      .from('recommendation')
      .select('id,provider_id,recommender_user_id,note')
      .limit(3);
    
    return NextResponse.json({
      environment: envCheck,
      database: {
        providers: {
          count: providerData?.length || 0,
          data: providerData,
          error: providerError?.message
        },
        users: {
          count: userData?.length || 0,
          data: userData,
          error: userError?.message
        },
        recommendations: {
          count: recData?.length || 0,
          data: recData,
          error: recError?.message
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
