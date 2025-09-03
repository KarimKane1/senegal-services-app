import { createClient } from '@supabase/supabase-js';

// Create a fallback client for build time
const createFallbackClient = () => {
  return createClient(
    'https://placeholder.supabase.co',
    'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
};

// Initialize client immediately but with error handling
let supabaseBrowser;

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables, using fallback client');
    supabaseBrowser = createFallbackClient();
  } else {
    supabaseBrowser = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
} catch (error) {
  console.warn('Error creating Supabase client, using fallback:', error);
  supabaseBrowser = createFallbackClient();
}

export { supabaseBrowser };


