import * as SQLite from 'expo-sqlite';
import { ALG_SETS } from '@/src/logic/algsets';
import { createAlgSet, insertCases } from '@/src/db/queries';

const db = SQLite.openDatabaseSync('algup.db');

function seedAlgSets() {
  const existing = db.getFirstSync('SELECT COUNT(*) as count FROM algsets') as { count: number };
  if (existing.count > 0) return;

  for (const algSet of ALG_SETS) {
    createAlgSet(algSet.name);
    insertCases(algSet);
  }
}

export function resetDB() {
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
      name TEXT PRIMARY KEY
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
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );
  `);

  seedAlgSets();
}
