import * as SQLite from 'expo-sqlite';
import type {
  AlgSet,
  Case,
  CubeEvent,
  CaseWithProgress,
  CaseState,
  AlgSetProgress,
  Folder,
} from '@/types';
import { applyDecay } from '@/src/logic/caseQueue';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb() {
  if (!_db) {
    _db = SQLite.openDatabaseSync('algup.db');
  }
  return _db;
}

export function getAlgSet(name: string): AlgSet | null {
  const db = getDb();
  const algset = db.getFirstSync<{ name: string; event: CubeEvent; folder: string | null }>(
    'SELECT * FROM algsets WHERE name = ?',
    [name]
  );
  if (!algset) return null;
  return {
    ...algset,
    cases: db.getAllSync<Case>('SELECT * FROM cases WHERE algset = ?', [algset.name]),
  };
}

export function createAlgSet(name: string, event: CubeEvent): void {
  const db = getDb();
  db.runSync('INSERT OR IGNORE INTO algsets (name, event) VALUES (?, ?)', [name, event]);
}

export function createAlgSetWithCases(name: string, event: CubeEvent, cases: Case[]): void {
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync('INSERT OR IGNORE INTO algsets (name, event) VALUES (?, ?)', [name, event]);
    insertCasesInternal(db, { name, cases });
  });
}

export function deleteAlgset(algsetName: string): void {
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync(
      `DELETE FROM case_progress
       WHERE case_id IN (SELECT id FROM cases WHERE algset = ?)`,
      [algsetName]
    );

    db.runSync('DELETE FROM cases WHERE algset = ?', [algsetName]);

    db.runSync('DELETE FROM algsets WHERE name = ?', [algsetName]);
  });
}

export function getFirstCase(algsetName: string): Case | null {
  const db = getDb();
  return db.getFirstSync<Case>('SELECT * FROM cases WHERE algset = ? ORDER BY id ASC LIMIT 1', [
    algsetName,
  ]);
}

function deleteCasesInternal(db: SQLite.SQLiteDatabase, caseIds: number[]): void {
  if (caseIds.length === 0) return;
  const placeholders = caseIds.map(() => '?').join(', ');
  db.runSync(`DELETE FROM case_progress WHERE case_id IN (${placeholders});`, caseIds);
  db.runSync(`DELETE FROM cases WHERE id IN (${placeholders});`, caseIds);
}

function insertCasesInternal(
  db: SQLite.SQLiteDatabase,
  algset: Pick<AlgSet, 'name' | 'cases'>
): void {
  for (const c of algset.cases) {
    db.runSync('INSERT OR IGNORE INTO cases (algset, alg) VALUES (?, ?)', [algset.name, c.alg]);
  }
}

export function deleteCases(caseIds: number[]): void {
  const db = getDb();
  db.withTransactionSync(() => deleteCasesInternal(db, caseIds));
}

export function renameAlgSet(oldName: string, newName: string): void {
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync('UPDATE algsets SET name = ? WHERE name = ?', [newName, oldName]);
    db.runSync('UPDATE cases SET algset = ? WHERE algset = ?', [newName, oldName]);
    db.runSync('UPDATE practice_log SET algset = ? WHERE algset = ?', [newName, oldName]);
  });
}

export function getFolders(): Folder[] {
  const db = getDb();
  return db.getAllSync<Folder>('SELECT * FROM folders');
}

export function createFolder(name: string): void {
  const db = getDb();
  db.runSync('INSERT OR IGNORE INTO folders (name) VALUES (?)', [name]);
}

export function renameFolder(oldName: string, newName: string): void {
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync('UPDATE folders SET name = ? WHERE name = ?', [newName, oldName]);
    db.runSync('UPDATE algsets SET folder = ? WHERE folder = ?', [newName, oldName]);
  });
}

export function deleteFolder(name: string): void {
  const db = getDb();
  db.withTransactionSync(() => {
    const members = db.getAllSync<{ name: string }>('SELECT name FROM algsets WHERE folder = ?', [
      name,
    ]);
    for (const member of members) {
      db.runSync(
        `DELETE FROM case_progress WHERE case_id IN (SELECT id FROM cases WHERE algset = ?)`,
        [member.name]
      );
      db.runSync('DELETE FROM cases WHERE algset = ?', [member.name]);
      db.runSync('DELETE FROM algsets WHERE name = ?', [member.name]);
    }
    db.runSync('DELETE FROM folders WHERE name = ?', [name]);
  });
}

