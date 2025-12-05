import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

/**
 * POST /api/track-event
 * Generic analytics event tracking endpoint
 *
 * Used for:
 * - results_viewed - When someone views their results page
 * - share_clicked - When someone clicks a share button
 * - cta_clicked - When someone clicks a CTA
 * - recommendation_checked - When someone checks off a recommendation
 *
 * Events are stored for funnel analysis and optimization
 */

interface TrackEventBody {
  event: string;
  referralCode?: string;
  metadata?: Record<string, any>;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: TrackEventBody = await request.json();
    const { event, referralCode, metadata } = body;

    // Validate required fields
    if (!event) {
      return new Response(
        JSON.stringify({ error: 'Event name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate event name (whitelist approach for security)
    const allowedEvents = [
      'results_viewed',
      'share_clicked',
      'cta_clicked',
      'recommendation_checked',
      'assessment_started',
      'assessment_abandoned',
      'email_captured',
      'landing_page_viewed',
      'question_answered',
      'referral_link_copied'
    ];

    if (!allowedEvents.includes(event)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert event into analytics table
    // Note: This assumes an 'events' table exists. If not, we log to console
    // and return success to not break the UX
    const { error } = await supabase
      .from('events')
      .insert({
        event_name: event,
        referral_code: referralCode || null,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      // If table doesn't exist yet, just log it
      if (error.code === '42P01') {
        console.log(`[Analytics] ${event}`, { referralCode, metadata });
      } else {
        console.error('Event tracking error:', error);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Track event error:', err);
    // Always return success to not break UX
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
