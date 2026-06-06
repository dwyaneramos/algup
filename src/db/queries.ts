import { db } from './schema';
import { AlgSet, Case } from '@/src/logic/algsets';

export interface CaseWithConfidence extends Case {
  confidence: number;
}

export function getAlgSets(): AlgSet[] {
  const algsets = db.getAllSync<{ id: string; name: string }>('SELECT * FROM algsets');
  return algsets.map(a => ({
    ...a,
    cases: db.getAllSync<Case>('SELECT * FROM cases WHERE algset = ?', [a.name])
  }));
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
