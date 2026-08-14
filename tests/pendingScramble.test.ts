import { setPendingItem, hasPendingItem, clearScrambleQueue } from '@/src/logic/pendingScramble';

jest.mock('@/src/db/queries', () => ({
  clearScrambleQueue: jest.fn(),
}));

describe('clearScrambleQueue', () => {
  it('drops the in-memory pending item for the algset, not just the DB queue', () => {
    setPendingItem('OLL', { caseId: 1, alg: "F R U R' U' F'", scramble: 'R U R2', solution: "F' U' R'" });
    expect(hasPendingItem('OLL')).toBe(true);

    clearScrambleQueue('OLL');

    expect(hasPendingItem('OLL')).toBe(false);
  });
});
