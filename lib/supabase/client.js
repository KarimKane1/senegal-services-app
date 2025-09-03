// Minimal fallback client to avoid build-time issues
const createFallbackClient = () => ({
  auth: {
    updateUser: (data) => Promise.resolve({ data: { user: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: (credentials) => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (callback) => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: (table) => ({
    select: (columns) => ({
      eq: (column, value) => ({
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null })
      }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      single: () => Promise.resolve({ data: null, error: null })
    }),
    insert: (data) => Promise.resolve({ data: null, error: null }),
    update: (data) => ({
      eq: (column, value) => Promise.resolve({ data: null, error: null })
    }),
    delete: () => ({
      eq: (column, value) => Promise.resolve({ data: null, error: null })
    })
  })
});

// Initialize with fallback - will be replaced in browser
let supabaseBrowser = createFallbackClient();

// Only initialize real client in browser environment
if (typeof window !== 'undefined') {
  try {
    const { createClient } = require('@supabase/supabase-js');
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
    }
  } catch (error) {
    console.warn('Error creating Supabase client, using fallback:', error);
  }
}

export { supabaseBrowser };


