// Complete mock client for build-time safety
const createMockClient = () => ({
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

// Always use mock client during build time
let supabaseBrowser = createMockClient();

// Only attempt to load real client in browser environment
if (typeof window !== 'undefined') {
  // This will only run in browser, never during build
  try {
    // Use dynamic import to prevent bundling during build
    import('@supabase/supabase-js').then(({ createClient }) => {
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
    }).catch(() => {
      // Keep mock client on error
    });
  } catch (error) {
    // Keep mock client on any error
  }
}

export { supabaseBrowser };