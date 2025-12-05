import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

// Create Supabase client (only if env vars are set)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface AssessmentRecord {
  id?: string;
  email: string;
  answers: Record<string, any>;
  score: number;
  category: string;
  referral_code: string;
  referred_by?: string;
  created_at?: string;
}

/**
 * Save assessment to database
 */
export async function saveAssessment(data: AssessmentRecord): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    console.warn('Supabase not configured - assessment not saved to database');
    return { success: true }; // Graceful degradation
  }

  const { error } = await supabase
    .from('assessments')
    .insert([data]);

  if (error) {
    console.error('Error saving assessment:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Track referral click
 */
export async function trackReferralClick(referralCode: string): Promise<void> {
  if (!supabase) return;

  await supabase
    .from('referral_clicks')
    .insert([{ referral_code: referralCode }]);
}

/**
 * Get referral stats
 */
export async function getReferralStats(referralCode: string): Promise<{ clicks: number; conversions: number }> {
  if (!supabase) {
    return { clicks: 0, conversions: 0 };
  }

  const [clicksResult, conversionsResult] = await Promise.all([
    supabase
      .from('referral_clicks')
      .select('id', { count: 'exact' })
      .eq('referral_code', referralCode),
    supabase
      .from('assessments')
      .select('id', { count: 'exact' })
      .eq('referred_by', referralCode),
  ]);

  return {
    clicks: clicksResult.count || 0,
    conversions: conversionsResult.count || 0,
  };
}
