import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a real Supabase server client if credentials are available, otherwise use a stub
const createSupabaseServerClient = () => {
  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  
  // Fallback stub client for when credentials are not available
  console.warn('Supabase server credentials not found. Using stub client. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');

  const createStubServerClient = () => {
    const stubResponse = { data: null, error: null };
    const stubArrayResponse = { data: [], error: null };

    const queryMethods = () => ({
      eq: (column, value) => queryMethods(),
      neq: (column, value) => queryMethods(),
      gt: (column, value) => queryMethods(),
      gte: (column, value) => queryMethods(),
      lt: (column, value) => queryMethods(),
      lte: (column, value) => queryMethods(),
      like: (column, value) => queryMethods(),
      ilike: (column, value) => queryMethods(),
      is: (column, value) => queryMethods(),
      in: (column, value) => queryMethods(),
      contains: (column, value) => queryMethods(),
      containedBy: (column, value) => queryMethods(),
      rangeGt: (column, value) => queryMethods(),
      rangeGte: (column, value) => queryMethods(),
      rangeLt: (column, value) => queryMethods(),
      rangeLte: (column, value) => queryMethods(),
      rangeAdjacent: (column, value) => queryMethods(),
      overlaps: (column, value) => queryMethods(),
      textSearch: (column, value) => queryMethods(),
      match: (query) => queryMethods(),
      not: (column, operator, value) => queryMethods(),
      or: (filters) => queryMethods(),
      filter: (column, operator, value) => queryMethods(),
      order: (column, options) => queryMethods(),
      limit: (count) => queryMethods(),
      range: (from, to) => queryMethods(),
      abortSignal: (signal) => queryMethods(),
      maybeSingle: () => Promise.resolve(stubResponse),
      single: () => Promise.resolve(stubResponse),
      select: (columns, options) => queryMethods(),
    });
    
    return {
      auth: {
        getUser: (token) => Promise.resolve(stubResponse),
        signInWithPassword: (credentials) => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signInWithOAuth: (options) => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signInWithOtp: (options) => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signUp: (options) => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve(stubResponse),
        refreshSession: () => Promise.resolve(stubResponse),
      },
      from: (table) => ({
        select: (columns, options) => queryMethods(),
        insert: (data, options) => queryMethods(),
        update: (data, options) => queryMethods(),
        upsert: (data, options) => queryMethods(),
        delete: (options) => queryMethods(),
        rpc: (fn, params) => Promise.resolve(stubResponse),
      }),
      rpc: (fn, params) => Promise.resolve(stubResponse),
      storage: {
        from: (bucket) => ({
          upload: (path, file, options) => Promise.resolve(stubResponse),
          download: (path) => Promise.resolve(stubResponse),
          remove: (paths) => Promise.resolve(stubResponse),
          list: (path, options) => Promise.resolve(stubResponse),
          getPublicUrl: (path) => ({ data: { publicUrl: '' } }),
          createSignedUrl: (path, expiresIn) => Promise.resolve(stubResponse),
          createSignedUrls: (paths, expiresIn) => Promise.resolve(stubResponse),
        }),
      },
      realtime: {
        channel: (name) => ({
          on: (event, filter, callback) => ({ unsubscribe: () => {} }),
          subscribe: (callback) => ({ unsubscribe: () => {} }),
          send: (event, payload) => Promise.resolve(stubResponse),
        }),
        removeChannel: (channel) => Promise.resolve(stubResponse),
        removeAllChannels: () => Promise.resolve(stubResponse),
      },
    };
  };

  return createStubServerClient();
};

export function supabaseServer() {
  return createSupabaseServerClient();
}