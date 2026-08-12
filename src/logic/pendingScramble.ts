import { clearScrambleQueue as dbClearScrambleQueue } from '@/src/db/queries';
import type { ScrambleQueueItem } from '@/types';

const pendingItems = new Map<string, ScrambleQueueItem>();

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

export function clearScrambleQueue(algset: string): void {
  pendingItems.delete(algset);
  dbClearScrambleQueue(algset);
}
