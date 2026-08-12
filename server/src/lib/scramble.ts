import { experimentalSolve2x2x2, experimentalSolve3x3x3IgnoringCenters } from 'cubing/search';
import { cube3x3x3 } from 'cubing/puzzles';
import { Alg } from 'cubing/alg';
import type { CubeEvent } from '@/types';
import type { PuzzleLoader } from 'cubing/puzzles';
import type { KPattern, KPuzzle } from 'cubing/kpuzzle';

export const MAX_BATCH_SIZE = 15;

const PREFIX_LENGTH = 4;
const MIN_333_SCRAMBLE_LENGTH = 19;
const MIN_222_SCRAMBLE_LENGTH = 12;
const POSSIBLE_MOVES = ['R', 'L', 'U', 'D', 'F', 'B'];
const OPPOSITE_MOVES: Record<string, string> = {
  R: 'L', L: 'R',
  U: 'D', D: 'U',
  F: 'B', B: 'F',
};
const MODIFIERS = ['', "'", '2'];
const POSSIBLE_AUFS = ['', 'U', 'U2', "U'"];
const ROTATION_GENERATORS = ['x', "x'", 'x2', 'y', "y'", 'y2', 'z', "z'", 'z2'];
type Solver = (pattern: KPattern) => Promise<Alg>;


interface SimplifyParams {
  cancel: boolean;
  puzzleLoader?: PuzzleLoader;
}

function generateMoveList(n: number): string {
  const moves: string[] = [];
  let lastMove = '';

  for (let i = 0; i < n; i++) {
    const available = POSSIBLE_MOVES.filter(m => m !== lastMove && m !== OPPOSITE_MOVES[lastMove]);
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

// `experimentalSimplify`'s `puzzleLoader` option (which lets it fully cancel
// same-face turns using the puzzle's actual move order) only supports 3x3x3
// in this version of cubing.js. Without it, e.g. two adjacent "R2"s combine
// to a literal "R4" instead of cancelling out. A quarter turn has order 4 on
// any face-turning puzzle regardless of size, so normalize amounts mod 4
// ourselves as a puzzle-size-agnostic backstop.
function normalizeMove(move: string): string | null {
  const match = move.match(/^([A-Za-z])(\d*)('?)$/);
  if (!match) return move;
  const [, base, digits, prime] = match;
  const magnitude = digits ? parseInt(digits, 10) : 1;
  const amount = ((prime ? -magnitude : magnitude) % 4 + 4) % 4;
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

function simplifyAlg(alg: Alg | string, event: CubeEvent): string {
  const simplifyParams: SimplifyParams = { cancel: true };
  if (event === "333") {
    simplifyParams.puzzleLoader = cube3x3x3;
  }
  const simplified = new Alg(alg).experimentalSimplify(simplifyParams).toString();
  return normalizeAlgString(simplified);
}

// experimentalSolve3x3x3IgnoringCenters requires centers to stay in their
// home positions. Slice moves (M/E/S) permute centers exactly like a
// whole-cube rotation on the same axis does, so any alg containing one
// (e.g. "M2 U'", or PLL's H/Z-perms) leaves centers displaced and the solver
// throws "non-oriented puzzles are not supported". Find a rotation prefix
// that cancels the displacement back out.
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

async function generateCandidateScramble(kpuzzle: KPuzzle, solver: Solver, alg: string, event: CubeEvent): Promise<string> {
  const prefix = generateMoveList(PREFIX_LENGTH);
  const pattern = kpuzzle.algToTransformation(new Alg(`${prefix} ${alg}`)).toKPattern();
  const solution = await solver(pattern);
  console.log(`Generated solution: ${solution.toString()} for alg: ${alg} with prefix: ${prefix}`);
  return simplifyAlg(`${solution.toString()} ${prefix}`, event);
}

export async function generateScrambleForAlg(rawAlg: string, event: CubeEvent): Promise<{ scramble: string; solution: string }> {
  const kpuzzle = await cube3x3x3.kpuzzle();
  const alg = withCentersHome(kpuzzle, `${generateAUF()} ${rawAlg} ${generateAUF()}`);

  const solver = event === "333" ? experimentalSolve3x3x3IgnoringCenters : experimentalSolve2x2x2;
  const minLength = event === "333" ? MIN_333_SCRAMBLE_LENGTH : MIN_222_SCRAMBLE_LENGTH;

  let scramble = await generateCandidateScramble(kpuzzle, solver, alg, event);
  while (scramble.split(' ').length < minLength) {
    scramble = await generateCandidateScramble(kpuzzle, solver, alg, event);
  }

  return { scramble, solution: simplifyAlg(alg, event) };
}
