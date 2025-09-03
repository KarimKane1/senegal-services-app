-- Create events table for analytics tracking
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  event_type text NOT NULL CHECK (event_type IN ('signup', 'search', 'provider_view', 'contact_click', 'recommendation_create', 'connection_request', 'admin_login')),
  event_payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert their own events
CREATE POLICY "Users can insert their own events" ON events
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Allow service role to insert any events (for server-side tracking)
CREATE POLICY "Service role can insert any events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow service role to read all events (for analytics)
CREATE POLICY "Service role can read all events" ON events
  FOR SELECT USING (auth.role() = 'service_role');

-- Policy: Allow users to read their own events
CREATE POLICY "Users can read their own events" ON events
  FOR SELECT USING (auth.uid()::text = user_id);
