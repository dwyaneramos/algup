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
