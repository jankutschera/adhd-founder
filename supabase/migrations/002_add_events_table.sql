-- Events table for analytics tracking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  referral_code TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries by event type
CREATE INDEX IF NOT EXISTS idx_events_event_name ON events(event_name);

-- Index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_events_referral_code ON events(referral_code);

-- Index for time-based queries (analytics dashboards)
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Row level security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous event inserts" ON events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users can read events
CREATE POLICY "Authenticated users can read events" ON events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Comment for documentation
COMMENT ON TABLE events IS 'Analytics events for the Dopamine ROI Calculator';
