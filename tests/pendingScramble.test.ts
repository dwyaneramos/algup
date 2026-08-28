import { setPendingItem, hasPendingItem, clearPendingItem } from '@/src/logic/pendingScramble';

describe('clearPendingItem', () => {
  it('drops the in-memory pending item for the algset', () => {
    setPendingItem('OLL', {
      caseId: 1,
      alg: "F R U R' U' F'",
      scramble: 'R U R2',
      solution: "F' U' R'",
    });
    expect(hasPendingItem('OLL')).toBe(true);

    clearPendingItem('OLL');

    expect(hasPendingItem('OLL')).toBe(false);
  });
});
