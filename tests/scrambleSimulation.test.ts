import { applyScramble, solvedCube, invertAlgorithm } from '@/src/logic/scramble';
import type { CubeState } from '@/types';

// `cubing/alg`'s package.json only declares an "import" (ESM) export
// condition for its subpaths, which Jest's CJS-based resolver can't load —
// the real module fails to resolve at all under this test runner (works
// fine in the actual Metro-bundled app). `tests/scramble.test.ts` (the
// Vitest suite for the server) hits the same class of problem and mocks a
// different `cubing/*` subpath for the same reason; this mirrors that
// precedent with a behaviorally-accurate mock (reverse move order, invert
// each move's modifier) so `invertAlgorithm` itself is still exercised for
// real, not stubbed out. Jest's babel-plugin-jest-hoist hoists this call
// above the import above at transform time regardless of source order, so
// writing the import first here (for import/first lint compliance) is safe.
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

// `src/logic/scramble.ts` also re-exports `generateScrambleFromAlg`, which now
// imports `src/logic/scrambleGenerator3x3.ts` for real - that pulls in `cubing/puzzles`,
// which hits the same ESM-only-export-condition problem as `cubing/alg` above under Jest's
// CJS resolver. Nothing in this file exercises that code path, so a trivial stub is enough
// to unblock module resolution.
jest.mock('cubing/puzzles', () => ({ cube3x3x3: {} }), { virtual: true });

// Local sticker positions (index % 9) that hold a 2x2's corner pieces —
// mirrors the CORNER_POSITIONS set in src/logic/scramble.ts. Kept as a
// separate literal here (not imported) so these tests exercise the public
// applyScramble contract, not an implementation-internal symbol.
const CORNER_LOCAL_POSITIONS = [0, 2, 6, 8];
const EDGE_CENTER_LOCAL_POSITIONS = [1, 3, 4, 5, 7];

const FACE_MOVES = ['U', 'R', 'F', 'D', 'L', 'B'];
const SLICE_MOVES = ['M', 'E', 'S'];
const ROTATIONS = ['x', 'y', 'z'];
const WIDE_MOVES = ['r', 'l', 'u', 'd', 'f', 'b'];
const ALL_MOVES = [...FACE_MOVES, ...SLICE_MOVES, ...ROTATIONS, ...WIDE_MOVES];

function cornerStickers(cube: CubeState): string[] {
  return cube.filter((_: string, i: number) => CORNER_LOCAL_POSITIONS.includes(i % 9));
}

function edgeCenterStickers(cube: CubeState): string[] {
  return cube.filter((_: string, i: number) => EDGE_CENTER_LOCAL_POSITIONS.includes(i % 9));
}

describe('solvedCube', () => {
  it('returns 54 stickers', () => {
    expect(solvedCube()).toHaveLength(54);
  });

  it('returns six uniform 9-sticker faces in U R F D L B order', () => {
    expect(solvedCube()).toEqual([
      ...Array(9).fill('Y'),
      ...Array(9).fill('O'),
      ...Array(9).fill('G'),
      ...Array(9).fill('W'),
      ...Array(9).fill('R'),
      ...Array(9).fill('B'),
    ]);
  });
});

describe('applyScramble - 3x3 (cornersOnly=false)', () => {
  it.each(FACE_MOVES)('a single %s move changes the cube from solved', (move) => {
    expect(applyScramble(move, false)).not.toEqual(solvedCube());
  });

  it.each(ALL_MOVES)('applying %s four times returns to solved', (move) => {
    const result = applyScramble([move, move, move, move].join(' '), false);
    expect(result).toEqual(solvedCube());
  });

  it.each(FACE_MOVES)('%s followed by its inverse returns to solved', (move) => {
    const result = applyScramble(`${move} ${move}'`, false);
    expect(result).toEqual(solvedCube());
  });

  it('U2 is equivalent to applying U twice', () => {
    expect(applyScramble('U2', false)).toEqual(applyScramble('U U', false));
  });

  it("a triple turn (R3) is equivalent to a single counter-clockwise turn (R')", () => {
    expect(applyScramble('R3', false)).toEqual(applyScramble("R'", false));
  });

  it('strips parentheses via sanitiseAlgorithm before applying moves', () => {
    const withParens = applyScramble("(R U) (R' U')", false);
    const withoutParens = applyScramble("R U R' U'", false);
    expect(withParens).toEqual(withoutParens);
  });

  it('tolerates extra whitespace between moves', () => {
    const spaced = applyScramble("R   U    R'  U'", false);
    const normal = applyScramble("R U R' U'", false);
    expect(spaced).toEqual(normal);
  });

  it('produces a 54-length state for a long mixed-notation scramble', () => {
    const result = applyScramble("R U R' U' F2 B D2 L' x y z M E S r l u d f b", false);
    expect(result).toHaveLength(54);
  });
});

describe('invertAlgorithm', () => {
  it('reverses move order and inverts each move', () => {
    expect(invertAlgorithm("R U R' U'")).toBe("U R U' R'");
  });

  it('leaves double turns unchanged (2 is its own inverse)', () => {
    expect(invertAlgorithm('U2')).toBe('U2');
  });

  it('composed with the original scramble returns the cube to solved', () => {
    const scramble = "R U R' U' F2 B D2 L'";
    const result = applyScramble(`${scramble} ${invertAlgorithm(scramble)}`, false);
    expect(result).toEqual(solvedCube());
  });
});

describe('applyScramble - 2x2 (cornersOnly=true)', () => {
  it.each(ALL_MOVES)('%s leaves every edge/center sticker unchanged from solved', (move) => {
    const result = applyScramble(move, true);
    expect(edgeCenterStickers(result)).toEqual(edgeCenterStickers(solvedCube()));
  });

  it.each(SLICE_MOVES)(
    '%s (a pure slice move) is a full no-op — a 2x2 has no slice layer',
    (move) => {
      expect(applyScramble(move, true)).toEqual(solvedCube());
    }
  );

  it.each(['U', 'R', 'F', 'D', 'L', 'B'])("%s still visibly changes the cube's corners", (move) => {
    expect(applyScramble(move, true)).not.toEqual(solvedCube());
  });

  it.each(FACE_MOVES)(
    'cornersOnly does not change what a full 3x3 application computes at corner positions (%s)',
    (move) => {
      const scramble = `${move} U R' F2 D L B'`;
      const full = applyScramble(scramble, false);
      const cornersOnly = applyScramble(scramble, true);
      expect(cornerStickers(cornersOnly)).toEqual(cornerStickers(full));
    }
  );

  it('U applied four times under cornersOnly returns fully to solved', () => {
    const result = applyScramble('U U U U', true);
    expect(result).toEqual(solvedCube());
  });

  it('a long scramble mixing face, slice, and rotation moves still leaves edges/centers pinned to solved', () => {
    const result = applyScramble("R U R' U' F2 B D2 L' x y z M E S r l u d f b", true);
    expect(edgeCenterStickers(result)).toEqual(edgeCenterStickers(solvedCube()));
  });

  it('slice moves interspersed with face moves do not disturb the pinned edges/centers', () => {
    const result = applyScramble("R M U E R' S", true);
    expect(edgeCenterStickers(result)).toEqual(edgeCenterStickers(solvedCube()));
  });
});
