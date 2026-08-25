import { Alg } from 'cubing/alg';
import { cube3x3x3 } from 'cubing/puzzles';
import type { KPattern, KPuzzle, KTransformation } from 'cubing/kpuzzle';
import type { ScrambleSolutionPair } from '@/types';
import { solveTransformation } from './solver3x3x3';
import { generateScrambleWithRetry } from './scrambleRetry';

// Client-side port of `server/src/lib/scramble.ts` - see that file's git
// history for the original server-side implementation this was ported from.
// 2x2 scrambles no longer flow through this file - see
// `scrambleGenerator2x2.ts` for the dedicated R/U/F-only solver.

const PREFIX_LENGTH = 4;
const MIN_333_SCRAMBLE_LENGTH = 19;
const POSSIBLE_MOVES = ['R', 'L', 'U', 'D', 'F', 'B'];
const OPPOSITE_MOVES: Record<string, string> = {
  R: 'L',
  L: 'R',
  U: 'D',
  D: 'U',
  F: 'B',
  B: 'F',
};
const MODIFIERS = ['', "'", '2'];
const POSSIBLE_AUFS = ['', 'U', 'U2', "U'"];
const ROTATION_GENERATORS = ['x', "x'", 'x2', 'y', "y'", 'y2', 'z', "z'", 'z2'];

function generateMoveList(n: number): string {
  const moves: string[] = [];
  let lastMove = '';

  for (let i = 0; i < n; i++) {
    const available = POSSIBLE_MOVES.filter(
      (m) => m !== lastMove && m !== OPPOSITE_MOVES[lastMove]
    );
    const move = available[Math.floor(Math.random() * available.length)];
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    moves.push(move + modifier);
    lastMove = move;
  }

  return moves.join(' ');
}

function generateAUF(): string {
  return POSSIBLE_AUFS[Math.floor(Math.random() * POSSIBLE_AUFS.length)];
}

export function countMoves(alg: string): number {
  return alg.split(/\s+/).filter(Boolean).length;
}

// A short alg (e.g. a single move) barely scrambles the cube once combined
// with a short prefix, so the solver's shortest solution is almost always
// too short to reach the target scramble length - sizing the prefix off the
// actual target up front (rather than a fixed constant) makes the first
// attempt far more likely to already be long enough, so the retry loop below
// is a fallback for solver-output variance rather than doing most of the work.
export function choosePrefixLength(alg: string, minLength: number): number {
  return Math.max(PREFIX_LENGTH, minLength - countMoves(alg));
}

