export interface AlgSetProgress {
  total: number;
  learning: number;
  reviewing: number;
  mastered: number;
  locked: number;
}

export interface PendingScrambleItem {
  caseId: number;
  alg: string;
  scramble: string;
  solution: string;
}
