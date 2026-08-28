import { ALG_SETS } from '@/src/logic/algsets';
import { createAlgSetWithCases, getDb } from '@/src/db/queries';

const db = getDb();

function seedAlgSets() {
  const existing = db.getFirstSync('SELECT COUNT(*) as count FROM algsets') as { count: number };
  if (existing.count > 0) return;

  for (const algSet of ALG_SETS) {
    createAlgSetWithCases(algSet.name, algSet.event, algSet.cases);
  }
}

export function resetDB() {
  db.execSync('DROP TABLE IF EXISTS case_progress');
  db.execSync('DROP TABLE IF EXISTS cases');
  db.execSync('DROP TABLE IF EXISTS algsets');
  db.execSync('DROP TABLE IF EXISTS practice_log');
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

  const algsetColumns = db.getAllSync<{ name: string }>('PRAGMA table_info(algsets)');
  const hasEvent = algsetColumns.some((c) => c.name === 'event');
  if (!hasEvent) {
    db.execSync("ALTER TABLE algsets ADD COLUMN event TEXT NOT NULL DEFAULT '333'");
  }

  // Scrambles used to be prefetched in bulk and queued in this table to hide
  // network latency from a remote server; scramble generation now runs
  // on-device (see src/logic/scrambleGenerator3x3.ts) and no longer needs a
  // queue, so this table is no longer created - just cleaned up once for
  // anyone who already has it from an earlier app version.
  db.execSync('DROP TABLE IF EXISTS scramble_queue');

  seedAlgSets();
}
