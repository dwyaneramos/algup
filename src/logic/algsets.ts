import {
  createAlgSetWithCases,
  applyAlgSetCaseChanges,
  renameAlgSet,
  setAlgSetFolder,
} from '@/src/db/queries';
import { clearPendingItem } from '@/src/logic/pendingScramble';
import { validateAlgorithm } from '@/src/logic/alg';
import { DEFAULT_ALGSETS } from '@/src/data/algsets';
import type { Case, AlgSet } from '@/types';

export const SELECTED_ALGSET_KEY = 'selectedAlgset';

export function validateAlgSetName(name: string): boolean {
  name = name.trim();
  return name.length > 0 && name.length <= 16;
}

const NUM_ALGS_LIMIT = 128;

export const algsetAlreadyExistsError = 'Algset name already exists';
export const algsetNameLengthError = 'Algset name must be between 1 and 16 characters';
export const algsetNoCasesError = 'Must include at least one alg';
export const invalidAlgError = (alg: string) => `Invalid algorithm: ${alg}`;
export const algsetInvalidLengthError = `Maximum number of algs is ${NUM_ALGS_LIMIT}`;

export function validateAlgSet(algset: AlgSet, existingAlgsets: AlgSet[]): string {
  if (algset.cases.length > NUM_ALGS_LIMIT) {
    return algsetInvalidLengthError;
  }
  if (existingAlgsets.some((a) => a.name === algset.name.trim())) {
    return algsetAlreadyExistsError;
  }
  if (validateAlgSetName(algset.name) === false) {
    return algsetNameLengthError;
  }

  if (algset.cases.length === 0) {
    return algsetNoCasesError;
  }

  for (const c of algset.cases) {
    if (validateAlgorithm(c.alg, algset.event) === false) {
      return invalidAlgError(c.alg);
    }
  }
  return '';
}

export function editAlgset(old: AlgSet, edited: AlgSet): boolean {
  try {
    const casesToDelete = old.cases.filter(
      (c) => !edited.cases.some((ec) => ec.alg.trim() === c.alg.trim())
    );
    const caseIDs = casesToDelete
      .filter((c: Case): c is Case & { id: number } => c.id !== undefined)
      .map((c) => c.id);

    const casesToInsert = edited.cases.filter(
      (ec) => !old.cases.some((c) => c.alg.trim() === ec.alg.trim())
    );

    if (old.name !== edited.name) {
      renameAlgSet(old.name, edited.name);
    }

    applyAlgSetCaseChanges(caseIDs, edited.name, casesToInsert);

    if ((old.folder ?? null) !== (edited.folder ?? null)) {
      setAlgSetFolder(edited.name, edited.folder ?? null);
    }

    clearPendingItem(edited.name);
    return true;
  } catch (error) {
    console.error(`Failed to edit algset "${edited.name}":`, error);
    return false;
  }
}

export function insertNewAlgSet(algset: AlgSet): boolean {
  try {
    createAlgSetWithCases(algset.name, algset.event, algset.cases);
    if (algset.folder) {
      setAlgSetFolder(algset.name, algset.folder);
    }
    return true;
  } catch (error) {
    console.error(`Failed to store new algset "${algset.name}":`, error);
    return false;
  }
}

// Default cases, sourced from src/data/algsets/*.ts.
export const ALG_SETS: AlgSet[] = DEFAULT_ALGSETS;
