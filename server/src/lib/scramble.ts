import { experimentalSolve2x2x2, experimentalSolve3x3x3IgnoringCenters } from 'cubing/search';
import { cube3x3x3 } from 'cubing/puzzles';
import { Alg } from 'cubing/alg';
import type { CubeEvent } from '@/types';
import type { PuzzleLoader } from 'cubing/puzzles';

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

function simplifyAlg(alg: Alg | string, event: CubeEvent): string {
  let simplifyParams: SimplifyParams = { cancel: true };
  if (event === "333") {
    simplifyParams.puzzleLoader = cube3x3x3;
  }
  return new Alg(alg).experimentalSimplify(simplifyParams).toString();
}

export async function generateScrambleForAlg(rawAlg: string, event: CubeEvent): Promise<{ scramble: string; solution: string }> {
  const kpuzzle = await cube3x3x3.kpuzzle();
  const alg = `${generateAUF()} ${rawAlg} ${generateAUF()}`;
  let scramble = '';

  const solver = event === "333" ? experimentalSolve3x3x3IgnoringCenters : experimentalSolve2x2x2;
  const maxLength = event === "333" ? MIN_333_SCRAMBLE_LENGTH : MIN_222_SCRAMBLE_LENGTH;

  do {
    const prefix = generateMoveList(PREFIX_LENGTH);
    const parsed = new Alg(`${prefix} ${alg}`);
    const pattern = kpuzzle.algToTransformation(parsed).toKPattern();
    const solution = await solver(pattern);
    scramble = simplifyAlg(`${solution.toString()} ${prefix}`, event);
  } while (scramble.split(' ').length < maxLength);

  return { scramble, solution: simplifyAlg(alg, event) };
}
