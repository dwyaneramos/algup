import { solve2x2x2, isReferenceCornerHome } from '@/src/logic/solver2x2x2';
import { applyScramble, solvedCube } from '@/src/logic/scramble';

// `cubing/alg`'s package.json only declares an "import" (ESM) export
// condition for its subpaths, which Jest's CJS-based resolver can't load -
// mirrors the precedent in tests/scrambleSimulation.test.ts.
jest.mock(
  'cubing/alg',
  () => ({
    Alg: class MockAlg {
      str: string;
      constructor(str: string) {
        this.str = str;
      }
      invert() {
        const inverted = this.str
          .trim()
          .split(/\s+/)
          .reverse()
          .map((move: string) => {
            if (move.endsWith("'")) return move.slice(0, -1);
            if (move.endsWith('2')) return move;
            return move + "'";
          })
          .join(' ');
        return new MockAlg(inverted);
      }
      toString() {
        return this.str;
      }
    },
  }),
  { virtual: true }
);

// `src/logic/scramble.ts` also imports `scrambleGenerator3x3.ts` (3x3 pipeline),
// which pulls in `cubing/puzzles` - same ESM-only-export problem as above.
// Nothing here exercises that code path, so a trivial stub unblocks resolution.
jest.mock('cubing/puzzles', () => ({ cube3x3x3: {} }), { virtual: true });

// `react-native-worklets` ships unbuilt-for-Jest source (unreachable under
// Jest's default transform allowlist) - same class of problem as above. This
// mock simulates a same-thread runtime so `runOnSolverThread` still runs the
// real solver logic, just without an actual thread hop.
jest.mock(
  'react-native-worklets',
  () => ({
    createWorkletRuntime: jest.fn(() => ({})),
    runOnRuntime: jest.fn(
      (_runtime: unknown, worklet: (...args: unknown[]) => unknown) =>
        (...args: unknown[]) =>
          worklet(...args)
    ),
    runOnJS: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
  }),
  { virtual: true }
);

const SOLVER_TOKEN = /^[RUF]['2]?$/;
const FACES = ['R', 'U', 'F'];
const MODIFIERS = ['', "'", '2'];

function randomRUFSequence(length: number): string {
  const moves: string[] = [];
  let lastFace = '';
  for (let i = 0; i < length; i++) {
    const available = FACES.filter((f) => f !== lastFace);
    const face = available[Math.floor(Math.random() * available.length)];
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    moves.push(face + modifier);
    lastFace = face;
  }
  return moves.join(' ');
}

function expectRoundTripsToSolved(sequence: string): void {
  const target = applyScramble(sequence, true);
  const solution = solve2x2x2(target);
  const result = applyScramble(`${sequence} ${solution}`, true);
  expect(result).toEqual(solvedCube());
}

describe('solve2x2x2', () => {
  it('returns an empty solve for an already-solved state', () => {
    expect(solve2x2x2(solvedCube())).toBe('');
  });

  it('solves a single R move with its literal inverse', () => {
    expect(solve2x2x2(applyScramble('R', true))).toBe("R'");
  });

  it('is idempotent/repeatable across calls (tables built only once)', () => {
    const target = applyScramble('R U', true);
    expect(solve2x2x2(target)).toBe(solve2x2x2(target));
  });

  it.each([
    'R',
    'U',
    'F',
    "R'",
    "U'",
    "F'",
    'R2',
    'U2',
    'F2',
    'R U F',
    "R' U2 F R U'",
    "R U R' U' R U R' U'",
  ])('round-trips "%s" back to solved', (sequence) => {
    expectRoundTripsToSolved(sequence);
  });

  it('round-trips 20 random R/U/F sequences back to solved', () => {
    for (let trial = 0; trial < 20; trial++) {
      expectRoundTripsToSolved(randomRUFSequence(8 + Math.floor(Math.random() * 5)));
    }
  });

  it('only ever emits R/U/F tokens', () => {
    const target = applyScramble("R U R' U' R U R' U' R U", true);
    const solution = solve2x2x2(target);
    for (const token of solution.split(/\s+/).filter(Boolean)) {
      expect(token).toMatch(SOLVER_TOKEN);
    }
  });

  it('keeps solutions within a sane length bound across random targets', () => {
    for (let trial = 0; trial < 10; trial++) {
      const solution = solve2x2x2(applyScramble(randomRUFSequence(11), true));
      const moveCount = solution.split(/\s+/).filter(Boolean).length;
      expect(moveCount).toBeLessThanOrEqual(14);
    }
  });
});

describe('isReferenceCornerHome', () => {
  it('is true for the solved cube', () => {
    expect(isReferenceCornerHome(solvedCube())).toBe(true);
  });

  it('stays true after any R/U/F sequence (solver moves never touch the reference corner)', () => {
    for (let trial = 0; trial < 10; trial++) {
      expect(isReferenceCornerHome(applyScramble(randomRUFSequence(10), true))).toBe(true);
    }
  });

  it('is false after a move that touches the reference corner (D, opposite R/U/F)', () => {
    expect(isReferenceCornerHome(applyScramble('D', true))).toBe(false);
  });
});
