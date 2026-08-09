import * as SQLite from 'expo-sqlite';
import { ALG_SETS } from '@/src/logic/algsets';
import { createAlgSet, insertCases } from '@/src/db/queries';

const db = SQLite.openDatabaseSync('algup.db');

function seedAlgSets() {
  const existing = db.getFirstSync('SELECT COUNT(*) as count FROM algsets') as { count: number };
  if (existing.count > 0) return;

  for (const algSet of ALG_SETS) {
    createAlgSet(algSet.name, algSet.event);
    insertCases(algSet);
  }
}

export function resetDB() {
  db.execSync('DROP TABLE IF EXISTS scramble_queue');
  db.execSync('DROP TABLE IF EXISTS case_progress');
  db.execSync('DROP TABLE IF EXISTS cases');
  db.execSync('DROP TABLE IF EXISTS algsets');
}

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS algsets (
      name TEXT PRIMARY KEY,
      event TEXT NOT NULL DEFAULT '333'
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY,

      algset TEXT NOT NULL,
      alg TEXT NOT NULL,

      FOREIGN KEY (algset) REFERENCES algsets(name)
    );

    CREATE TABLE IF NOT EXISTS case_progress (
      case_id INTEGER PRIMARY KEY,
      fluency REAL DEFAULT 1.0,
      state TEXT DEFAULT 'locked',
      is_focused BOOLEAN DEFAULT false,
      last_practiced TEXT,
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );

    CREATE TABLE IF NOT EXISTS practice_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      algset TEXT NOT NULL,
      practiced_at TEXT NOT NULL,
      FOREIGN KEY (algset) REFERENCES algsets(name)
    );
  `);

  const queueColumns = db.getAllSync<{ name: string }>(
    "PRAGMA table_info(scramble_queue)"
  );
  const hasAlg = queueColumns.some(c => c.name === 'alg');
  if (!hasAlg) {
    db.execSync('DROP TABLE IF EXISTS scramble_queue');
  }
  db.execSync(`
    CREATE TABLE IF NOT EXISTS scramble_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      algset TEXT NOT NULL,
      case_id INTEGER NOT NULL,
      alg TEXT NOT NULL,
      scramble TEXT NOT NULL,
      solution TEXT NOT NULL,
      FOREIGN KEY (algset) REFERENCES algsets(name),
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );
  `);

  seedAlgSets();
}
