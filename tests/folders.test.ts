import {
  validateFolderName,
  validateFolder,
  folderAlreadyExistsError,
  folderNameLengthError,
} from '@/src/logic/folders';
import type { Folder } from '@/types';

describe('validateFolderName', () => {
  it('accepts a non-empty name within 32 characters', () => {
    expect(validateFolderName('OLL Cases')).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(validateFolderName('   ')).toBe(false);
  });

  it('rejects a name over 32 characters', () => {
    expect(validateFolderName('a'.repeat(33))).toBe(false);
  });

  it('accepts a name exactly 32 characters', () => {
    expect(validateFolderName('a'.repeat(32))).toBe(true);
  });
});

describe('validateFolder', () => {
  const existing: Folder[] = [{ name: 'OLL Cases' }, { name: 'PLL Cases' }];

  it('returns empty string for a valid, unique name', () => {
    expect(validateFolder({ name: 'New Folder' }, existing)).toBe('');
  });

  it('rejects a duplicate name', () => {
    expect(validateFolder({ name: 'OLL Cases' }, existing)).toBe(folderAlreadyExistsError);
  });

  it('rejects an invalid length name', () => {
    expect(validateFolder({ name: '' }, existing)).toBe(folderNameLengthError);
  });
});
