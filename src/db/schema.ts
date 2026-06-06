import * as SQLite from 'expo-sqlite';
import { ALG_SETS } from '@/src/logic/algsets';

export const db = SQLite.openDatabaseSync('algup.db');

function seedAlgSets() {
  const existing = db.getFirstSync('SELECT COUNT(*) as count FROM algsets') as { count: number };
  if (existing.count > 0) return;

  for (const algSet of ALG_SETS) {
    db.runSync(
      'INSERT OR IGNORE INTO algsets (name) VALUES (?)',
      [algSet.name]
    );
    for (const c of algSet.cases) {
      db.runSync(
        'INSERT OR IGNORE INTO cases (algset, alg) VALUES (?, ?)',
        [algSet.name, c.alg]
      );
    }
  }
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
      id INT AUTO_INCREMENT PRIMARY KEY,

      algset TEXT NOT NULL,
      alg TEXT NOT NULL,

      FOREIGN KEY (algset) REFERENCES algsets(name)
    );

    CREATE TABLE IF NOT EXISTS case_progress (
      case_id INT PRIMARY KEY,
      confidence REAL DEFAULT 1.0,
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );
  `);

  seedAlgSets();
}
