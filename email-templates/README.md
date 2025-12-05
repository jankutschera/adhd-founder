# ADHD Founder - Kit.com Email Templates

Custom HTML email templates matching the adhd-founder.com brand.

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

## Templates

### 1. `kit-email-template.html`
Base template for any email. Contains:
- Brand header with brain icon
- Editable content area with sample structure
- Highlight box component
- Primary CTA button (Outlook-compatible)
- Signature section
- Footer with social links + unsubscribe

### 2. `kit-welcome-sequence.html`
Ready-to-use welcome email for new subscribers:
- Personal intro from Jan
- "What you'll get" feature list
- CTA to Dopamine ROI Calculator
- Warm, on-brand copywriting

### 3. `kit-dopamine-roi-followup.html`
Follow-up for Dopamine ROI Calculator completers:
- Score recap display
- Category-specific personalization
- Results link with referral code
- Teaser for next email

## How to Use in Kit.com

### Option 1: Custom HTML Email
1. Go to Kit.com → Broadcasts or Sequences
2. Create new email → Choose "HTML"
3. Copy the entire HTML from the template
4. Paste into Kit's HTML editor
5. Edit the content between the marked sections

### Option 2: Visual Editor Starting Point
1. Copy just the inline styles from these templates
2. Apply similar colors in Kit's visual editor:
   - Background: `#0a0a0a`
   - Card: `#141414`
   - Text: `#f5f2ed`
   - CTA Button: `#b87333`

## Kit Liquid Variables Used

```liquid
{{ subscriber.first_name }}     - First name with fallback
{{ subscriber.email_address }}  - Email
{{ unsubscribe_url }}           - Unsubscribe link
{{ preferences_url }}           - Preferences link
{{ address }}                   - Physical address

# Custom fields (must create in Kit):
{{ subscriber.dopamine_roi_score }}     - Their score (0-100)
{{ subscriber.dopamine_roi_category }}  - Category name
{{ subscriber.referral_code }}          - Unique referral code
```

## Creating Custom Fields in Kit

1. Go to Kit.com → Subscribers → Custom Fields
2. Create these fields:
   - `dopamine_roi_score` (Number)
   - `dopamine_roi_category` (Text)
   - `referral_code` (Text)

The API integration (`/src/pages/api/submit-assessment.ts`) already sends these values when someone completes the assessment.

## Testing Emails

1. Send a test to yourself first
2. Check both Gmail and Outlook
3. Test on mobile (templates are responsive)
4. Verify dark mode appearance

## Notes

- Templates use `Segoe UI` as the email-safe font (matches Space Grotesk feel)
- All templates support dark mode by default
- MSO conditionals included for Outlook rendering
- Mobile responsive at 600px breakpoint
