import {
  validateFolderName,
  validateFolder,
  folderAlreadyExistsError,
  folderNameLengthError,
  insertNewFolder,
  editFolder,
} from '@/src/logic/folders';
import { createFolder, renameFolder, setAlgSetFolder } from '@/src/db/queries';
import type { Folder } from '@/types';

jest.mock('@/src/db/queries', () => ({
  createFolder: jest.fn(),
  renameFolder: jest.fn(),
  setAlgSetFolder: jest.fn(),
}));

const createFolderMock = createFolder as jest.MockedFunction<typeof createFolder>;
const renameFolderMock = renameFolder as jest.MockedFunction<typeof renameFolder>;
const setAlgSetFolderMock = setAlgSetFolder as jest.MockedFunction<typeof setAlgSetFolder>;

describe('validateFolderName', () => {
  it('accepts a non-empty name within 16 characters', () => {
    expect(validateFolderName('OLL Cases')).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(validateFolderName('   ')).toBe(false);
  });

  it('rejects a name over 16 characters', () => {
    expect(validateFolderName('a'.repeat(17))).toBe(false);
  });

  it('accepts a name exactly 16 characters', () => {
    expect(validateFolderName('a'.repeat(16))).toBe(true);
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

describe('insertNewFolder', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('creates the folder and assigns every named algset to it', () => {
    expect(insertNewFolder({ name: 'OLL Cases' }, ['OLL', 'PLL'])).toBe(true);

    expect(createFolderMock).toHaveBeenCalledTimes(1);
    expect(createFolderMock).toHaveBeenCalledWith('OLL Cases');
    expect(setAlgSetFolderMock).toHaveBeenCalledTimes(2);
    expect(setAlgSetFolderMock).toHaveBeenNthCalledWith(1, 'OLL', 'OLL Cases');
    expect(setAlgSetFolderMock).toHaveBeenNthCalledWith(2, 'PLL', 'OLL Cases');
  });

  it('creates the folder without assigning anything when no algsets are given', () => {
    expect(insertNewFolder({ name: 'Empty' }, [])).toBe(true);

    expect(createFolderMock).toHaveBeenCalledWith('Empty');
    expect(setAlgSetFolderMock).not.toHaveBeenCalled();
  });

  it('returns false without throwing when createFolder throws', () => {
    createFolderMock.mockImplementation(() => {
      throw new Error('db is down');
    });

    expect(insertNewFolder({ name: 'OLL Cases' }, ['OLL'])).toBe(false);
    expect(setAlgSetFolderMock).not.toHaveBeenCalled();
  });

  it('returns false without throwing when setAlgSetFolder throws', () => {
    setAlgSetFolderMock.mockImplementation(() => {
      throw new Error('db is down');
    });

    expect(insertNewFolder({ name: 'OLL Cases' }, ['OLL'])).toBe(false);
  });
});

describe('editFolder', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('does not rename when the name is unchanged', () => {
    expect(editFolder({ name: 'OLL Cases' }, { name: 'OLL Cases' }, ['OLL'], ['OLL'])).toBe(true);

    expect(renameFolderMock).not.toHaveBeenCalled();
  });

  it('renames before applying any membership change', () => {
    expect(editFolder({ name: 'Old' }, { name: 'New' }, ['OLL'], ['PLL'])).toBe(true);

    expect(renameFolderMock).toHaveBeenCalledTimes(1);
    expect(renameFolderMock).toHaveBeenCalledWith('Old', 'New');
    expect(setAlgSetFolderMock).toHaveBeenCalledTimes(2);
    expect(renameFolderMock.mock.invocationCallOrder[0]).toBeLessThan(
      setAlgSetFolderMock.mock.invocationCallOrder[0]
    );
  });

  it('leaves members present in both the old and new lists untouched', () => {
    expect(
      editFolder({ name: 'OLL Cases' }, { name: 'OLL Cases' }, ['OLL', 'PLL'], ['OLL', 'PLL'])
    ).toBe(true);

    expect(setAlgSetFolderMock).not.toHaveBeenCalled();
  });

  it('unassigns members that were removed from the folder', () => {
    expect(editFolder({ name: 'OLL Cases' }, { name: 'OLL Cases' }, ['OLL', 'PLL'], ['OLL'])).toBe(
      true
    );

    expect(setAlgSetFolderMock).toHaveBeenCalledTimes(1);
    expect(setAlgSetFolderMock).toHaveBeenCalledWith('PLL', null);
  });

  it('assigns newly added members to the folder', () => {
    expect(editFolder({ name: 'OLL Cases' }, { name: 'OLL Cases' }, ['OLL'], ['OLL', 'PLL'])).toBe(
      true
    );

    expect(setAlgSetFolderMock).toHaveBeenCalledTimes(1);
    expect(setAlgSetFolderMock).toHaveBeenCalledWith('PLL', 'OLL Cases');
  });

  it('assigns newly added members to the NEW folder name when renaming at the same time', () => {
    expect(editFolder({ name: 'Old' }, { name: 'New' }, ['OLL'], ['OLL', 'PLL'])).toBe(true);

    expect(renameFolderMock).toHaveBeenCalledWith('Old', 'New');
    expect(setAlgSetFolderMock).toHaveBeenCalledTimes(1);
    expect(setAlgSetFolderMock).toHaveBeenCalledWith('PLL', 'New');
  });

  it('returns false without throwing when renameFolder throws', () => {
    renameFolderMock.mockImplementation(() => {
      throw new Error('db is down');
    });

    expect(editFolder({ name: 'Old' }, { name: 'New' }, ['OLL'], ['PLL'])).toBe(false);
    expect(setAlgSetFolderMock).not.toHaveBeenCalled();
  });

  it('returns false without throwing when setAlgSetFolder throws', () => {
    setAlgSetFolderMock.mockImplementation(() => {
      throw new Error('db is down');
    });

    expect(editFolder({ name: 'OLL Cases' }, { name: 'OLL Cases' }, ['OLL'], ['PLL'])).toBe(false);
  });
});
