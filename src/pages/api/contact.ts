import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
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

    const resendApiKey = import.meta.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send notification email to info@adhd-founder.com
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; background-color: #0f0f10; color: #d4d4d8; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #fafaf9; font-size: 24px; margin-bottom: 8px;">🔔 New Founder Circle Application</h1>
          <p style="color: #71717a; margin-bottom: 32px;">Someone wants to join the Founder Circle!</p>

          <div style="background: #1c1c1f; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Name</div>
              <div style="font-size: 16px; color: #fafaf9; font-weight: 500;">${name}</div>
            </div>

            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Email</div>
              <a href="mailto:${email}" style="font-size: 16px; color: #b87333; text-decoration: none;">${email}</a>
            </div>

            <div>
              <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Biggest ADHD Challenge</div>
              <div style="font-size: 15px; color: #d4d4d8; line-height: 1.6; background: #18181b; padding: 16px; border-radius: 8px; border-left: 3px solid #b87333;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>

          <a href="mailto:${email}?subject=Re: Your Founder Circle Application" style="display: inline-block; background: #b87333; color: #0f0f10; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">
            Reply to ${name} →
          </a>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #27272a;">
            <p style="color: #52525b; font-size: 13px; margin: 0;">
              This message was sent from the ADHD Founder website contact form.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ADHD Founder <hello@adhd-founder.com>',
        to: ['info@adhd-founder.com'],
        reply_to: email,
        subject: `🔔 Founder Circle Application: ${name}`,
        html: emailHtml,
        tags: [
          { name: 'type', value: 'contact-form' },
          { name: 'source', value: 'founder-circle' }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send message' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send confirmation email to the applicant
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; background-color: #0f0f10; color: #d4d4d8; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto;">
          <h1 style="color: #fafaf9; font-size: 24px; margin-bottom: 8px;">Thanks for reaching out, ${name}! 🧠</h1>
          <p style="color: #a1a1aa; margin-bottom: 24px; line-height: 1.6;">
            I got your Founder Circle application and I'm genuinely excited to read it.
          </p>

          <div style="background: #1c1c1f; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #d4d4d8; margin: 0 0 16px 0; line-height: 1.6;">
              <strong style="color: #fafaf9;">What happens next:</strong>
            </p>
            <ul style="color: #a1a1aa; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>I personally review every application (yes, really)</li>
              <li>If we're a fit, I'll reach out within 48 hours</li>
              <li>We'll schedule a quick chat to see how I can help</li>
            </ul>
          </div>

          <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
            In the meantime, if you haven't taken the <a href="https://adhd-founder.com/dopamine-roi" style="color: #b87333;">Dopamine ROI Calculator</a> yet, it's a great way to understand your energy patterns.
          </p>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #27272a;">
            <p style="color: #fafaf9; margin: 0 0 4px 0; font-weight: 500;">Jan Kutschera</p>
            <p style="color: #71717a; font-size: 13px; margin: 0;">
              Late-diagnosed at 51. Now helping ADHD founders build systems that work with their wiring.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation (non-blocking)
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Jan from ADHD Founder <hello@adhd-founder.com>',
        to: [email],
        subject: 'Got your application! 🎯',
        html: confirmationHtml,
        tags: [
          { name: 'type', value: 'contact-confirmation' }
        ]
      }),
    }).catch(console.error);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