export function setAlgSetFolder(algsetName: string, folderName: string | null): void {
  const db = getDb();
  db.runSync('UPDATE algsets SET folder = ? WHERE name = ?', [folderName, algsetName]);
}

export function getFirstAlgSetInFolder(folderName: string): AlgSet | null {
  const db = getDb();
  const algset = db.getFirstSync<{ name: string; event: CubeEvent; folder: string | null }>(
    'SELECT * FROM algsets WHERE folder = ? ORDER BY rowid ASC LIMIT 1',
    [folderName]
  );
  if (!algset) return null;
  return {
    ...algset,
    cases: db.getAllSync<Case>('SELECT * FROM cases WHERE algset = ?', [algset.name]),
  };
}

export function applyAlgSetCaseChanges(
  caseIdsToDelete: number[],
  algsetNameForInsert: string,
  casesToInsert: Case[]
): void {
  const db = getDb();
  db.withTransactionSync(() => {
    deleteCasesInternal(db, caseIdsToDelete);
    if (casesToInsert.length > 0) {
      insertCasesInternal(db, { name: algsetNameForInsert, cases: casesToInsert });
    }
  });
}

export function getAlgSetProgress(algset: string): AlgSetProgress {
  const db = getDb();
  const result = db.getFirstSync<{
    total: number;
    learning: number;
    reviewing: number;
    mastered: number;
    locked: number;
  }>(
    `
    SELECT COUNT(*) as total,
      SUM(CASE WHEN COALESCE(cp.state, 'locked') = 'learning' THEN 1 ELSE 0 END) as learning,
      SUM(CASE WHEN COALESCE(cp.state, 'locked') = 'reviewing' THEN 1 ELSE 0 END) as reviewing,
      SUM(CASE WHEN COALESCE(cp.state, 'locked') = 'mastered' THEN 1 ELSE 0 END) as mastered,
      SUM(CASE WHEN COALESCE(cp.state, 'locked') = 'locked' THEN 1 ELSE 0 END) as locked
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
  `,
    [algset]
  );

  return result ?? { total: 0, learning: 0, reviewing: 0, mastered: 0, locked: 0 };
}

export function getAlgSets(): AlgSet[] {
  const db = getDb();
  const algsets = db.getAllSync<{ name: string; event: CubeEvent; folder: string | null }>(
    'SELECT * FROM algsets'
  );
  return algsets.map((a) => ({
    ...a,
    cases: db.getAllSync<Case>('SELECT * FROM cases WHERE algset = ?', [a.name]),
  }));
}

export function getOverallFluency(algsetName: string): number {
  const db = getDb();
  const result = db.getFirstSync<{ avg: number }>(
    `
    SELECT AVG(COALESCE(cp.fluency, 1.0)) as avg
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
  `,
    [algsetName]
  );
  return result?.avg ?? 1.0;
}

export function getLearningFluency(algsetName: string): number | null {
  const db = getDb();
  const result = db.getFirstSync<{ avg: number | null }>(
    `
    SELECT AVG(cp.fluency) as avg
    FROM cases c
    JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ? AND cp.state IN ('learning', 'reviewing', 'mastered')
  `,
    [algsetName]
  );
  return result?.avg ?? null;
}

export function getCases(algsetName: string): Case[] {
  const db = getDb();
  const cases = db.getAllSync<{ id: number; alg: string }>('SELECT * FROM cases WHERE algset = ?', [
    algsetName,
  ]);
  return cases;
}

export async function getCasesWithProgress(algset: string): Promise<CaseWithProgress[]> {
  const db = getDb();
  return db.getAllAsync<CaseWithProgress>(
    `
    SELECT c.*, 
      COALESCE(cp.fluency, 1.0) AS fluency,
      COALESCE(cp.state, 'locked') AS state,
      COALESCE(cp.is_focused, 0) AS is_focused,
      cp.last_practiced
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
  `,
    [algset]
  );
}

export async function getAllCasesWithProgress(): Promise<CaseWithProgress[]> {
  const db = getDb();
  return db.getAllAsync<CaseWithProgress>(`
    SELECT c.*,
      COALESCE(cp.fluency, 1.0) AS fluency,
      COALESCE(cp.state, 'locked') AS state,
      COALESCE(cp.is_focused, 0) AS is_focused,
      cp.last_practiced
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
  `);
}

