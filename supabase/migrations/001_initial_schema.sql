-- Dopamine ROI Calculator - Initial Schema
-- Run this in Supabase SQL Editor

-- Assessments table for storing quiz results
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  score_breakdown JSONB,
  category TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assessments_email ON assessments(email);
CREATE INDEX IF NOT EXISTS idx_assessments_referral_code ON assessments(referral_code);
CREATE INDEX IF NOT EXISTS idx_assessments_referred_by ON assessments(referred_by);
CREATE INDEX IF NOT EXISTS idx_assessments_category ON assessments(category);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);

-- Referral clicks tracking
CREATE TABLE IF NOT EXISTS referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL,
  converted BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for referral lookups
CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(referral_code);

-- Row level security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;

-- Policies for assessments
-- Allow anonymous inserts (users can submit assessments)
CREATE POLICY "Allow anonymous assessment inserts" ON assessments
  FOR INSERT
  WITH CHECK (true);

-- Allow reading own assessment by referral code (for results page)
CREATE POLICY "Allow reading by referral code" ON assessments
  FOR SELECT
  USING (true);

-- Policies for referral_clicks
-- Allow anonymous inserts (tracking clicks)
CREATE POLICY "Allow anonymous referral click inserts" ON referral_clicks
  FOR INSERT
  WITH CHECK (true);

-- Allow reading for stats
CREATE POLICY "Allow reading referral clicks" ON referral_clicks
  FOR SELECT
  USING (true);

-- Comments for documentation
COMMENT ON TABLE assessments IS 'Stores Dopamine ROI assessment results and user data';
COMMENT ON TABLE referral_clicks IS 'Tracks referral link clicks and conversions';
