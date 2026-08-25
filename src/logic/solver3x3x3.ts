import type { KPattern } from 'cubing/kpuzzle';
import type { Sequence } from 'alg';
// `alg` is the old, pre-`cubing`-monorepo standalone package that `min2phase`
// depends on for its return type; distinct from `cubing/alg`.
import * as oldAlg from 'alg';
import * as min2phaseModule from 'min2phase';

// `min2phase`'s own package.json declares `types` for a `solve(c: {cp,co,ep,eo}): string`
// signature, but that doesn't match what's actually shipped in its compiled
// `dist/min2phase.js` at runtime: the real `solve` takes an old-`kpuzzle`-style
// per-orbit Transformation object and returns an `alg` package `Sequence`, not a
// plain string (verified empirically against the installed package - its bundled
// `.d.ts` describes an unpublished/unreachable wrapper, not the actual bundle body).
// Hand-declare the real shape here instead of trusting the package's own types.
export type OldKPuzzleOrbit = { permutation: number[]; orientation: number[] };
type OldKPuzzleTransformation = {
  CORNER: OldKPuzzleOrbit;
  EDGE: OldKPuzzleOrbit;
  CENTER: OldKPuzzleOrbit;
};
interface Min2PhaseModule {
  initialize: () => void;
  solve: (state: OldKPuzzleTransformation) => Sequence;
}

const min2phase = min2phaseModule as unknown as Min2PhaseModule;

let initialized = false;
function ensureInitialized(): void {
  if (!initialized) {
    min2phase.initialize();
    initialized = true;
  }
}

// A standard Kociemba-style corner/edge solver doesn't track center orientation,
// so this field is unused by the search itself - but min2phase's internal
// `Combine`/`Invert` calls index into it unconditionally, so it must be present.
// Center-homing (needed before this is ever called, since an off-home center
// state would otherwise be silently ignored) is the caller's responsibility -
// see `withCentersHome` in `scrambleGenerator3x3.ts`.
const IDENTITY_CENTER: OldKPuzzleOrbit = {
  permutation: [0, 1, 2, 3, 4, 5],
  orientation: [0, 0, 0, 0, 0, 0],
};

/**
 * Synchronously solves raw corner/edge orbits (centers ignored - caller must
 * have already corrected for center homing) using min2phase's two-phase
 * algorithm, returning a move string (e.g. "R U R' F2"). Takes plain
 * permutation/orientation arrays rather than a `KPattern` since that's all
 * min2phase actually needs (see `solve3x3x3` for the `KPattern`-accepting
 * wrapper).
 */
export function solveTransformation(corners: OldKPuzzleOrbit, edges: OldKPuzzleOrbit): string {
  ensureInitialized();
  const transformation: OldKPuzzleTransformation = {
    CORNER: corners,
    EDGE: edges,
    CENTER: IDENTITY_CENTER,
  };
  const sequence = min2phase.solve(transformation);
  return oldAlg.algToString(sequence);
}

/**
 * Synchronously solves a 3x3x3 KPattern's corner/edge state. Thin wrapper
 * around `solveTransformation` for callers that already have a `KPattern`
 * (e.g. tests) - see `scrambleGenerator3x3.ts` for the call site used during
 * actual scramble generation.
 */
export function solve3x3x3(pattern: KPattern): string {
  const corners = pattern.patternData['CORNERS'];
  const edges = pattern.patternData['EDGES'];
  return solveTransformation(
    { permutation: corners.pieces, orientation: corners.orientation },
    { permutation: edges.pieces, orientation: edges.orientation }
  );
}
