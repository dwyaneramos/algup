

import type { CubeEvent } from '@/types';

const FACE_MOVES = ['R', 'L', 'U', 'D', 'F', 'B'];
const SLICE_MOVES = ['M', 'E', 'S'];
const WIDE_MOVES = ['r', 'l', 'u', 'd', 'f', 'b'];
const ROTATIONS = ['x', 'y', 'z'];

// 2x2 has no slice layer and no distinction between a face and its wide
// turn (only 2 layers total), so only base face moves and whole-cube
// rotations are valid notation for a 2x2 algset.
const VALID_BASE_MOVES_222 = [...FACE_MOVES, ...ROTATIONS];
const VALID_BASE_MOVES_333 = [...FACE_MOVES, ...SLICE_MOVES, ...WIDE_MOVES, ...ROTATIONS];

const MOVE_REGEX_222 = new RegExp(`^(${VALID_BASE_MOVES_222.join('|')})[23]?'?$`);
const MOVE_REGEX_333 = new RegExp(`^(${VALID_BASE_MOVES_333.join('|')})[23]?'?$`);

export function sanitiseAlgorithm(alg: string): string {
  const sanitised = alg.replace(/[()]/g, '').trim();
  return sanitised;
}

export function validateAlgorithm(alg: string, event: CubeEvent = '333'): boolean {
  const regex = event === '222' ? MOVE_REGEX_222 : MOVE_REGEX_333;
  alg = sanitiseAlgorithm(alg);
  for (const move of alg.split(/\s+/)) {
    if (!regex.test(move.trim())) {
      return false;
    }
  }

  return true;
}


