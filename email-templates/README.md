# ADHD Founder - Kit.com Email Template

Custom HTML email template matching the adhd-founder.com brand for Kit.com.

## Brand Colors

| Color          | Hex       | Usage                    |
|----------------|-----------|--------------------------|
| Charcoal 950   | `#0a0a0a` | Background               |
| Charcoal 900   | `#141414` | Card background          |
| Charcoal 800   | `#1f1f1f` | Borders, dividers        |
| Copper 500     | `#b87333` | Primary CTA, accents     |
| Copper 400     | `#cd8544` | Hover states, highlights |
| Stone 100      | `#f5f2ed` | Primary text             |
| Stone 400      | `#b8a890` | Body text                |
| Stone 500      | `#9c8b70` | Muted text, labels       |

## Template: `kit-email-template.html`

This is a **wrapper template** for Kit.com. It provides:
- Brand header with brain icon
- Dark card container for content
- Styled signature section
- Footer with social links + unsubscribe

**Important:** The template uses `{{ message_content }}` where Kit.com will inject your email content from their editor.

## How to Use in Kit.com

### Step 1: Create Custom Template
1. Go to Kit.com → **Email Templates** (in the left sidebar)
2. Click **+ New template**
3. Choose **HTML** (not Visual)
4. Give it a name like "ADHD Founder Brand"
5. Copy the entire HTML from `kit-email-template.html`
6. Paste into Kit's HTML editor
7. Click **Save**

### Step 2: Use for Broadcasts/Sequences
1. Create a new Broadcast or Sequence email
2. Choose your "ADHD Founder Brand" template
3. Write your content in Kit's visual editor
4. The template styling will wrap your content automatically

## Required Kit.com Variables

These variables are **required** for valid templates:

```liquid
{{ message_content }}           - Where Kit injects your email content (REQUIRED)
{{ unsubscribe_url }}           - Unsubscribe link (REQUIRED)
{{ address }}                   - Physical address (REQUIRED for anti-spam)
```

## Optional Variables

```liquid
{{ subscriber.first_name }}            - Subscriber's first name
{{ subscriber.email_address }}         - Subscriber's email
{{ subscriber_preferences_url }}       - Update preferences link
```

## Custom Fields (for Dopamine ROI)

If you've set up custom fields in Kit.com and want to use them:

```liquid
{{ subscriber.dopamine_roi_score }}    - Their score (0-100)
{{ subscriber.dopamine_roi_category }} - Category name
{{ subscriber.referral_code }}         - Unique referral code
```

Create these in Kit.com → Subscribers → Custom Fields.

## Content Styling

The template automatically styles content written in Kit's editor:
- Paragraphs: Stone-400 color (#b8a890)
- Headings: Stone-100 color (#f5f2ed)
- Links: Copper-500 color (#b87333)
- Bold text: Stone-100 color (#f5f2ed)
- Lists: Properly spaced with Stone-400 color

## Testing

1. Send a test to yourself first
2. Check both Gmail and Outlook
3. Test on mobile (template is responsive)
4. Verify dark mode appearance

## Notes

- Uses `Segoe UI` as the email-safe font (matches Space Grotesk feel)
- Template supports dark mode by default
- MSO conditionals included for Outlook rendering
- Mobile responsive at 600px breakpoint
- Removed standalone sequence templates since Kit.com handles email content via editor