export function updateCaseFluency(caseId: number, fluency: number): void {
  const db = getDb();
  db.runSync('UPDATE case_progress SET fluency = ? WHERE case_id = ?', [fluency, caseId]);
}

export async function applyDecayToAllCases(): Promise<void> {
  const cases = await getAllCasesWithProgress();
  const decayed = applyDecay(cases);
  decayed.forEach((c, i) => {
    if (c.fluency !== cases[i].fluency) {
      updateCaseFluency(c.id, c.fluency);
    }
  });
}

export function saveCaseFluency(caseId: string, fluency: number) {
  const db = getDb();
  db.runSync(
    `
    INSERT OR REPLACE INTO case_progress (case_id, fluency)
    VALUES (?, ?)
  `,
    [caseId, fluency]
  );
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
  return db.getAllSync<CaseWithProgress>(
    `
    SELECT c.*, 
      COALESCE(cp.fluency, 1.0) AS fluency,
      COALESCE(cp.state, 'locked') AS state,
      COALESCE(cp.is_focused, 0) AS is_focused,
      cp.last_practiced
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
    AND COALESCE(cp.state, 'locked') != 'locked'
    ORDER BY fluency ASC
    LIMIT ?
  `,
    [algsetName, n]
  );
}

export function getSetting(key: string): string | null {
  const db = getDb();
  const result = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    key,
  ]);
  return result?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}

export function updateCaseProgress(caseId: number, fluency: number, state: CaseState) {
  const db = getDb();
  db.runSync(
    `
    INSERT INTO case_progress (case_id, fluency, state)
    VALUES (?, ?, ?)
    ON CONFLICT(case_id) DO UPDATE SET
      fluency = excluded.fluency,
      state = excluded.state
  `,
    [caseId, fluency, state]
  );
}

export function markCaseMastered(caseId: number) {
  updateCaseProgress(caseId, 5, 'mastered');
}

export function unmarkCaseMastered(caseId: number) {
  updateCaseProgress(caseId, 1, 'learning');
}

export function introduceNextCase(algset: string): void {
  const db = getDb();
  const nextLocked = db.getFirstSync<{ id: number }>(
    `
    SELECT c.id
    FROM cases c
    LEFT JOIN case_progress cp ON c.id = cp.case_id
    WHERE c.algset = ?
      AND (cp.state = 'locked' OR cp.state IS NULL)
    LIMIT 1
  `,
    [algset]
  );

  if (!nextLocked) return;

  db.runSync(
    `
    INSERT INTO case_progress (case_id, fluency, state)
    VALUES (?, 1.0, 'learning')
    ON CONFLICT(case_id) DO UPDATE SET
      fluency = 1.0,
      state = 'learning'
  `,
    [nextLocked.id]
  );
}

export function recordPractice(algset: string): void {
  const db = getDb();
  db.runSync("INSERT INTO practice_log (algset, practiced_at) VALUES (?, date('now'))", [algset]);
}

export function updateLastPracticed(caseId: number): void {
  const db = getDb();
  db.runSync("UPDATE case_progress SET last_practiced = date('now') WHERE case_id = ?", [caseId]);
}

export function getDailyStreak(algset: string): number {
  const db = getDb();
  const rows = db.getAllSync<{ d: string }>(
    'SELECT DISTINCT date(practiced_at) AS d FROM practice_log WHERE algset = ? ORDER BY d DESC',
    [algset]
  );
  if (rows.length === 0) return 0;

  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  let streak = 0;
  let expected = todayUTC;

  for (const row of rows) {
    const [y, m, d] = row.d.split('-').map(Number);
    const rowTime = Date.UTC(y, m - 1, d);
    if (rowTime === expected) {
      streak++;
      expected -= 86400000;
    } else if (rowTime === expected - 86400000) {
      // today hasn't been practiced yet, start from yesterday
      expected = rowTime;
      streak++;
      expected -= 86400000;
    } else {
      break;
    }
  }
  return streak;
}

export function getAlgsetDaysPracticed(algset: string): number {
  const db = getDb();
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(DISTINCT date(practiced_at)) AS count FROM practice_log WHERE algset = ?',
    [algset]
  );
  return result?.count ?? 0;
}

export function getAlgsetDaysSinceLast(algset: string): number | null {
  const db = getDb();
  const result = db.getFirstSync<{ d: string }>(
    'SELECT MAX(practiced_at) AS d FROM practice_log WHERE algset = ?',
    [algset]
  );
  if (!result?.d) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(result.d + 'T00:00:00');
  last.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / 86400000);
}
