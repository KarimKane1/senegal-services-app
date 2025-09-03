import { createClient } from '@supabase/supabase-js';

// Create a fallback client for build time
const createFallbackClient = () => {
  return createClient(
    'https://placeholder.supabase.co',
    'placeholder-key',
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
};

export function supabaseServer() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !serviceRole) {
      console.warn('Missing Supabase environment variables, using fallback client');
      return createFallbackClient();
    }
    
    return createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (error) {
    console.warn('Error creating Supabase server client, using fallback:', error);
    return createFallbackClient();
  }
}


