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

// Lazy initialization to avoid build-time issues
let _supabaseBrowser = null;

export const supabaseBrowser = new Proxy({}, {
  get(target, prop) {
    if (!_supabaseBrowser) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn('Missing Supabase environment variables, using fallback client');
          _supabaseBrowser = createFallbackClient();
        } else {
          _supabaseBrowser = createClient(
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
        _supabaseBrowser = createFallbackClient();
      }
    }
    return _supabaseBrowser[prop];
  }
});


