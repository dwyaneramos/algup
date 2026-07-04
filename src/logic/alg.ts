

const VALID_BASE_MOVES: string[] = [
  'R', 'L', 'U', 'D', 'F', 'B',
  'M', 'E', 'S',
  'r', 'l', 'u', 'd', 'f', 'b',
  'x', 'y', 'z',
];

const MOVE_REGEX = new RegExp(`^(${VALID_BASE_MOVES.join('|')})[23]?'?$`);

export function sanitiseAlgorithm(alg: string): string {
  const sanitised = alg.replace(/[()]/g, '').trim();
  return sanitised;
}

export function validateAlgorithm(alg: string): boolean {
  alg = sanitiseAlgorithm(alg);
  for (const move of alg.split(/\s+/)) {
    if (!MOVE_REGEX.test(move.trim())) {
      return false;
    }
  }

  return true;
}