// `experimentalSimplify`'s `puzzleLoader` option (which lets it fully cancel
// same-face turns using the puzzle's actual move order) only supports 3x3x3
// in this version of cubing.js - always safe to pass here since, unlike the
// server, both events are always solved via a real cube3x3x3 kpuzzle (see
// note above). A quarter turn has order 4 on any face-turning puzzle
// regardless of size, so also normalize amounts mod 4 ourselves as a backstop.
function normalizeMove(move: string): string | null {
  const match = move.match(/^([A-Za-z])(\d*)('?)$/);
  if (!match) return move;
  const [, base, digits, prime] = match;
  const magnitude = digits ? parseInt(digits, 10) : 1;
  const amount = (((prime ? -magnitude : magnitude) % 4) + 4) % 4;
  if (amount === 0) return null;
  if (amount === 1) return base;
  if (amount === 2) return `${base}2`;
  return `${base}'`;
}

function normalizeAlgString(alg: string): string {
  return alg
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeMove)
    .filter((move): move is string => move !== null)
    .join(' ');
}

function simplifyAlg(alg: Alg | string): string {
  const simplified = new Alg(alg)
    .experimentalSimplify({ cancel: true, puzzleLoader: cube3x3x3 })
    .toString();
  return normalizeAlgString(simplified);
}

// The solver requires centers to stay in their home positions. Slice moves
// (M/E/S) or whole-cube rotations (x/y/z - valid notation for both events)
// permute centers, so any alg containing one (e.g. "M2 U'", or PLL's H/Z-perms)
// leaves centers displaced. Find a rotation prefix that cancels the
// displacement back out.
function centersAreHome(pattern: KPattern): boolean {
  const centers = pattern.patternData['CENTERS'].pieces;
  return centers.every((piece, index) => piece === index);
}

function algKeepsCentersHome(kpuzzle: KPuzzle, alg: string): boolean {
  const pattern = kpuzzle.algToTransformation(new Alg(alg)).toKPattern();
  return centersAreHome(pattern);
}

function findCenterCorrection(kpuzzle: KPuzzle, alg: string): string {
  if (algKeepsCentersHome(kpuzzle, alg)) return '';

  for (const rotation of ROTATION_GENERATORS) {
    if (algKeepsCentersHome(kpuzzle, `${rotation} ${alg}`)) return rotation;
  }
  for (const first of ROTATION_GENERATORS) {
    for (const second of ROTATION_GENERATORS) {
      const combo = `${first} ${second}`;
      if (algKeepsCentersHome(kpuzzle, `${combo} ${alg}`)) return combo;
    }
  }

  throw new Error(`Could not find a whole-cube rotation to keep centers home for alg: ${alg}`);
}

function withCentersHome(kpuzzle: KPuzzle, alg: string): string {
  const correction = findCenterCorrection(kpuzzle, alg);
  return correction ? `${correction} ${alg}` : alg;
}

// `cube3x3x3.kpuzzle()` fetches/parses a puzzle definition - deferred behind
// a getter (rather than a top-level `const`) so that work only happens on
// the first actual scramble request, not unconditionally at import time for
// every module that imports this file. Memoized so every call after the
// first reuses the same in-flight/resolved promise.
let cachedKPuzzlePromise: Promise<KPuzzle> | null = null;
function getKPuzzle(): Promise<KPuzzle> {
  if (!cachedKPuzzlePromise) {
    cachedKPuzzlePromise = cube3x3x3.kpuzzle();
  }
  return cachedKPuzzlePromise;
}

// `alg` is fixed across every retry in the loop below - only the prefix
// changes per attempt - so its transformation is computed once by the caller
// and composed with each attempt's (short) prefix, instead of re-parsing the
// full "prefix + alg" string from scratch on every retry.
async function generateCandidateScramble(
  kpuzzle: KPuzzle,
  algTransformation: KTransformation,
  prefixLength: number
): Promise<string> {
  const prefix = generateMoveList(prefixLength);
  const pattern = kpuzzle
    .algToTransformation(new Alg(prefix))
    .applyTransformation(algTransformation)
    .toKPattern();
  // Extract plain permutation/orientation arrays - `solveTransformation`
  // only ever needed this plain data, not the `cubing/kpuzzle` `KPattern`
  // class instance itself (see `solveTransformation`'s docstring).
  const corners = pattern.patternData['CORNERS'];
  const edges = pattern.patternData['EDGES'];
  const cornerOrbit = { permutation: corners.pieces, orientation: corners.orientation };
  const edgeOrbit = { permutation: edges.pieces, orientation: edges.orientation };
  const solution = solveTransformation(cornerOrbit, edgeOrbit);
  return simplifyAlg(`${solution} ${prefix}`);
}

export async function generateScrambleForAlg(
  rawAlg: string,
  scrambleWithAUF: boolean = false
): Promise<ScrambleSolutionPair> {
  const kpuzzle = await getKPuzzle();
  const alg = withCentersHome(
    kpuzzle,
    `${scrambleWithAUF ? generateAUF() : ''} ${rawAlg} ${scrambleWithAUF ? generateAUF() : ''}`
  );
  const algTransformation = kpuzzle.algToTransformation(new Alg(alg));

  // min2phase is a genuinely near-minimal solver, so for a lightly-mixed
  // state (short alg + a short prefix) its solutions cluster short - a
  // *fixed*-length prefix can retry with a low, static success probability
  // indefinitely (empirically: some algs saw ~1-in-300 odds per attempt,
  // occasionally not converging in 2000+ tries). Growing the prefix by one
  // move on every failed retry pushes the combined state further from
  // solved each time, which converges fast and reliably regardless of how
  // close-to-optimal the underlying solver's output is (verified empirically
  // to converge in single-digit attempts even for the worst case found).
  const startPrefixLength = choosePrefixLength(alg, MIN_333_SCRAMBLE_LENGTH);
  const scramble = await generateScrambleWithRetry(
    (prefixLength) => generateCandidateScramble(kpuzzle, algTransformation, prefixLength),
    (candidate) => countMoves(candidate) >= MIN_333_SCRAMBLE_LENGTH,
    startPrefixLength
  );
  if (scramble === '') return { scramble: '', solution: '' };

  return { scramble, solution: simplifyAlg(alg) };
}
