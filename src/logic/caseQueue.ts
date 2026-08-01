export type CaseState = 'locked' | 'learning' | 'reviewing' | 'mastered';

export interface CaseWithProgress {
  id: number;
  alg: string;
  algset: string;
  fluency: number;
  is_focused: boolean;
  state: CaseState;
  last_practiced: string | null;
}

export const DEFAULT_MAX_ACTIVE = 5;
export const DEFAULT_MAX_LEARNING = 3;

const FOCUSED_WEIGHT = 10;

const STATE_WEIGHTS: Record<CaseState, number> = {
  locked: 0,
  learning: 5,
  reviewing: 3,
  mastered: 1,
};

const fluency_THRESHOLDS = {
  toReviewing: 3.0,
  toMastered: 4.5,
};

const DECAY_FACTOR = 0.95;
const DECAY_MIN_DAYS = 2;

export function applyDecay(cases: CaseWithProgress[]): CaseWithProgress[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cases.map(c => {
    if (!c.last_practiced || c.state === 'locked') return c;

    const practiced = new Date(c.last_practiced);
    practiced.setHours(0, 0, 0, 0);
    const daysSince = Math.floor((today.getTime() - practiced.getTime()) / 86400000);

    if (daysSince < DECAY_MIN_DAYS) return c;

    const newFluency = Math.max(1, +(c.fluency * Math.pow(DECAY_FACTOR, daysSince)).toFixed(1));
    return { ...c, fluency: newFluency };
  });
}

let available = []

export function getNextState(state: CaseState, fluency: number): CaseState {
  if (state === 'learning' && fluency >= fluency_THRESHOLDS.toReviewing) {
    return 'reviewing';
  }
  if (state === 'reviewing' && fluency >= fluency_THRESHOLDS.toMastered) {
    return 'mastered';
  }
  return state;
}

export function getUpdatedFluency(current: number, grade: number, alpha: number = 0.3): number {
  const scaled = grade === 1 ? 1 : grade === 2 ? 3 : 5;
  const next = alpha * scaled + (1 - alpha) * current;
  const rounded = Math.round(next * 10) / 10;
  // Help with the fact that with the default alpha, it will never approach 5 (stay at 4.9) or 0 for a case you learnt then lost fluency in
  if (rounded <= 1.1 && grade === 1) return 1;
  if (rounded >= 4.9 && grade === 3) return 5;
  return Math.max(1, Math.min(5, rounded));
}

export function shouldIntroduceNewCase(
  cases: CaseWithProgress[],
  maxActive: number = DEFAULT_MAX_ACTIVE,
  maxLearning: number = DEFAULT_MAX_LEARNING
): boolean {
  const learningOrReviewing = cases.filter(c =>
    !c.is_focused && (c.state === 'learning' || c.state === 'reviewing')
  );
  const learningCases = cases.filter(c =>
    !c.is_focused && c.state === 'learning'
  );
  return learningOrReviewing.length < maxActive && learningCases.length < maxLearning;
}

export function getNumberOfAlgsPracticing(): number {
  return available.length;
}


export function pickNextCase(cases: CaseWithProgress[], excludeId?: number): CaseWithProgress | null {
  const focused = cases.filter(c => c.is_focused && c.id !== excludeId);
  const normal = cases.filter(c => !c.is_focused && c.state !== 'locked' && c.id !== excludeId);

  available = [...focused, ...normal];
  if (available.length === 0) return null;

  const totalWeight = available.reduce((sum, c) => {
    const weight = c.is_focused ? FOCUSED_WEIGHT : STATE_WEIGHTS[c.state];
    return sum + weight * (6 - c.fluency);
  }, 0);

  let random = Math.random() * totalWeight;
  for (const c of available) {
    const weight = c.is_focused ? FOCUSED_WEIGHT : STATE_WEIGHTS[c.state];
    random -= weight * (6 - c.fluency);
    if (random <= 0) return c;
  }

  return available[available.length - 1];
}
