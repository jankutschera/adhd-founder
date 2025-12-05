/**
 * Dopamine ROI Scoring Engine
 *
 * Formula: dopamineROI = (energyScore × impactScore) / chaosScore
 * Normalized to 0-100 scale
 */

export interface AssessmentAnswers {
  revenueRange: string;
  timeSplit: number; // 0-100 slider
  energyVampires: string[]; // multi-select
  flowActivities: string[]; // multi-select
  chaosLevel: number; // 1-10
  delegationStatus: string;
  biggestStruggle: string;
  email: string;
}

interface ScoringWeights {
  flowActivities: number;
  energyVampires: number;
  timeSplit: number;
  chaosLevel: number;
  delegationStatus: number;
}

const WEIGHTS: ScoringWeights = {
  flowActivities: 0.30, // How many flow activities you have
  energyVampires: 0.25, // Fewer vampires = better
  timeSplit: 0.20, // Balance between types of work
  chaosLevel: 0.15, // Self-reported chaos
  delegationStatus: 0.10, // Delegation readiness
};

// Revenue multiplier affects how we weight the score
const REVENUE_MULTIPLIERS: Record<string, number> = {
  'under-10k': 0.9,
  '10k-50k': 1.0,
  '50k-100k': 1.05,
  '100k-250k': 1.1,
  '250k-500k': 1.15,
  'over-500k': 1.2,
};

// Delegation status affects potential
const DELEGATION_SCORES: Record<string, number> = {
  'solo': 30,
  'some-help': 50,
  'small-team': 70,
  'delegating-well': 90,
};

/**
 * Calculate the Dopamine ROI score
 */
export function calculateScore(answers: AssessmentAnswers): number {
  // 1. Flow Activities Score (more = better, max 6)
  const flowScore = Math.min(answers.flowActivities.length / 6, 1) * 100;

  // 2. Energy Vampires Score (fewer = better, max 6)
  const vampireScore = (1 - Math.min(answers.energyVampires.length / 6, 1)) * 100;

  // 3. Time Split Score (closer to 50/50 is better for balance)
  // But we actually want more time on dopamine tasks (>50)
  const timeSplitScore = answers.timeSplit >= 50
    ? Math.min(answers.timeSplit, 100)
    : answers.timeSplit * 1.5; // Penalize low dopamine time

  // 4. Chaos Score (inverted - lower chaos = higher score)
  const chaosScore = ((10 - answers.chaosLevel) / 9) * 100;

  // 5. Delegation Score
  const delegationScore = DELEGATION_SCORES[answers.delegationStatus] || 50;

  // Weighted average
  let rawScore =
    (flowScore * WEIGHTS.flowActivities) +
    (vampireScore * WEIGHTS.energyVampires) +
    (timeSplitScore * WEIGHTS.timeSplit) +
    (chaosScore * WEIGHTS.chaosLevel) +
    (delegationScore * WEIGHTS.delegationStatus);

  // Apply revenue multiplier
  const revenueMultiplier = REVENUE_MULTIPLIERS[answers.revenueRange] || 1.0;
  rawScore *= revenueMultiplier;

  // Normalize to 0-100 and round
  return Math.round(Math.max(0, Math.min(100, rawScore)));
}

/**
 * Get detailed breakdown of score components
 */
export function getScoreBreakdown(answers: AssessmentAnswers): {
  component: string;
  score: number;
  weight: number;
  contribution: number;
}[] {
  const flowScore = Math.min(answers.flowActivities.length / 6, 1) * 100;
  const vampireScore = (1 - Math.min(answers.energyVampires.length / 6, 1)) * 100;
  const timeSplitScore = answers.timeSplit >= 50
    ? Math.min(answers.timeSplit, 100)
    : answers.timeSplit * 1.5;
  const chaosScore = ((10 - answers.chaosLevel) / 9) * 100;
  const delegationScore = DELEGATION_SCORES[answers.delegationStatus] || 50;

  return [
    {
      component: 'Flow Activities',
      score: Math.round(flowScore),
      weight: WEIGHTS.flowActivities,
      contribution: Math.round(flowScore * WEIGHTS.flowActivities),
    },
    {
      component: 'Energy Vampires',
      score: Math.round(vampireScore),
      weight: WEIGHTS.energyVampires,
      contribution: Math.round(vampireScore * WEIGHTS.energyVampires),
    },
    {
      component: 'Time Balance',
      score: Math.round(timeSplitScore),
      weight: WEIGHTS.timeSplit,
      contribution: Math.round(timeSplitScore * WEIGHTS.timeSplit),
    },
    {
      component: 'Chaos Management',
      score: Math.round(chaosScore),
      weight: WEIGHTS.chaosLevel,
      contribution: Math.round(chaosScore * WEIGHTS.chaosLevel),
    },
    {
      component: 'Delegation',
      score: Math.round(delegationScore),
      weight: WEIGHTS.delegationStatus,
      contribution: Math.round(delegationScore * WEIGHTS.delegationStatus),
    },
  ];
}

