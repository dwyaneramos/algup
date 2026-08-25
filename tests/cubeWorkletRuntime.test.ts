import { runOnSolverThread } from '@/src/logic/cubeWorkletRuntime';

// `react-native-worklets` ships unbuilt-for-Jest source (its `main` isn't
// transpiled under Jest's default transform allowlist) - mirrors the existing
// `cubing/alg` / `cubing/puzzles` precedent in tests/scrambleSimulation.test.ts.
// This mock simulates a same-thread runtime: `runOnRuntime` returns a function
// that invokes the worklet immediately, and `runOnJS` is the identity, since
// there's no real thread boundary to cross in a test. Jest's
// babel-plugin-jest-hoist hoists this call above the import above at
// transform time regardless of source order, so writing the import first
// here (for import/first lint compliance) is safe.
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

describe('runOnSolverThread', () => {
  it('resolves with the worklet function return value', async () => {
    await expect(runOnSolverThread(() => 42)).resolves.toBe(42);
  });

  it('rejects when the worklet function throws', async () => {
    await expect(
      runOnSolverThread(() => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
  });
});
