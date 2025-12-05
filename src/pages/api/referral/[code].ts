import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

/**
 * POST /api/referral/[code]
 * Tracks when someone clicks a referral link
 *
 * This creates an entry in referral_clicks table to track:
 * - Which referral codes are being shared
 * - Click-through rates for viral loop analysis
 */
export const POST: APIRoute = async ({ params }) => {
  try {
    const { code } = params;

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Referral code is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the referral code exists
    const { data: assessment, error: lookupError } = await supabase
      .from('assessments')
      .select('id')
      .eq('referral_code', code)
      .single();

    if (lookupError || !assessment) {
      // Invalid code - still return 200 to not leak info
      // but don't record the click
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Record the referral click
    const { error: insertError } = await supabase
      .from('referral_clicks')
      .insert({
        referral_code: code,
        converted: false // Will be updated to true if they complete assessment
      });

    if (insertError) {
      console.error('Failed to record referral click:', insertError);
      // Still return success to not break UX
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Referral tracking error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * GET /api/referral/[code]
 * Returns referral statistics for a given code
 *
 * Useful for showing users how many people clicked their link
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { code } = params;

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Referral code is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get click count
    const { count: clickCount, error: clickError } = await supabase
      .from('referral_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('referral_code', code);

    // Get conversion count
    const { count: conversionCount, error: conversionError } = await supabase
      .from('referral_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('referral_code', code)
      .eq('converted', true);

    if (clickError || conversionError) {
      console.error('Referral stats error:', clickError || conversionError);
      return new Response(
        JSON.stringify({ clicks: 0, conversions: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        clicks: clickCount || 0,
        conversions: conversionCount || 0,
        conversionRate: clickCount ? ((conversionCount || 0) / clickCount * 100).toFixed(1) : '0.0'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Referral stats error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
