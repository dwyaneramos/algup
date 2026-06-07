export type CaseState = 'locked' | 'learning' | 'reviewing' | 'mastered';

export interface CaseWithProgress {
  id: number;
  alg: string;
  algset: string;
  confidence: number;
  state: CaseState;
}

// TODO: change to 10
const MAX_ACTIVE = 3;
const MAX_LEARNING = 3;

const STATE_WEIGHTS: Record<CaseState, number> = {
  locked: 0,
  learning: 5,
  reviewing: 3,
  mastered: 1,
};

const CONFIDENCE_THRESHOLDS = {
  toReviewing: 3.0,
  toMastered: 4.5,
};

let available = []

export function getNextState(state: CaseState, confidence: number): CaseState {
  if (state === 'learning' && confidence >= CONFIDENCE_THRESHOLDS.toReviewing) {
    return 'reviewing';
  }
  if (state === 'reviewing' && confidence >= CONFIDENCE_THRESHOLDS.toMastered) {
    return 'mastered';
  }
  return state;
}
export function updateConfidence(current: number, grade: number, alpha: number = 0.3): number {
  const scaled = grade === 1 ? 1 : grade === 2 ? 3 : 5;
  const next = alpha * scaled + (1 - alpha) * current;

  return Math.round(next * 10) / 10;
}

export function shouldIntroduceNewCase(cases: CaseWithProgress[]): boolean {
  const learningOrReviewing = cases.filter(c => c.state === 'learning' || c.state === 'reviewing');
  const learningCases = cases.filter(c => c.state === 'learning');
  return learningOrReviewing.length < MAX_ACTIVE && learningCases.length < MAX_LEARNING;
}

export function getNumberOfAlgsPracticing(): number {
  return available.length;
}

export function pickNextCase(cases: CaseWithProgress[], excludeId?: number): CaseWithProgress | null {
  available = cases.filter(c => c.state !== 'locked' && c.id !== excludeId);
  if (available.length === 0) return null;

  const totalWeight = available.reduce((sum, c) => sum + STATE_WEIGHTS[c.state] * (6 - c.confidence), 0);
  let random = Math.random() * totalWeight;

  for (const c of available) {
    random -= STATE_WEIGHTS[c.state] * (6 - c.confidence);
    if (random <= 0) return c;
  }

  return available[available.length - 1];
}
