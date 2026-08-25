import { applyMove, solvedCube } from './scramble';
import type { CubeState } from '@/types';

// A 2x2's legal corner states form a group of 7! * 3^6 = 3,674,160 elements
// once one corner is fixed as a reference frame - R, U and F alone generate
// this entire group (the standard WCA 2x2 notation), and every R/U/F move
// leaves the corner diagonally opposite them (the one touching none of R, U,
// or F) untouched. That state space is small enough for a hand-rolled IDA*
// search with two small pruning tables to run comfortably on-device, unlike
// the full 3x3 problem (which needs min2phase's two-phase machinery).

const SOLVER_MOVES = ['R', "R'", 'R2', 'U', "U'", 'U2', 'F', "F'", 'F2'] as const;
type SolverMove = (typeof SOLVER_MOVES)[number];

const CORNER_LOCAL_POSITIONS = new Set([0, 2, 6, 8]);
function isCornerSticker(i: number): boolean {
  return CORNER_LOCAL_POSITIONS.has(i % 9);
}
const CORNER_INDICES = Array.from({ length: 54 }, (_, i) => i).filter(isCornerSticker);

interface DecodedGroup {
  piece: number;
  orientation: number;
}

// Matches an observed sticker triple against each piece's canonical
// (rotation-0) signature under every rotation, recovering both which piece
// occupies the slot and its twist. Works identically for real colors and for
// the label-string "signatures" used to derive move effects below.
function decodeGroup(observed: [string, string, string], signatures: string[][]): DecodedGroup {
  for (let piece = 0; piece < signatures.length; piece++) {
    const sig = signatures[piece];
    for (let orientation = 0; orientation < 3; orientation++) {
      if (
        observed[0] === sig[orientation % 3] &&
        observed[1] === sig[(orientation + 1) % 3] &&
        observed[2] === sig[(orientation + 2) % 3]
      ) {
        return { piece, orientation };
      }
    }
  }
  throw new Error('2x2 corner decode failed: no matching piece/orientation for observed stickers');
}

function decodeCornerState(
  state: CubeState,
  groups: number[][],
  signatures: string[][]
): { perm: number[]; ori: number[] } {
  const perm: number[] = [];
  const ori: number[] = [];
  for (const [i0, i1, i2] of groups) {
    const { piece, orientation } = decodeGroup([state[i0], state[i1], state[i2]], signatures);
    perm.push(piece);
    ori.push(orientation);
  }
  return { perm, ori };
}

interface MoveEffect {
  // permutation[d] is the position that feeds destination position d.
  permutation: number[];
  orientationDelta: number[];
}

const IDENTITY_PERM = [0, 1, 2, 3, 4, 5, 6];
const IDENTITY_ORI = [0, 0, 0, 0, 0, 0, 0];
const PERM_TABLE_SIZE = 5040; // 7!
const ORI_TABLE_SIZE = 729; // 3^6

// Applying a move updates each destination position from a FIXED source
// position (a property of the move alone, not of the current state) - so
// permutation and orientation each evolve as their own independent
// dynamical system, which is what lets the two pruning tables below be
// built in isolation instead of over the full 3.67M-state product space.
function applyMoveEffect(
  perm: number[],
  ori: number[],
  effect: MoveEffect
): { perm: number[]; ori: number[] } {
  const newPerm = effect.permutation.map((src) => perm[src]);
  const newOri = effect.permutation.map((src, d) => (ori[src] + effect.orientationDelta[d]) % 3);
  return { perm: newPerm, ori: newOri };
}

function encodePerm(perm: number[]): number {
  const used = new Array(perm.length).fill(false);
  let rank = 0;
  for (let i = 0; i < perm.length; i++) {
    let smallerUnused = 0;
    for (let v = 0; v < perm[i]; v++) {
      if (!used[v]) smallerUnused++;
    }
    used[perm[i]] = true;
    rank = rank * (perm.length - i) + smallerUnused;
  }
  return rank;
}

function encodeOri(ori: number[]): number {
  let value = 0;
  for (let i = 0; i < 6; i++) {
    value = value * 3 + ori[i];
  }
  return value;
}

// Everything below depends on `applyMove`/`solvedCube` from `./scramble` -
// and `./scramble` imports this module's sibling `scrambleGenerator2x2.ts`,
// which imports this file, so `./scramble`'s exports aren't guaranteed to be
// populated yet at *this* module's load time. Deferring all of this behind
// `ensureInitialized()` (called only once real solving happens, well after
// the whole module graph has finished loading) avoids that circular-import
// hazard - and, as a bonus, keeps app startup cost at zero for users who
// never touch a 2x2 algset.
// Each of the 7 movable groups' 3 global sticker indices, reordered so that
// reading them in this order gives a *rotationally consistent* signature
// across all 7 corners - see `deriveCanonicalOrders` for why plain ascending
// sort of each group's own indices does NOT give this (it can appear
// reflected relative to another group's ascending order, depending on how
// this specific cube's sticker numbering happens to lay out that corner).
let CANONICAL_ORDER: number[][];
let REFERENCE_GROUP: number[];
let PIECE_SIGNATURES: string[][];
let MOVE_EFFECTS: Record<SolverMove, MoveEffect>;
let permTable: Uint8Array;
let oriTable: Uint8Array;
let initialized = false;

