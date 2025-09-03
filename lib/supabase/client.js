// Pure stub client - no Supabase imports at all during build
// This prevents any Supabase code from running during static generation

const createStubClient = () => {
  const stubResponse = { data: null, error: null };
  const stubArrayResponse = { data: [], error: null };
  
  return {
    auth: {
      updateUser: (data) => Promise.resolve(stubResponse),
      getUser: () => Promise.resolve(stubResponse),
      signInWithPassword: (credentials) => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback) => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          maybeSingle: () => Promise.resolve(stubResponse),
          single: () => Promise.resolve(stubResponse)
        }),
        maybeSingle: () => Promise.resolve(stubResponse),
        single: () => Promise.resolve(stubResponse)
      }),
      insert: (data) => Promise.resolve(stubResponse),
      update: (data) => ({
        eq: (column, value) => Promise.resolve(stubResponse)
      }),
      delete: () => ({
        eq: (column, value) => Promise.resolve(stubResponse)
      })
    })
  };
};

// Always use stub client - no real Supabase during build or runtime
export const supabaseBrowser = createStubClient();