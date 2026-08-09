export type CubeState = string[];

export interface ScrambleSolutionPair {
  scramble: string;
  solution: string;
}

export interface BatchScrambleResult {
  alg: string;
  scramble: string;
  solution: string;
}
