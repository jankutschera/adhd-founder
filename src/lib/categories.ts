/**
 * Dopamine ROI Categories
 * Each category represents a different relationship between
 * energy investment and return in ADHD entrepreneurship
 */

export interface Category {
  id: string;
  name: string;
  tagline: string;
  range: { min: number; max: number };
  color: string;
  bgColor: string;
  description: string;
  strengths: string[];
  recommendations: string[];
  shareEmoji: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'cash-engine',
    name: 'Cash Engine',
    tagline: 'Your chaos is profitable gold',
    range: { min: 70, max: 100 },
    color: '#10B981', // emerald
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'You\'ve cracked the code! Your high-dopamine activities are directly fueling your revenue. The activities that light you up are also making you money.',
    strengths: [
      'Natural alignment between passion and profit',
      'Sustainable energy for business growth',
      'High flow-state productivity'
    ],
    recommendations: [
      'Double down on your flow-state activities',
      'Hire out the remaining energy vampires immediately',
      'Document your chaos - it\'s your secret sauce',
      'Consider teaching others your approach'
    ],
    shareEmoji: '🚀'
  },
  {
    id: 'delegate-zone',
    name: 'Delegate Zone',
    tagline: 'One hire away from breakthrough',
    range: { min: 40, max: 69 },
    color: '#3B82F6', // blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    description: 'You\'re doing good work, but you\'re spending too much energy on tasks that drain you. Strategic delegation would unlock your full potential.',
    strengths: [
      'Clear understanding of what drains you',
      'Revenue foundation is solid',
      'Ready for the next level'
    ],
    recommendations: [
      'Identify your top 3 energy vampires to outsource',
      'Calculate the true cost of doing draining tasks yourself',
      'Start with one VA or contractor this month',
      'Protect your high-dopamine time blocks'
    ],
    shareEmoji: '💪'
  },
  {
    id: 'kill-zone',
    name: 'Kill Zone',
    tagline: 'Time to cut the dead weight',
    range: { min: 20, max: 39 },
    color: '#F59E0B', // amber
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: 'You\'re investing energy in activities that aren\'t paying off. Some business activities need to be eliminated entirely, not just delegated.',
    strengths: [
      'Awareness of the problem is the first step',
      'Opportunity to radically simplify',
      'Potential for massive transformation'
    ],
    recommendations: [
      'List every activity and ask: "Does this make money?"',
      'Kill at least 3 activities this week',
      'Say no to new commitments for 30 days',
      'Focus only on your highest-ROI activities'
    ],
    shareEmoji: '⚡'
  },
  {
    id: 'profitable-chaos',
    name: 'Profitable Chaos',
    tagline: 'Burning bright, but burning out',
    range: { min: 0, max: 19 },
    color: '#EF4444', // red
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'Your energy is scattered across too many things. You might be making money, but at an unsustainable cost to your wellbeing and focus.',
    strengths: [
      'You have energy and drive',
      'Multiple skills and interests',
      'Entrepreneurial courage'
    ],
    recommendations: [
      'STOP: Take a week off from everything possible',
      'Pick ONE thing that makes money and gives energy',
      'Consider a business model pivot',
      'Get accountability support or coaching'
    ],
    shareEmoji: '🔥'
  }
];

/**
 * Get category by score
 */
export function getCategoryByScore(score: number): Category {
  const clampedScore = Math.max(0, Math.min(100, score));
  const category = CATEGORIES.find(
    c => clampedScore >= c.range.min && clampedScore <= c.range.max
  );
  return category || CATEGORIES[CATEGORIES.length - 1];
}

/**
 * Get category by ID
 */
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}
