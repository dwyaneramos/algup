import { applyScramble } from './scramble';
import { solve2x2x2, isReferenceCornerHome } from './solver2x2x2';
import { countMoves, choosePrefixLength } from './scrambleGenerator3x3';
import type { ScrambleSolutionPair } from '@/types';

const MIN_222_SCRAMBLE_LENGTH = 12;
const POSSIBLE_MOVES_222 = ['R', 'U', 'F'];
const MODIFIERS = ['', "'", '2'];
const POSSIBLE_AUFS = ['', 'U', 'U2', "U'"];
const ROTATION_GENERATORS = ['x', "x'", 'x2', 'y', "y'", 'y2', 'z', "z'", 'z2'];

// R, U, F have no mutually opposite pair (unlike the 6-face 3x3 generator),
// so avoiding immediate same-face repeats is the only redundancy rule
// needed here.
function generateMoveList2x2(n: number): string {
  const moves: string[] = [];
  let lastFace = '';
  for (let i = 0; i < n; i++) {
    const available = POSSIBLE_MOVES_222.filter((m) => m !== lastFace);
    const face = available[Math.floor(Math.random() * available.length)];
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    moves.push(face + modifier);
    lastFace = face;
  }
  return moves.join(' ');
}

function generateAUF(): string {
  return POSSIBLE_AUFS[Math.floor(Math.random() * POSSIBLE_AUFS.length)];
}

function moveFace(move: string): string {
  return move[0];
}

function moveAmount(move: string): number {
  const match = move.match(/^[A-Za-z](\d*)('?)$/);
  if (!match) throw new Error(`Invalid 2x2 move token: ${move}`);
  const [, digits, prime] = match;
  const magnitude = digits ? parseInt(digits, 10) : 1;
  return prime ? -magnitude : magnitude;
}

function amountToMove(face: string, amount: number): string | null {
  const normalized = ((amount % 4) + 4) % 4;
  if (normalized === 0) return null;
  if (normalized === 1) return face;
  if (normalized === 2) return `${face}2`;
  return `${face}'`;
}

// Deliberately does only adjacent same-face collapsing (not a full
// group-theoretic resolve to a canonical minimal word, the way the 3x3
// pipeline's `Alg.experimentalSimplify` does) - this both avoids pulling in
// `cubing/puzzles` here (keeping this pipeline unit-testable under Jest) and
// matches the 3x3 pipeline's actual disguising behavior: the scramble is
// still exactly the alg's inverse as a group element, but doesn't fully
// collapse into a recognizably-literal reversal of it.
function simplify2x2(alg: string): string {
  const stack: string[] = [];
  for (const move of alg.split(/\s+/).filter(Boolean)) {
    const face = moveFace(move);
    const top = stack[stack.length - 1];
    if (top && moveFace(top) === face) {
      stack.pop();
      const merged = amountToMove(face, moveAmount(top) + moveAmount(move));
      if (merged) stack.push(merged);
    } else {
      stack.push(move);
    }
  }
  return stack.join(' ');
}

// R/U/F moves never touch the solver's reference corner, so a case's own
// alg must leave it untouched too - true for any alg that only permutes the
// other 7 pieces, but an alg using L/D/B/rotations might displace it. Find
// a whole-cube rotation prefix that restores it, mirroring how the 3x3
// pipeline's `withCentersHome` fixes up center displacement.
function algKeepsReferenceCornerHome(alg: string): boolean {
  return isReferenceCornerHome(applyScramble(alg, true));
}

function findReferenceCornerCorrection(alg: string): string {
  if (algKeepsReferenceCornerHome(alg)) return '';

  for (const rotation of ROTATION_GENERATORS) {
    if (algKeepsReferenceCornerHome(`${rotation} ${alg}`)) return rotation;
  }
  for (const first of ROTATION_GENERATORS) {
    for (const second of ROTATION_GENERATORS) {
      const combo = `${first} ${second}`;
      if (algKeepsReferenceCornerHome(`${combo} ${alg}`)) return combo;
    }
  }

  throw new Error(
    `Could not find a whole-cube rotation to keep the reference corner home for alg: ${alg}`
  );
}

function withReferenceCornerHome(alg: string): string {
  const correction = findReferenceCornerCorrection(alg);
  return correction ? `${correction} ${alg}` : alg;
}

export async function generateScramble2x2ForAlg(
  rawAlg: string,
  scrambleWithAUF: boolean = false
): Promise<ScrambleSolutionPair> {
  const wrapped =
    `${scrambleWithAUF ? generateAUF() : ''} ${rawAlg} ${scrambleWithAUF ? generateAUF() : ''}`.trim();
  const alg = withReferenceCornerHome(wrapped);

  let prefixLength = choosePrefixLength(alg, MIN_222_SCRAMBLE_LENGTH) - 1;
  let scramble: string;
  do {
    prefixLength++;
    const prefix = generateMoveList2x2(prefixLength);
    const targetState = applyScramble(`${prefix} ${alg}`, true);
    const solution = solve2x2x2(targetState);
    scramble = simplify2x2(`${solution} ${prefix}`);
  } while (countMoves(scramble) < MIN_222_SCRAMBLE_LENGTH);

  return { scramble, solution: simplify2x2(alg) };
}
