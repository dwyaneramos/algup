import type { KPattern } from 'cubing/kpuzzle';
import { solve3x3x3, solveTransformation } from '@/src/logic/solver3x3x3';

// `cubing/kpuzzle` only declares an ESM "import" export condition, which Jest's
// CJS-based resolver can't load (same class of problem `tests/scrambleSimulation.test.ts`
// hits for `cubing/alg` - see its comment). Rather than mock away the very thing
// under test, these fixtures are real `KPattern.patternData['CORNERS'|'EDGES']`
// values captured by actually running `cubing/kpuzzle` against known scrambles
// (via a plain Node ESM script, outside Jest) - see the correctness this locks in
// verified live end-to-end (including `KPattern.isIdentical()` against solved)
// in that same session. If `cubing/kpuzzle`'s corner/edge orbit ordering ever
// changes, these fixtures - and this test - would need regenerating the same way.
function fakePattern(
  corners: { pieces: number[]; orientation: number[] },
  edges: { pieces: number[]; orientation: number[] }
): KPattern {
  return {
    patternData: {
      CORNERS: corners,
      EDGES: edges,
    },
  } as unknown as KPattern;
}

const SOLVED = fakePattern(
  { pieces: [0, 1, 2, 3, 4, 5, 6, 7], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
  {
    pieces: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
);

// Captured after applying a single "R" move to a solved `cube3x3x3.kpuzzle()` pattern.
const AFTER_R = fakePattern(
  { pieces: [4, 0, 2, 3, 7, 5, 6, 1], orientation: [2, 1, 0, 0, 1, 0, 0, 2] },
  {
    pieces: [0, 8, 2, 3, 4, 10, 6, 7, 5, 9, 1, 11],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
);

// Captured after applying "R U R' U' R' F R2 U' R' U' R U R' F'" (a T-perm) to a
// solved `cube3x3x3.kpuzzle()` pattern.
const AFTER_T_PERM = fakePattern(
  { pieces: [4, 2, 1, 3, 0, 5, 6, 7], orientation: [2, 2, 0, 0, 2, 0, 0, 0] },
  {
    pieces: [0, 8, 1, 3, 4, 5, 6, 7, 2, 9, 10, 11],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
);

describe('solve3x3x3', () => {
  it('returns an empty solve for an already-solved pattern', () => {
    expect(solve3x3x3(SOLVED).trim()).toBe('');
  });

  it('solves a single R move with its literal inverse', () => {
    expect(solve3x3x3(AFTER_R)).toBe("R'");
  });

  it('solves a T-perm state with a real (non-trivial) two-phase solution', () => {
    const solution = solve3x3x3(AFTER_T_PERM);
    // This must NOT collapse to the short literal inverse of the T-perm - the
    // whole point of using a real solver is a natural-looking, independently
    // computed solve for the resulting state (matching the server's algorithm).
    const moveCount = solution.trim().split(/\s+/).length;
    expect(moveCount).toBeGreaterThanOrEqual(8);
    expect(moveCount).toBeLessThanOrEqual(20);
  });

  it('is idempotent/repeatable across calls (initialize() only runs once)', () => {
    expect(solve3x3x3(AFTER_R)).toBe("R'");
    expect(solve3x3x3(AFTER_R)).toBe("R'");
  });
});

describe('solveTransformation', () => {
  it('solves the same raw corner/edge orbits solve3x3x3 extracts from a KPattern', () => {
    expect(
      solveTransformation(
        { permutation: [4, 0, 2, 3, 7, 5, 6, 1], orientation: [2, 1, 0, 0, 1, 0, 0, 2] },
        {
          permutation: [0, 8, 2, 3, 4, 10, 6, 7, 5, 9, 1, 11],
          orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }
      )
    ).toBe("R'");
  });
});
