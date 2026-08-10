import {
  insertScrambleQueueItems,
  dequeueNextScramble,
  getScrambleQueueSize,
  peekScrambleQueue as dbPeekScrambleQueue,
  clearScrambleQueue,
} from '@/src/db/queries';
import { generateScrambleBatch } from './scramble';
import type { CaseWithProgress, ScrambleQueueItem, CubeEvent } from '@/types';

const BATCH_SIZE = 10;
const REFILL_THRESHOLD = 3;

const FOCUSED_WEIGHT = 10;

const STATE_WEIGHTS: Record<string, number> = {
  locked: 0,
  learning: 5,
  reviewing: 3,
  mastered: 1,
};

const pendingItems = new Map<string, ScrambleQueueItem>();

export type { ScrambleQueueItem };
export { REFILL_THRESHOLD };

export function selectBatchCases(cases: CaseWithProgress[], count: number): CaseWithProgress[] {
  const active = cases.filter(c => c.state !== 'locked');
  if (active.length === 0) return [];

  const selected: CaseWithProgress[] = [];

  for (let i = 0; i < count; i++) {
    const totalWeight = active.reduce((sum, c) => {
      const weight = c.is_focused ? FOCUSED_WEIGHT : STATE_WEIGHTS[c.state];
      return sum + weight * (6 - c.fluency);
    }, 0);

    let random = Math.random() * totalWeight;
    let picked = active[active.length - 1];
    for (let j = 0; j < active.length; j++) {
      const weight = active[j].is_focused ? FOCUSED_WEIGHT : STATE_WEIGHTS[active[j].state];
      random -= weight * (6 - active[j].fluency);
      if (random <= 0) {
        picked = active[j];
        break;
      }
    }

    selected.push(picked);
  }

  return selected;
}

export async function fetchAndEnqueueBatch(algset: string, cases: CaseWithProgress[], event: CubeEvent): Promise<void> {
  const batchCases = selectBatchCases(cases, BATCH_SIZE);
  if (batchCases.length === 0) return;

  try {
    const algs = batchCases.map(c => c.alg);
    const results = await generateScrambleBatch(algs, event);

    if (!results || results.length === 0) {
      console.warn('Scramble batch returned no results');
      return;
    }

    const items: ScrambleQueueItem[] = [];
    for (let i = 0; i < results.length; i++) {
      if (results[i]?.scramble && results[i]?.solution) {
        items.push({
          caseId: batchCases[i].id,
          alg: batchCases[i].alg,
          scramble: results[i].scramble,
          solution: results[i].solution,
        });
      }
    }

    if (items.length > 0) {
      insertScrambleQueueItems(algset, items);
      console.log(`Enqueued ${items.length} scrambles for ${algset}`);
    }
  } catch (err) {
    console.error('Failed to fetch scramble batch:', err);
  }
}

export function dequeueNext(algset: string): ScrambleQueueItem | null {
  return dequeueNextScramble(algset);
}

export function getQueueSize(algset: string): number {
  return getScrambleQueueSize(algset);
}

export function peekQueue(algset: string): ScrambleQueueItem[] {
  return dbPeekScrambleQueue(algset);
}

export function setPendingItem(algset: string, item: ScrambleQueueItem): void {
  pendingItems.set(algset, item);
}

export function consumePendingItem(algset: string): ScrambleQueueItem | null {
  const item = pendingItems.get(algset) ?? null;
  if (item) pendingItems.delete(algset);
  return item;
}

export function hasPendingItem(algset: string): boolean {
  return pendingItems.has(algset);
}

export { clearScrambleQueue };
