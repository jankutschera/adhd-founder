import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { calculateScore, getScoreBreakdown } from '../../lib/scoring';
import { getCategoryByScore } from '../../lib/categories';
import { nanoid } from 'nanoid';

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
    const body = await request.json();
    const { email, answers, referredBy } = body;

    // Validate required fields
    if (!email || !answers) {
      return new Response(
        JSON.stringify({ error: 'Email and answers are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate score
    const score = calculateScore(answers);
    const breakdown = getScoreBreakdown(answers);
    const category = getCategoryByScore(score);

    // Generate unique referral code
    const referralCode = nanoid(8);

    // Save to Supabase (if configured)
    if (supabase) {
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
        // Continue anyway - we still want to show results
      }

      // Update referral conversion if referred by someone
      if (referredBy) {
        await supabase
          .from('referral_clicks')
          .insert({
            referral_code: referredBy,
            converted: true
          });
      }
    } else {
      console.warn('Supabase not configured - assessment not saved to database');
    }

    // Send results email (non-blocking)
    sendResultsEmail(email, score, category, referralCode).catch(console.error);

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
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
