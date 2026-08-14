import { createAlgSet, insertCases, applyAlgSetCaseChanges, renameAlgSet } from "@/src/db/queries";
import { clearScrambleQueue } from "@/src/logic/pendingScramble";
import { validateAlgorithm } from "@/src/logic/alg";
import type { Case, AlgSet } from "@/types";

export const SELECTED_ALGSET_KEY = "selectedAlgset"

export function validateAlgSetName(name: string): boolean {
  name = name.trim()
  return name.length > 0 && name.length <= 32;
}

const NUM_ALGS_LIMIT = 128;

export const algsetAlreadyExistsError = "Algset name already exists";
export const algsetNameLengthError = "Algset name must be between 1 and 32 characters";
export const algsetNoCasesError = "Must include at least one alg";
export const invalidAlgError = (alg: string) => `Invalid algorithm: ${alg}`;
export const algsetInvalidLengthError = `Maximum number of algs is ${NUM_ALGS_LIMIT}`;


export function validateAlgSet(algset: AlgSet, existingAlgsets: AlgSet[]): string {

  if (algset.cases.length > NUM_ALGS_LIMIT) {
    return algsetInvalidLengthError;
  }
  if (existingAlgsets.some(a => a.name === algset.name.trim())) {
    return algsetAlreadyExistsError;
  }
  if (validateAlgSetName(algset.name) === false) {
    return algsetNameLengthError;
  }

  if (algset.cases.length === 0) {
    return algsetNoCasesError
  }

  for (const c of algset.cases) {
    if (validateAlgorithm(c.alg, algset.event) === false) {
      return invalidAlgError(c.alg);
    }
  }
  return "";
}

export function editAlgset(old: AlgSet, edited: AlgSet): boolean {
  try {
    const casesToDelete = old.cases.filter(
      c => !edited.cases.some(ec => ec.alg.trim() === c.alg.trim())
    );
    const caseIDs = casesToDelete
      .filter((c: Case): c is Case & { id: number } => c.id !== undefined)
      .map(c => c.id);

    const casesToInsert = edited.cases.filter(
      ec => !old.cases.some(c => c.alg.trim() === ec.alg.trim())
    );

    if (old.name !== edited.name) {
      renameAlgSet(old.name, edited.name);
    }

    applyAlgSetCaseChanges(caseIDs, edited.name, casesToInsert);
    clearScrambleQueue(edited.name);
    return true;
  } catch (error) {
    console.error(`Failed to edit algset "${edited.name}":`, error);
    return false;
  }
}

export function insertNewAlgSet(algset: AlgSet): boolean {
  try {
    createAlgSet(algset.name, algset.event);
    insertCases(algset);
    return true;

  } catch (error) {
    console.error(`Failed to store new algset "${algset.name}":`, error);
    return false;
  }

}

