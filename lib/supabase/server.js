import { createClient } from '@supabase/supabase-js';

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceRole) {
    console.warn('Missing Supabase environment variables, using fallback client');
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
  }
  
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}


