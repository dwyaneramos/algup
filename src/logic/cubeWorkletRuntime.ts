import { createWorkletRuntime, runOnRuntime, runOnJS } from 'react-native-worklets';
import type { WorkletRuntime } from 'react-native-worklets';

// Cube solving (min2phase, the 2x2's IDA* search) is CPU-heavy and runs
// synchronously - dispatching it onto its own background WorkletRuntime keeps
// it off the main JS thread so the UI doesn't freeze while a scramble
// generates. One runtime is created lazily and reused for every solve call
// rather than spun up per-call, since creating a runtime is itself real work.
let runtime: WorkletRuntime | null = null;
function getSolverRuntime(): WorkletRuntime {
  if (!runtime) {
    runtime = createWorkletRuntime({ name: 'cube-solver' });
  }
  return runtime;
}

/**
 * Runs `worklet` on the shared background solver runtime and resolves with
 * its return value. `worklet` must carry its own `'worklet'` directive (and
 * only close over data reachable from that directive) so Babel's worklet
 * transform can serialize it across the runtime boundary.
 */
export function runOnSolverThread<T>(worklet: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    const dispatch = runOnRuntime(getSolverRuntime(), () => {
      'worklet';
      try {
        const result = worklet();
        runOnJS(resolve)(result);
      } catch (e) {
        runOnJS(reject)(e as Error);
      }
    });
    dispatch();
  });
}