// Default cases
export const ALG_SETS: AlgSet[] = [
  {
    name: 'CMLL',
    event: '333',
    cases: [
      { alg: "R U2 R' U' R U' R2 U2 R U R' U R " },
      { alg: "r' U r U2 R2 F R F' R " },
      { alg: "(U') F R U' R' U R U R' F' " },
      { alg: "(U2) F R U R' U' R U' R' U' R U R' F' " },
      { alg: "(U') R U R' U' R' F R F' " },
      { alg: "R' U' R U' R' U R U' R' U F' U F R " },
      { alg: "(U') R' U' R U R' U R U2' R' U R U2' R' U' R " },
      { alg: "(U2) F R U R' U' R' U R U' F' U R' U' R " },
      { alg: "R' U2' R U2 F U' R' U R U F' " },
      { alg: "F R U' R' U R U R' U R U' R' F' " },
      { alg: "R2 D' R U2 R' D R U2 R " },
      { alg: "(U') F R U R' U' F' " },
      { alg: "(U) R' U' R U' R' U R U' R' U R U' R' U2' R " },
      { alg: "R' U' R U' R' U2' R2 U R' U' R' F R F' " },
      { alg: "F R' F' R U R U' R' " },
      { alg: "F R U' R' U' R U R' F' " },
      { alg: "(U') R' U2 R' D' R U2 R' D R2 " },
      { alg: "R U2 R2 F R F' R U2 R' " },
      { alg: "(U) R U R' U R U2' R' " },
      { alg: "(U) F R' F' R U2' R U2 R' " },
      { alg: "(U2) R' U' R U' R' U2 F R F' r U r' " },
      { alg: "(U) r U' r' F R' F' R " },
      { alg: "(U') R' U2 R U2 R f' U' f " },
      { alg: "(U2) R U R' U R' F R F' R U2 R' " },
      { alg: "(U2) R U2 R' U' R U' R' " },
      { alg: "(U2) F R U' R' U R U2 R' U' F' " },
      { alg: "(U') R U2 R' U2 R' F R F' " },
      { alg: "(U') R' F R F' r U r' " },
      { alg: "r U' r' F R' F' U2 R U R' U R " },
      { alg: "R' U' R U' R' U R' F R F' U R " },
      { alg: "F R U R' U' R U R' U' F' " },
      { alg: "(U) F U R U' R2' F' R U2 R U2' R' " },
      { alg: "(U') F R U' R' U' R U R' U R U' R' F' " },
      { alg: "R U2 R' U' R U R' U2' R' F R F' " },
      { alg: "(U2) R' F R F' r U' R' U' R U' r' " },
      { alg: "(U') R' U' R' F R F' R U' R' U2' R " },
      { alg: "(U) R' U' R U' R' U R U' R' U2 R " },
      { alg: "(U') R U R' U R U r' F R' F' r " },
      { alg: "(U) F R U' R' U R U2 R' U' R U R' U' F' " },
      { alg: "F R U R' U' R U R' U' R U R' U' F' " },
      { alg: "R U2 R' U' R U2 L' U R' U' L " },
      { alg: "F R U' R' U' R U R' F' R U R' U' R' F R F' " },
    ]
  },

  {
    name: 'PLL',
    event: '333',
    cases: [
      { alg: "U2 R2 U' R' U' R U R U R U' R " },
      { alg: "R' U R' U' R' U' R' U R U R2 " },
      { alg: "M2 U' M2 U2 M2 U' M2 " },
      {
        alg: "M' U' M2 U' M2 U' M' U2 M2 "
      },
      { alg: "l' U R' D2 R U' R' D2 R2 x' " },
      { alg: "x R2 D2 R U R' D2 R U' R x' " },
      { alg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x " },
      { alg: "R2 u R' U R' U' R u' R2 y' R' U R " },
      { alg: "U F' U' F R2 u R' U R U' R u' R2 " },
      { alg: "R2 u' R U' R U R' u R2 y R U' R' " },
      { alg: "R U R' y' R2 u' R U' R' U R' u R2 " },
      { alg: "R U R' F' R U2 R' U2 R' F R U R U2 R' " },
      { alg: "R' U2 R U2 R' F R U R' U' R' F' R2 " },
      { alg: "R' U L' U2 R U' R' U2 R L " },
      { alg: "R U R' F' R U R' U' R' F R2 U' R' U' " },
      { alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R' " },
      { alg: "z D' R U' R2 D R' U D' R U' R2 D R' U z' " },
      {
        alg: "F R U' R' U' R U R' F' R U R' U' R' F R F' "
      },
      { alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R " },
      { alg: "R U R' U' R' F R2 U' R' U' R U R' F' " },
      { alg: "R' U R' d' R' F' R2 U' R' U R' F R F " },
    ]
  },

  {
    name: 'OLL',
    event: '333',
    cases: [


      { alg: "R U2 R2' F R F' U2 R' F R F' " },
      { alg: "F R U R' U' F' f R U R' U' f' " },
      { alg: "U' f R U R' U' f' U' F R U R' U' F' " },
      {
        alg: "U' f R U R' U' f' U F R U R' U' F' "
      },
      { alg: "r' U2 R U R' U r " },
      { alg: "r U2 R' U' R U' r' " },
      { alg: "r U R' U R U2 r' " },
      { alg: "U2 r' U' R U' R' U2 r " },
      { alg: "U R U R' U' R' F R2 U R' U' F' " },
      { alg: "R U R' U R' F R F' R U2 R' " },
      { alg: "r' R2 U R' U R U2 R' U M' " },
      { alg: "F R U R' U' F' U F R U R' U' F' " },
      { alg: "r U' r' U' r U r' F' U F " },
      { alg: "R' F R U R' F' R F U' F' " },
      { alg: "U2 l' U' l L' U' L U l' U l " },
      { alg: "r U r' R U R' U' r U' r' " },
      { alg: "R U R' U R' F R F' U2 R' F R F' " },
      { alg: "r U R' U R U2 r2 U' R U' R' U2 r " },
      { alg: "M U R U R' U' M' R' F R F' " },
      { alg: "M U R U R' U' M2 U R U' r' " },
      { alg: "U R U2 R' U' R U R' U' R U' R' " },
      { alg: "R U2 R2 U' R2 U' R2 U2 R " },
      { alg: "R2 D R' U2 R D' R' U2 R' " },
      { alg: "r U R' U' r' F R F' " },
      { alg: "U F' r U R' U' r' F R " },
      { alg: "U R U2 R' U' R U' R' " },
      { alg: "R U R' U R U2 R' " },
      { alg: "r U R' U' M U R U' R' " },
      {
        alg: "M U R U R' U' R' F R F' M' "
      },
      { alg: "U' r' D' r U' r' D r2 U' r' U r U r' " },
      { alg: "R' U' F U R U' R' F' R " },
      { alg: "S R U R' U' R' F R f' " },
      { alg: "R U R' U' R' F R F' " },
      { alg: "U2 R U R' U' B' R' F R F' B " },
      { alg: "R U2 R2' F R F' R U2 R' " },
      { alg: "U2 L' U' L U' L' U L U L F' L' F " },
      { alg: "F R U' R' U' R U R' F' " },
      { alg: "R U R' U R U' R' U' R' F R F' " },
      { alg: "U L F' L' U' L U F U' L' " },
      { alg: "U R' F R U R' U' F' U R " },
      { alg: "U2 R U R' U R U2' R' F R U R' U' F' " },
      { alg: "R' U' R U' R' U2 R F R U R' U' F' " },
      { alg: "f' L' U' L U f " },
      { alg: "f R U R' U' f' " },
      { alg: "F R U R' U' F' " },
      { alg: "R' U' R' F R F' U R " },
      { alg: "F' L' U' L U L' U' L U F " },
      { alg: "F R U R' U' R U R' U' F' " },
      { alg: "U2 r U' r2 U r2 U r2 U' r " },
      { alg: "r' U r2 U' r2' U' r2 U r' " },
      { alg: "f R U R' U' R U R' U' f' " },
      {
        alg: "R U R' U R d' R U' R' F' "
      },
      { alg: "r' U' R U' R' U R U' R' U2 r " },
      { alg: "r U R' U R U' R' U R U2 r' " },
      { alg: "R U2 R2 U' R U' R' U2 F R F' " },
      { alg: "r U r' U R U' R' U R U' R' r U' r' " },
      { alg: "R U R' U' M' U R U' r' " },
    ]
  },

  {
    name: 'CLL',
    event: '222',
    cases: [
      { alg: "R U R' U R U2 R'" },
      { alg: "U' R' F R2 F' R U2 R' U' R2" },
      { alg: "F R' F' R U2 R U2 R'" },
      { alg: "R U' R' F L' U' L" },
      { alg: "U2 R U' R U' R' U R' U' y R U' R'" },
      { alg: "L' U2 L U2 L F' L' F" },
      { alg: "R' U' R U' R' U2 R" },
      { alg: "R U2 R' F R' F' R U' R U' R'" },
      { alg: "U2 F' L F L' U2 L' U2 L" },
      { alg: "U2 L' U L F' R U R'" },
      { alg: "U2 R U2 R' U2 R' F R F'" },
      { alg: "U2 L' U2 L F' R' F2 R U' R' F R F'" },
      { alg: "F R U R' U' R U R' U' F'" },
      { alg: "U' R' U' R' F R F' R U' R' U2 R" },
      { alg: "R U' R' F R' F R U R' F R" },
      { alg: "U' R U' R U' R' U R' F R2 F'" },
      { alg: "R U2 R' U' R U R' U2 R' F R F'" },
      { alg: "R' F2 R F' U2 R U' R' U' F" },
      { alg: "U' F R U R' U' F'" },
      { alg: "U R U' R U' R U' R' U R' U R'" },
      { alg: "U' z' U2 R' U' R2 U' R' U' R U' R' U' x2" },
      { alg: "x R U' R U' R' U L' U' L x2" },
      { alg: "U2 R U2 R' U R' F2 R F' R' F2 R" },
      { alg: "R' U R' F R F' R U2 R' U R" },
      { alg: "U2 F' R U R' U' R' F R" },
      { alg: "U F R' F' R U R U' R'" },
      { alg: "U R U2 R2' F R F' R U2' R'" },
      { alg: "U2 R' U R' U2 R U' R' U R U' R2" },
      { alg: "U R U2 R' U' y' R2 U' R' U R2" },
      { alg: "R' F' R U R' U' R' F R2 U' R' U2 R" },
      { alg: "U' R U R' U' R' F R F'" },
      { alg: "U L' U' L U L F' L' F" },
      { alg: "F U' R U2 R' U' F2 R U R'" },
      { alg: "U R' U R' F U' R U F2 R2" },
      { alg: "U2 F R U R' U' R U' R' U' R U R' F'" },
      { alg: "R' U R U2 R2 F R F' R" },
      { alg: "U R2 U2 R U2' R2'" },
      { alg: "U F R U R' U' R U R' U' R U R' U' F'" },
      { alg: "R U R' U R U R' F R' F' R" },
      { alg: "F R2 U' R2' U' R2 U R2' F'" },
    ]
  },
];


