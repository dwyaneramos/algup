import { db } from './schema';
import { AlgSet, Case } from '@/src/logic/algsets';
import { type CaseWithProgress, type CaseState } from '@/src/logic/caseQueue';

export interface CaseWithFluency extends Case {
  fluency: number;
}

export interface AlgSetProgress {
  total: number;
  learning: number;
  reviewing: number;
  mastered: number;
  locked: number;
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


export function getAlgSetProgress(algset: string): AlgSetProgress {
  const result = db.getFirstSync<{
    total: number;
    learning: number;
    reviewing: number;
    mastered: number;
    locked: number;
  }>(`
    SELECT COUNT(*) as total,
      SUM(CASE WHEN COALESCE(cp.state, 'locked') = 'learning' THEN 1 ELSE 0 END) as learning,
      SUM(CASE WHEN COALESCE(cp.state, 'locked') = 'reviewing' THEN 1 ELSE 0 END) as reviewing,
      SUM(CASE WHEN COALESCE(cp.state, 'locked') = 'mastered' THEN 1 ELSE 0 END) as mastered,
      SUM(CASE WHEN COALESCE(cp.state, 'locked') = 'locked' THEN 1 ELSE 0 END) as locked
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
  `, [algset]);

  return result ?? { total: 0, learning: 0, reviewing: 0, mastered: 0, locked: 0 };
}

export function getAlgSets(): AlgSet[] {
  const algsets = db.getAllSync<{ id: string; name: string }>('SELECT * FROM algsets');
  return algsets.map(a => ({
    ...a,
    cases: db.getAllSync<Case>('SELECT * FROM cases WHERE algset = ?', [a.name])
  }));
}

export function getOverallFluency(algsetName: string): number {
  const result = db.getFirstSync<{ avg: number }>(`
    SELECT AVG(COALESCE(cp.fluency, 1.0)) as avg
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

export function getCasesWithFluency(algsetId: string): CaseWithFluency[] {
  return db.getAllSync<CaseWithFluency>(`
    SELECT c.*, COALESCE(cp.fluency, 1.0) as fluency
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset_id = ?
  `, [algsetId]);
}

export function saveCaseFluency(caseId: string, fluency: number) {
  db.runSync(`
    INSERT OR REPLACE INTO case_progress (case_id, fluency)
    VALUES (?, ?)
  `, [caseId, fluency]);
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
      COALESCE(cp.fluency, 1.0) AS fluency,
      COALESCE(cp.state, 'locked') AS state
    FROM cases c
    LEFT JOIN case_progress cp
      ON c.id = cp.case_id
    WHERE c.algset = ?
  `, [algset]);
}

export function updateCaseProgress(
  caseId: number,
  fluency: number,
  state: CaseState
) {
  db.runSync(`
    INSERT OR REPLACE INTO case_progress (
      case_id,
      fluency,
      state
    )
    VALUES (?, ?, ?)
  `, [caseId, fluency, state]);
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
      fluency,
      state
    )
    VALUES (?, 1.0, 'learning')
  `, [nextLocked.id]);
}
