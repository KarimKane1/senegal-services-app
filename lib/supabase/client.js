// Conditional import to avoid build-time issues
let createClient;
let supabaseBrowser;

// Only import and initialize in browser environment
if (typeof window !== 'undefined') {
  try {
    const { createClient: createClientFn } = require('@supabase/supabase-js');
    createClient = createClientFn;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } else {
      // Create fallback client
      supabaseBrowser = createClient(
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
    }
  } catch (error) {
    console.warn('Error creating Supabase client:', error);
    // Create minimal fallback
    supabaseBrowser = {
      auth: { updateUser: () => Promise.resolve({ data: { user: null }, error: null }) },
      from: () => ({ update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) })
    };
  }
} else {
  // Server-side fallback
  supabaseBrowser = {
    auth: { updateUser: () => Promise.resolve({ data: { user: null }, error: null }) },
    from: () => ({ update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) })
  };
}

export { supabaseBrowser };


