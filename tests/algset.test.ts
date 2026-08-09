import { validateAlgSet, validateAlgSetName, algsetNameLengthError, algsetAlreadyExistsError, algsetNoCasesError, invalidAlgError, ALG_SETS } from "@/src/logic/algsets";
import type { AlgSet, Case } from '@/types';

function makeAlgSet(overrides: Partial<AlgSet> = {}): AlgSet {
  return {
    name: 'OLL',
    event: '333',
    cases: [{ alg: "F R U R' U' F'" } as Case],
    ...overrides,
  } as AlgSet;
}

describe('validateAlgSetName', () => {
  it('rejects empty string', () => {
    expect(validateAlgSetName('')).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(validateAlgSetName('   ')).toBe(false);
  });

  it('accepts a normal name', () => {
    expect(validateAlgSetName('PLL')).toBe(true);
  });

  it('trims before checking length', () => {
    expect(validateAlgSetName('  A  ')).toBe(true);
  });

  it('accepts exactly 32 characters', () => {
    expect(validateAlgSetName('a'.repeat(32))).toBe(true);
  });

  it('rejects 33 characters', () => {
    expect(validateAlgSetName('a'.repeat(33))).toBe(false);
  });
});

describe('validateAlgSet', () => {
  it('returns empty string for a valid algset', () => {
    const algset = makeAlgSet();
    expect(validateAlgSet(algset, [])).toBe('');
  });

  it('rejects a name that already exists in existingAlgsets', () => {
    const existing = [makeAlgSet({ name: 'OLL' })];
    const algset = makeAlgSet({ name: 'OLL' });
    expect(validateAlgSet(algset, existing)).toBe(algsetAlreadyExistsError);
  });

  it('matches existing name after trimming whitespace', () => {
    const existing = [makeAlgSet({ name: 'OLL' })];
    const algset = makeAlgSet({ name: '  OLL  ' });
    expect(validateAlgSet(algset, existing)).toBe(algsetAlreadyExistsError);
  });

  it('rejects an empty name', () => {
    const algset = makeAlgSet({ name: '' });
    expect(validateAlgSet(algset, [])).toBe(
      algsetNameLengthError
    );
  });

  it('rejects a name over 32 characters', () => {
    const algset = makeAlgSet({ name: 'a'.repeat(33) });
    expect(validateAlgSet(algset, [])).toBe(
      algsetNameLengthError
    );
  });

  it('rejects an algset with no cases', () => {
    const algset = makeAlgSet({ cases: [] });
    expect(validateAlgSet(algset, [])).toBe(algsetNoCasesError);
  });

  it('rejects an algset containing an invalid algorithm', () => {
    const algset = makeAlgSet({
      cases: [{ alg: "F R U R' U' F'" } as Case, { alg: 'R3274834' } as any],
    });
    expect(validateAlgSet(algset, [])).toBe(invalidAlgError('R3274834'));
  });

  it('checks duplicate name before empty name (order of validation matters)', () => {
    const existing = [makeAlgSet({ name: '' })];
    const algset = makeAlgSet({ name: '' });
    // name === '' matches existing '', so duplicate check fires first
    expect(validateAlgSet(algset, existing)).toBe(algsetAlreadyExistsError);
  });
});

describe('ALG_SETS defaults', () => {
  it('defaults every built-in algset to the 333 event', () => {
    for (const algset of ALG_SETS) {
      expect(algset.event).toBe('333');
    }
  });
});