function buildCornerGroups(labeled: CubeState): {
  movableGroups: number[][];
  referenceGroup: number[];
} {
  function movedCornerIndices(face: string): Set<number> {
    const after = applyMove(labeled, face, true);
    const moved = new Set<number>();
    for (const i of CORNER_INDICES) {
      if (after[i] !== labeled[i]) moved.add(i);
    }
    return moved;
  }

  const movedR = movedCornerIndices('R');
  const movedU = movedCornerIndices('U');
  const movedF = movedCornerIndices('F');

  // A corner's 3 stickers always move together under any face turn, so the
  // (moved-by-R, moved-by-U, moved-by-F) fingerprint uniquely identifies
  // each of the 8 corners - all 8 possible 3-bit fingerprints occur exactly
  // once. The corner with fingerprint 0 (untouched by all three) is this
  // solver's fixed reference frame; the other 7 become movable pieces 0-6,
  // indexed by fingerprint - 1.
  const byFingerprint = new Map<number, number[]>();
  for (const i of CORNER_INDICES) {
    const fingerprint = (movedR.has(i) ? 1 : 0) | (movedU.has(i) ? 2 : 0) | (movedF.has(i) ? 4 : 0);
    if (!byFingerprint.has(fingerprint)) byFingerprint.set(fingerprint, []);
    byFingerprint.get(fingerprint)!.push(i);
  }

  if (byFingerprint.size !== 8 || [...byFingerprint.values()].some((g) => g.length !== 3)) {
    throw new Error('2x2 corner-group derivation failed: expected 8 groups of 3 stickers');
  }
  for (const group of byFingerprint.values()) group.sort((a, b) => a - b);

  const movableGroups = [1, 2, 3, 4, 5, 6, 7].map((code) => byFingerprint.get(code)!);
  const referenceGroup = byFingerprint.get(0)!;
  return { movableGroups, referenceGroup };
}

// Ascending-sorting each group's own indices independently (as
// `buildCornerGroups` does, just to have *some* fixed 3-tuple per group) is
// not enough to serve as a signature: two corners' sticker-index numbering
// need not share the same rotational handedness, so one group's ascending
// order can come out as a *reflection* of another's rather than a rotation
// of it - which breaks the orientation arithmetic IDA* relies on. Instead,
// derive every group's order by propagation: start from one group's raw
// order as the arbitrary reference ("orientation 0"), then for every move
// that carries an already-canonicalized piece to a new group, DEFINE that
// new group's order directly from the observed labels (rather than
// independently inventing one and checking if it matches) - by
// construction this can never conflict, since orientation is a real
// physical (path-independent) invariant of the piece, not something this
// function is choosing.
function deriveCanonicalOrders(labeled: CubeState, movableGroups: number[][]): number[][] {
  const n = movableGroups.length;
  const rawPieceOf = new Map<number, number>();
  movableGroups.forEach((group, piece) => {
    for (const i of group) rawPieceOf.set(i, piece);
  });

  const canonicalOrder: number[][] = new Array(n);
  canonicalOrder[0] = [...movableGroups[0]];
  const discovered = new Set<number>([0]);
  let frontier = [0];

  while (discovered.size < n && frontier.length > 0) {
    const next: number[] = [];
    for (const sourcePiece of frontier) {
      const sourceSignature = canonicalOrder[sourcePiece].map(String);
      for (const move of SOLVER_MOVES) {
        const after = applyMove(labeled, move, true);
        for (let d = 0; d < n; d++) {
          if (discovered.has(d)) continue;
          const group = movableGroups[d];
          const observed = group.map((i) => after[i]);
          if (observed.some((label) => rawPieceOf.get(Number(label)) !== sourcePiece)) continue;

          canonicalOrder[d] = sourceSignature.map((label) => group[observed.indexOf(label)]);
          discovered.add(d);
          next.push(d);
        }
      }
    }
    frontier = next;
  }

  if (discovered.size !== n) {
    throw new Error('2x2 canonical-order derivation failed to reach all movable corners');
  }
  return canonicalOrder;
}

