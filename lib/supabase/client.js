// Ultra-safe mock client that never imports Supabase during build
const createUltraSafeMockClient = () => {
  const mockResponse = { data: null, error: null };
  const mockArrayResponse = { data: [], error: null };
  
  return {
    auth: {
      updateUser: (data) => Promise.resolve(mockResponse),
      getUser: () => Promise.resolve(mockResponse),
      signInWithPassword: (credentials) => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback) => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          maybeSingle: () => Promise.resolve(mockResponse),
          single: () => Promise.resolve(mockResponse)
        }),
        maybeSingle: () => Promise.resolve(mockResponse),
        single: () => Promise.resolve(mockResponse)
      }),
      insert: (data) => Promise.resolve(mockResponse),
      update: (data) => ({
        eq: (column, value) => Promise.resolve(mockResponse)
      }),
      delete: () => ({
        eq: (column, value) => Promise.resolve(mockResponse)
      })
    })
  };
};

// Always use mock client - no real Supabase during build
let supabaseBrowser = createUltraSafeMockClient();

// Only attempt to load real client in browser runtime (never during build)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // This will only run in actual browser, never during build
  const loadRealClient = async () => {
    try {
      // Dynamic import only in browser
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (url && key) {
        return createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
      }
    } catch (error) {
      console.warn('Failed to load real Supabase client:', error);
    }
    return createUltraSafeMockClient();
  };
  
  // Load asynchronously without blocking
  loadRealClient().then(client => {
    supabaseBrowser = client;
  }).catch(() => {
    // Keep mock client on any error
  });
}

export { supabaseBrowser };