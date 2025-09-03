// Pure stub server client - no Supabase imports at all during build
// This prevents any Supabase code from running during static generation

const createStubServerClient = () => {
  const stubResponse = { data: null, error: null };
  const stubArrayResponse = { data: [], error: null };
  
  return {
    auth: {
      getUser: () => Promise.resolve(stubResponse),
      signInWithPassword: (credentials) => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: (table) => ({
      select: (columns, options) => ({
        eq: (column, value) => ({
          maybeSingle: () => Promise.resolve(stubResponse),
          single: () => Promise.resolve(stubResponse)
        }),
        maybeSingle: () => Promise.resolve(stubResponse),
        single: () => Promise.resolve(stubResponse)
      }),
      insert: (data) => ({
        select: () => ({
          single: () => Promise.resolve(stubResponse)
        }),
        single: () => Promise.resolve(stubResponse)
      }),
      update: (data) => ({
        eq: (column, value) => ({
          select: () => ({
            single: () => Promise.resolve(stubResponse)
          }),
          single: () => Promise.resolve(stubResponse)
        })
      }),
      delete: () => ({
        eq: (column, value) => Promise.resolve(stubResponse)
      })
    })
  };
};

// Always use stub client - no real Supabase during build
export function supabaseServer() {
  return createStubServerClient();
}