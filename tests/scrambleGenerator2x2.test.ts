import { generateScramble2x2ForAlg } from '@/src/logic/scrambleGenerator2x2';
import { applyScramble, solvedCube, invertAlgorithm } from '@/src/logic/scramble';

// Same mocking rationale as tests/scrambleSimulation.test.ts /
// tests/solver2x2x2.test.ts - `cubing/alg` and `cubing/puzzles` are
// ESM-only and unreachable under Jest's CJS resolver; this pipeline never
// actually exercises them (that's the whole point of the dedicated 2x2
// solver), so trivial stubs unblock module resolution.
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
jest.mock('cubing/puzzles', () => ({ cube3x3x3: {} }), { virtual: true });

// `react-native-worklets` ships unbuilt-for-Jest source (unreachable under
// Jest's default transform allowlist) - same class of problem as the mocks
// above. This mock simulates a same-thread runtime so `runOnSolverThread`
// still runs the real solver logic, just without an actual thread hop.
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
const MIN_222_SCRAMBLE_LENGTH = 12;

function countMoves(alg: string): number {
  return alg.trim().split(/\s+/).filter(Boolean).length;
}

// A mix of R/U/F-only algs and algs using other faces/rotations, to exercise
// both the common case and the reference-corner correction path.
const SAMPLE_ALGS = [
  "R U R' U'",
  "R' F R F'",
  "R U R' F' R U R' U' R' F R2 U' R'",
  "L' U R U' L U R'",
  "D R D' R'",
  "x R U R' U'",
];

describe('generateScramble2x2ForAlg', () => {
  it.each(SAMPLE_ALGS)('produces an R/U/F-only scramble for alg "%s"', async (alg) => {
    const result = await generateScramble2x2ForAlg(alg, false);
    for (const token of result.scramble.split(/\s+/).filter(Boolean)) {
      expect(token).toMatch(SOLVER_TOKEN);
    }
  });

  it.each(SAMPLE_ALGS)('meets the minimum scramble length for alg "%s"', async (alg) => {
    const result = await generateScramble2x2ForAlg(alg, false);
    expect(countMoves(result.scramble)).toBeGreaterThanOrEqual(MIN_222_SCRAMBLE_LENGTH);
  });

  it.each(SAMPLE_ALGS)(
    'applying the scramble then the returned solution solves the cube for alg "%s"',
    async (alg) => {
      const result = await generateScramble2x2ForAlg(alg, false);
      const final = applyScramble(`${result.scramble} ${result.solution}`, true);
      expect(final).toEqual(solvedCube());
    }
  );

  it('is not literally the alg reversed', async () => {
    const alg = "R U R' U'";
    const result = await generateScramble2x2ForAlg(alg, false);
    expect(result.scramble).not.toBe(invertAlgorithm(alg));
  });

  it('produces an R/U/F-only, correctly-solving scramble with AUF wrapping enabled', async () => {
    const result = await generateScramble2x2ForAlg("R U R' U'", true);
    for (const token of result.scramble.split(/\s+/).filter(Boolean)) {
      expect(token).toMatch(SOLVER_TOKEN);
    }
    expect(countMoves(result.scramble)).toBeGreaterThanOrEqual(MIN_222_SCRAMBLE_LENGTH);
    const final = applyScramble(`${result.scramble} ${result.solution}`, true);
    expect(final).toEqual(solvedCube());
  });
});
