import { db } from './schema';
import { AlgSet, Case } from '@/src/logic/algsets';
import { type CaseWithProgress, type CaseState } from '@/src/logic/caseQueue';

export interface CaseWithConfidence extends Case {
  confidence: number;
}

export function getAlgSet(name: string): AlgSet | null {
  const algset = db.getFirstSync<{ name: string }>(
    'SELECT * FROM algsets WHERE name = ?', [name]
  );
  if (!algset) return null;
  return {
    ...algset,
    cases: db.getAllSync<Case>('SELECT * FROM cases WHERE algset = ?', [algset.name])
  };
}

export function getAlgSets(): AlgSet[] {
  const algsets = db.getAllSync<{ id: string; name: string }>('SELECT * FROM algsets');
  return algsets.map(a => ({
    ...a,
    cases: db.getAllSync<Case>('SELECT * FROM cases WHERE algset = ?', [a.name])
  }));
}

export function getAverageConfidence(algsetName: string): number {
  const result = db.getFirstSync<{ avg: number }>(`
    SELECT AVG(COALESCE(cp.confidence, 1.0)) as avg
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
  `, [algsetName]);
  return result?.avg ?? 1.0;
}

export function getCases(algsetName: string): Case[] {
  const cases = db.getAllSync<{ id: number; alg: string }>('SELECT * FROM cases WHERE algset = ?', [algsetName]);
  return cases;
}

export function getCasesWithConfidence(algsetId: string): CaseWithConfidence[] {
  return db.getAllSync<CaseWithConfidence>(`
    SELECT c.*, COALESCE(cp.confidence, 1.0) as confidence
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset_id = ?
  `, [algsetId]);
}

export function saveCaseConfidence(caseId: string, confidence: number) {
  db.runSync(`
    INSERT OR REPLACE INTO case_progress (case_id, confidence)
    VALUES (?, ?)
  `, [caseId, confidence]);
}

export function getSetting(key: string): string | null {
  const result = db.getFirstSync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?', [key]
  );
  return result?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.runSync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}


export function getCasesWithProgress(
  algset: string
): CaseWithProgress[] {
  return db.getAllSync<CaseWithProgress>(`
    SELECT c.*, 
      COALESCE(cp.confidence, 1.0) AS confidence,
      COALESCE(cp.state, 'locked') AS state
    FROM cases c
    LEFT JOIN case_progress cp
      ON c.id = cp.case_id
    WHERE c.algset = ?
  `, [algset]);
}

export function updateCaseProgress(
  caseId: number,
  confidence: number,
  state: CaseState
) {
  db.runSync(`
    INSERT OR REPLACE INTO case_progress (
      case_id,
      confidence,
      state
    )
    VALUES (?, ?, ?)
  `, [caseId, confidence, state]);
}

export function introduceNextCase(
  algset: string
): void {
  const nextLocked = db.getFirstSync<{ id: number }>(`
    SELECT c.id
    FROM cases c
    LEFT JOIN case_progress cp
      ON c.id = cp.case_id
    WHERE c.algset = ?
      AND (cp.state = 'locked' OR cp.state IS NULL)
    LIMIT 1
  `, [algset]);

  if (!nextLocked) return;

  db.runSync(`
    INSERT OR REPLACE INTO case_progress (
      case_id,
      confidence,
      state
    )
    VALUES (?, 1.0, 'learning')
  `, [nextLocked.id]);
}