function buildMoveEffects(
  labeled: CubeState,
  labelSignatures: string[][]
): Record<SolverMove, MoveEffect> {
  const effects = {} as Record<SolverMove, MoveEffect>;
  for (const move of SOLVER_MOVES) {
    const after = applyMove(labeled, move, true);
    const { perm, ori } = decodeCornerState(after, CANONICAL_ORDER, labelSignatures);
    effects[move] = { permutation: perm, orientationDelta: ori };
  }
  return effects;
}

function buildPermTable(): Uint8Array {
  const table = new Uint8Array(PERM_TABLE_SIZE).fill(255);
  table[encodePerm(IDENTITY_PERM)] = 0;
  let frontier: number[][] = [IDENTITY_PERM];
  let depth = 0;
  while (frontier.length > 0) {
    const next: number[][] = [];
    for (const perm of frontier) {
      for (const move of SOLVER_MOVES) {
        const newPerm = MOVE_EFFECTS[move].permutation.map((src) => perm[src]);
        const rank = encodePerm(newPerm);
        if (table[rank] === 255) {
          table[rank] = depth + 1;
          next.push(newPerm);
        }
      }
    }
    frontier = next;
    depth++;
  }
  return table;
}

function buildOriTable(): Uint8Array {
  const table = new Uint8Array(ORI_TABLE_SIZE).fill(255);
  table[encodeOri(IDENTITY_ORI)] = 0;
  let frontier: number[][] = [IDENTITY_ORI];
  let depth = 0;
  while (frontier.length > 0) {
    const next: number[][] = [];
    for (const ori of frontier) {
      for (const move of SOLVER_MOVES) {
        const effect = MOVE_EFFECTS[move];
        const newOri = effect.permutation.map(
          (src, d) => (ori[src] + effect.orientationDelta[d]) % 3
        );
        const code = encodeOri(newOri);
        if (table[code] === 255) {
          table[code] = depth + 1;
          next.push(newOri);
        }
      }
    }
    frontier = next;
    depth++;
  }
  return table;
}

function ensureInitialized(): void {
  if (initialized) return;

  const labeled: CubeState = Array.from({ length: 54 }, (_, i) => String(i));
  const { movableGroups, referenceGroup } = buildCornerGroups(labeled);
  REFERENCE_GROUP = referenceGroup;
  CANONICAL_ORDER = deriveCanonicalOrders(labeled, movableGroups);
  PIECE_SIGNATURES = CANONICAL_ORDER.map((group) => group.map((i) => solvedCube()[i]));
  const labelSignatures = CANONICAL_ORDER.map((group) => group.map(String));
  MOVE_EFFECTS = buildMoveEffects(labeled, labelSignatures);
  permTable = buildPermTable();
  oriTable = buildOriTable();

  initialized = true;
}

function heuristic(perm: number[], ori: number[]): number {
  // Both tables measure distance over the same 7 pieces under the same
  // moves, not disjoint piece groups - max is the correct, admissible way
  // to combine them (summing would double-count and break admissibility).
  return Math.max(permTable[encodePerm(perm)], oriTable[encodeOri(ori)]);
}

const FOUND = -1;

function search(
  perm: number[],
  ori: number[],
  g: number,
  bound: number,
  lastFace: string,
  path: SolverMove[]
): number {
  const h = heuristic(perm, ori);
  const f = g + h;
  if (f > bound) return f;
  if (h === 0) return FOUND;

  let min = Infinity;
  for (const move of SOLVER_MOVES) {
    const face = move[0];
    if (face === lastFace) continue;
    const next = applyMoveEffect(perm, ori, MOVE_EFFECTS[move]);
    path.push(move);
    const result = search(next.perm, next.ori, g + 1, bound, face, path);
    if (result === FOUND) return FOUND;
    if (result < min) min = result;
    path.pop();
  }
  return min;
}

function idaStarSolve(perm: number[], ori: number[]): SolverMove[] {
  const path: SolverMove[] = [];
  let bound = heuristic(perm, ori);
  while (true) {
    const result = search(perm, ori, 0, bound, '', path);
    if (result === FOUND) return [...path];
    if (result === Infinity) {
      throw new Error('2x2 solver: no R/U/F solution found for target corner state');
    }
    bound = result;
  }
}

/**
 * Synchronously solves a 2x2 corner state using only R, U, F moves,
 * returning a move string (e.g. "R U' F2"). The reference corner (the one
 * untouched by R/U/F) must already match `solvedCube()` in `targetState` -
 * see `isReferenceCornerHome`.
 */
export function solve2x2x2(targetState: CubeState): string {
  ensureInitialized();
  const { perm, ori } = decodeCornerState(targetState, CANONICAL_ORDER, PIECE_SIGNATURES);
  return idaStarSolve(perm, ori).join(' ');
}

export function isReferenceCornerHome(state: CubeState): boolean {
  ensureInitialized();
  const solved = solvedCube();
  return REFERENCE_GROUP.every((i) => state[i] === solved[i]);
}
