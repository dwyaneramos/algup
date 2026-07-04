import { AlgSet, Case } from '@/src/logic/algsets';
import { type CaseWithProgress, type CaseState } from '@/src/logic/caseQueue';
import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

function getDb() {
  if (!_db) {
    _db = SQLite.openDatabaseSync('algup.db');
  }
  return _db;
}

export interface AlgSetProgress {
  total: number;
  learning: number;
  reviewing: number;
  mastered: number;
  locked: number;
}

export function getAlgSet(name: string): AlgSet | null {
  const db = getDb();
  const algset = db.getFirstSync<{ name: string }>(
    'SELECT * FROM algsets WHERE name = ?', [name]
  );
  if (!algset) return null;
  return {
    ...algset,
    cases: db.getAllSync<Case>('SELECT * FROM cases WHERE algset = ?', [algset.name])
  };
}

export function insertCases(algset: AlgSet): void {
  const db = getDb();
  db.withTransactionSync(() => {
    for (const c of algset.cases) {
      db.runSync(
        'INSERT OR IGNORE INTO cases (algset, alg) VALUES (?, ?)',
        [algset.name, c.alg]
      );
    }
  });
}


export function createAlgSet(name: string): void {
  const db = getDb();
  db.runSync(
    'INSERT OR IGNORE INTO algsets (name) VALUES (?)',
    [name]
  );
}

export function deleteAlgset(algsetName: string): void {
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync(
      `DELETE FROM case_progress
       WHERE case_id IN (SELECT id FROM cases WHERE algset = ?)`,
      [algsetName]
    );

    db.runSync(
      'DELETE FROM cases WHERE algset = ?',
      [algsetName]
    );

    db.runSync(
      'DELETE FROM algsets WHERE name = ?',
      [algsetName]
    );
  });
}

export function getFirstCase(algsetName: string): Case | null {
  const db = getDb();
  return db.getFirstSync<Case>(
    'SELECT * FROM cases WHERE algset = ? ORDER BY id ASC LIMIT 1',
    [algsetName]
  );
}


export function getAlgSetProgress(algset: string): AlgSetProgress {
  const db = getDb();
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
  const db = getDb();
  const algsets = db.getAllSync<{ id: string; name: string }>('SELECT * FROM algsets');
  return algsets.map(a => ({
    ...a,
    cases: db.getAllSync<Case>('SELECT * FROM cases WHERE algset = ?', [a.name])
  }));
}

export function getOverallFluency(algsetName: string): number {
  const db = getDb();
  const result = db.getFirstSync<{ avg: number }>(`
    SELECT AVG(COALESCE(cp.fluency, 1.0)) as avg
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
  `, [algsetName]);
  return result?.avg ?? 1.0;
}

export function getCases(algsetName: string): Case[] {
  const db = getDb();
  const cases = db.getAllSync<{ id: number; alg: string }>('SELECT * FROM cases WHERE algset = ?', [algsetName]);
  return cases;
}

export async function getCasesWithProgress(algset: string): Promise<CaseWithProgress[]> {
  const db = getDb();
  return db.getAllAsync<CaseWithProgress>(`
    SELECT c.*, 
      COALESCE(cp.fluency, 1.0) AS fluency,
      COALESCE(cp.state, 'locked') AS state,
      COALESCE(cp.is_focused, 0) AS is_focused
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
  `, [algset]);
}


export function saveCaseFluency(caseId: string, fluency: number) {
  const db = getDb();
  db.runSync(`
    INSERT OR REPLACE INTO case_progress (case_id, fluency)
    VALUES (?, ?)
  `, [caseId, fluency]);
}

export function toggleCaseFocus(caseId: number) {
  const db = getDb();
  db.runSync(
    `INSERT INTO case_progress (case_id, is_focused)
     VALUES (?, 1)
     ON CONFLICT(case_id) DO UPDATE SET
       is_focused = CASE WHEN is_focused = 1 THEN 0 ELSE 1 END`,
    [caseId]
  );
}

export function getWorstCases(algsetName: string, n: number): CaseWithProgress[] {
  const db = getDb();
  return db.getAllSync<CaseWithProgress>(`
    SELECT c.*, 
      COALESCE(cp.fluency, 1.0) AS fluency,
      COALESCE(cp.state, 'locked') AS state,
      COALESCE(cp.is_focused, 0) AS is_focused
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
    AND COALESCE(cp.state, 'locked') != 'locked'
    ORDER BY fluency ASC
    LIMIT ?
  `, [algsetName, n]);
}


export function getSetting(key: string): string | null {
  const db = getDb();
  const result = db.getFirstSync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?', [key]
  );
  return result?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.runSync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}



export function updateCaseProgress(caseId: number, fluency: number, state: CaseState) {
  const db = getDb();
  db.runSync(`
    INSERT INTO case_progress (case_id, fluency, state)
    VALUES (?, ?, ?)
    ON CONFLICT(case_id) DO UPDATE SET
      fluency = excluded.fluency,
      state = excluded.state
  `, [caseId, fluency, state]);
}

export function introduceNextCase(algset: string): void {
  const db = getDb();
  const nextLocked = db.getFirstSync<{ id: number }>(`
    SELECT c.id
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
      AND (cp.state = 'locked' OR cp.state IS NULL)
    LIMIT 1
  `, [algset]);

  if (!nextLocked) return;

  db.runSync(`
    INSERT INTO case_progress (case_id, fluency, state)
    VALUES (?, 1.0, 'learning')
    ON CONFLICT(case_id) DO UPDATE SET
      fluency = 1.0,
      state = 'learning'
  `, [nextLocked.id]);
}
