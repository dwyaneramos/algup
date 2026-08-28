import type { PendingScrambleItem } from '@/types';

const pendingItems = new Map<string, PendingScrambleItem>();

export function setPendingItem(algset: string, item: PendingScrambleItem): void {
  pendingItems.set(algset, item);
}

export function consumePendingItem(algset: string): PendingScrambleItem | null {
  const item = pendingItems.get(algset) ?? null;
  if (item) pendingItems.delete(algset);
  return item;
}

export function hasPendingItem(algset: string): boolean {
  return pendingItems.has(algset);
}

export function clearPendingItem(algset: string): void {
  pendingItems.delete(algset);
}
