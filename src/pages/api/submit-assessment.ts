import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { calculateScore, getScoreBreakdown } from '../../lib/scoring';
import { getCategoryByScore } from '../../lib/categories';
import { nanoid } from 'nanoid';

// Kit.com (ConvertKit) v4 API integration
async function subscribeToKit(email: string, score: number, categoryId: string) {
  const kitApiKey = import.meta.env.KIT_API_KEY;

  if (!kitApiKey) {
    console.warn('KIT_API_KEY not configured - skipping Kit subscription');
    return;
  }

  // Map category IDs to Kit tag names
  const categoryTagMap: Record<string, string> = {
    'cash-engine': 'dopamine-roi-cash-engine',
    'delegate-zone': 'dopamine-roi-delegate-zone',
    'kill-zone': 'dopamine-roi-kill-zone',
    'profitable-chaos': 'dopamine-roi-profitable-chaos',
  };

  try {
    // Step 1: Create/update subscriber with custom field
    const subscriberResponse = await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kitApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        fields: {
          dopamine_roi_score: score.toString(),
        },
      }),
    });

    if (!subscriberResponse.ok) {
      const error = await subscriberResponse.text();
      console.error('Kit subscriber error:', error);
      return;
    }

    const subscriberData = await subscriberResponse.json();
    const subscriberId = subscriberData.subscriber?.id;

    if (!subscriberId) {
      console.error('Kit: No subscriber ID returned');
      return;
    }

    // Step 2: Add source tag (dopamine-roi)
    // Note: You need to get the tag ID from Kit dashboard or use tag name endpoint
    // For now, we'll use the tag endpoint that accepts subscriber email
    const sourceTagResponse = await fetch('https://api.kit.com/v4/tags/dopamine-roi/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kitApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
      }),
    });

    if (!sourceTagResponse.ok) {
      console.warn('Kit: Could not add source tag (may need to create it first)');
    }

    // Step 3: Add category tag
    const categoryTag = categoryTagMap[categoryId];
    if (categoryTag) {
      const categoryTagResponse = await fetch(`https://api.kit.com/v4/tags/${categoryTag}/subscribers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kitApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
        }),
      });

      if (!categoryTagResponse.ok) {
        console.warn(`Kit: Could not add category tag ${categoryTag}`);
      }
    }

    console.log(`Kit: Successfully subscribed ${email} with score ${score} and category ${categoryId}`);
  } catch (err) {
    console.error('Kit subscription error:', err);
  }
}

// Email sending via Resend
async function sendResultsEmail(email: string, score: number, category: any, referralCode: string) {
  const resendApiKey = import.meta.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return;
  }

  const resultsUrl = `https://adhd-founder.com/dopamine-roi/results?code=${referralCode}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: system-ui, -apple-system, sans-serif; background-color: #0f0f10; color: #d4d4d8; padding: 40px 20px;">
      <div style="max-width: 500px; margin: 0 auto;">
        <h1 style="color: #fafaf9; font-size: 28px; margin-bottom: 8px;">Your Dopamine ROI Results 🧠</h1>
        <p style="color: #71717a; margin-bottom: 32px;">Here's what we discovered about your entrepreneur brain.</p>

        <div style="background: linear-gradient(135deg, #1c1c1f, #18181b); border: 2px solid ${category.color}; border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center;">
          <div style="font-size: 64px; font-weight: 700; color: ${category.color}; margin-bottom: 8px;">${score}</div>
          <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px;">Dopamine ROI Score</div>

          <div style="display: inline-block; background: ${category.color}; color: #0f0f10; padding: 8px 20px; border-radius: 24px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            ${category.name}
          </div>
        </div>

        <div style="background: #1c1c1f; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #fafaf9; font-size: 18px; margin-bottom: 12px;">${category.tagline}</h2>
          <p style="color: #a1a1aa; line-height: 1.6; margin: 0;">${category.description}</p>
        </div>

        <a href="${resultsUrl}" style="display: block; background: #b87333; color: #0f0f10; text-align: center; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-decoration: none; margin-bottom: 24px;">
          View Full Results & Action Plan →
        </a>

        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #27272a;">
          <p style="color: #52525b; font-size: 13px; margin-bottom: 8px;">Built for ADHD entrepreneurs by an ADHD founder</p>
          <p style="color: #3f3f46; font-size: 12px; margin: 0;">
            Your unique referral code: <strong style="color: #71717a;">${referralCode}</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ADHD Founder <hello@adhd-founder.com>',
        to: [email],
        subject: `Your Dopamine ROI Score: ${score} (${category.name})`,
        html: emailHtml,
        tags: [
          { name: 'type', value: 'dopamine-roi-results' },
          { name: 'category', value: category.id }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
    }
  } catch (err) {
    console.error('Email send error:', err);
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, answers, referredBy } = body;

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email address is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!answers) {
      return new Response(
        JSON.stringify({ error: 'Assessment answers are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate answers object
    if (typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid assessment data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate score
    let score, breakdown, category;
    try {
      score = calculateScore(answers);
      breakdown = getScoreBreakdown(answers);
      category = getCategoryByScore(score);
    } catch (calcError) {
      console.error('Score calculation error:', calcError);
      return new Response(
        JSON.stringify({ error: 'Failed to calculate results. Please ensure all questions are answered.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique referral code
    const referralCode = nanoid(8);

    // Save to Supabase (if configured)
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('assessments')
          .insert({
            email,
            answers,
            score,
            score_breakdown: breakdown,
            category: category.id,
            referral_code: referralCode,
            referred_by: referredBy || null,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          // Continue anyway - we still want to show results even if DB save fails
          // This ensures the user experience isn't broken by DB issues
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Log but continue - user still gets their results
      }

      // Update referral conversion if referred by someone
      if (referredBy) {
        try {
          await supabase
            .from('referral_clicks')
            .insert({
              referral_code: referredBy,
              converted: true
            });
        } catch (refError) {
          console.error('Referral tracking error:', refError);
          // Continue - don't break user flow for tracking issues
        }
      }
    } else {
      console.warn('Supabase not configured - assessment not saved to database');
    }

    // Send results email via Resend (non-blocking)
    // Failures here don't affect the user experience - they still get their results page
    sendResultsEmail(email, score, category, referralCode).catch(err => {
      console.error('Email sending failed (non-critical):', err);
    });

    // Subscribe to Kit.com for nurture sequences (non-blocking)
    // Failures here don't affect the user experience
    subscribeToKit(email, score, category.id).catch(err => {
      console.error('Kit subscription failed (non-critical):', err);
    });

    return new Response(
      JSON.stringify({
        success: true,
        score,
        category: category.id,
        referralCode,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    console.error('Submit assessment error:', err);

    // Return user-friendly error message
    const errorMessage = err instanceof Error
      ? err.message
      : 'An unexpected error occurred. Please try again.';

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: 'If this problem persists, please contact support.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