/**
 * Question definitions with their options
 */
export const QUESTIONS = {
  revenueRange: {
    id: 'revenueRange',
    title: 'What\'s your current monthly revenue?',
    subtitle: 'This helps us understand your business stage',
    type: 'dropdown',
    options: [
      { value: 'under-10k', label: 'Under $10k/month' },
      { value: '10k-50k', label: '$10k - $50k/month' },
      { value: '50k-100k', label: '$50k - $100k/month' },
      { value: '100k-250k', label: '$100k - $250k/month' },
      { value: '250k-500k', label: '$250k - $500k/month' },
      { value: 'over-500k', label: 'Over $500k/month' },
    ],
  },
  timeSplit: {
    id: 'timeSplit',
    title: 'How much of your work time is spent on dopamine-fueling tasks?',
    subtitle: 'Things that energize you vs. drain you',
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    labels: {
      min: '0% (All draining)',
      max: '100% (All energizing)',
    },
  },
  energyVampires: {
    id: 'energyVampires',
    title: 'Which tasks drain your energy the most?',
    subtitle: 'Select all that apply',
    type: 'multiselect',
    options: [
      { value: 'bookkeeping', label: 'Bookkeeping & Finances', icon: '📊' },
      { value: 'email', label: 'Email Management', icon: '📧' },
      { value: 'admin', label: 'Admin Tasks', icon: '📋' },
      { value: 'scheduling', label: 'Scheduling & Calendar', icon: '📅' },
      { value: 'customer-support', label: 'Customer Support', icon: '💬' },
      { value: 'content-editing', label: 'Content Editing', icon: '✏️' },
    ],
  },
  flowActivities: {
    id: 'flowActivities',
    title: 'Which activities put you in flow state?',
    subtitle: 'Select all that apply',
    type: 'multiselect',
    options: [
      { value: 'strategy', label: 'Strategy & Planning', icon: '🎯' },
      { value: 'creating', label: 'Creating Content', icon: '🎨' },
      { value: 'selling', label: 'Sales & Pitching', icon: '💰' },
      { value: 'building', label: 'Building Products', icon: '🛠️' },
      { value: 'networking', label: 'Networking & Relationships', icon: '🤝' },
      { value: 'learning', label: 'Learning & Research', icon: '📚' },
    ],
  },
  chaosLevel: {
    id: 'chaosLevel',
    title: 'How chaotic does your business feel right now?',
    subtitle: 'Be honest - this is about awareness, not judgment',
    type: 'slider',
    min: 1,
    max: 10,
    step: 1,
    labels: {
      min: '1 (Zen master)',
      max: '10 (Tornado)',
    },
  },
  delegationStatus: {
    id: 'delegationStatus',
    title: 'What\'s your current delegation situation?',
    subtitle: 'Who\'s helping you run things?',
    type: 'cards',
    options: [
      { value: 'solo', label: 'Flying Solo', description: 'I do everything myself', icon: '🦅' },
      { value: 'some-help', label: 'Some Help', description: 'Occasional contractors or VAs', icon: '🤝' },
      { value: 'small-team', label: 'Small Team', description: 'Regular team members helping', icon: '👥' },
      { value: 'delegating-well', label: 'Well Delegated', description: 'Strong team, I focus on what I love', icon: '🚀' },
    ],
  },
  biggestStruggle: {
    id: 'biggestStruggle',
    title: 'What\'s your biggest struggle right now?',
    subtitle: 'Pick the one that resonates most',
    type: 'cards',
    options: [
      { value: 'overwhelm', label: 'Overwhelm', description: 'Too many things, not enough focus', icon: '🌊' },
      { value: 'consistency', label: 'Consistency', description: 'Hard to maintain momentum', icon: '📈' },
      { value: 'delegation', label: 'Letting Go', description: 'Struggle to hand things off', icon: '🎯' },
      { value: 'direction', label: 'Direction', description: 'Not sure what to focus on', icon: '🧭' },
    ],
  },
  email: {
    id: 'email',
    title: 'Where should we send your results?',
    subtitle: 'We\'ll also send you personalized tips based on your score',
    type: 'email',
  },
};

/**
 * Questions as an ordered array for the assessment wizard
 * Note: email is handled separately as the final step
 */
export const questions = [
  QUESTIONS.revenueRange,
  QUESTIONS.timeSplit,
  QUESTIONS.energyVampires,
  QUESTIONS.flowActivities,
  QUESTIONS.chaosLevel,
  QUESTIONS.delegationStatus,
  QUESTIONS.biggestStruggle,
];
