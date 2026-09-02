import { createFolder, renameFolder, setAlgSetFolder } from '@/src/db/queries';
import type { Folder } from '@/types';

export function validateFolderName(name: string): boolean {
  name = name.trim();
  return name.length > 0 && name.length <= 16;
}

export const folderAlreadyExistsError = 'Folder name already exists';
export const folderNameLengthError = 'Folder name must be between 1 and 16 characters';

export function validateFolder(folder: Folder, existingFolders: Folder[]): string {
  if (existingFolders.some((f) => f.name === folder.name.trim())) {
    return folderAlreadyExistsError;
  }
  if (validateFolderName(folder.name) === false) {
    return folderNameLengthError;
  }
  return '';
}

export function insertNewFolder(folder: Folder, algsetNamesToAssign: string[]): boolean {
  try {
    createFolder(folder.name);
    for (const name of algsetNamesToAssign) {
      setAlgSetFolder(name, folder.name);
    }
    return true;
  } catch (error) {
    console.error(`Failed to store new folder "${folder.name}":`, error);
    return false;
  }
}

export function editFolder(
  old: Folder,
  edited: Folder,
  oldMemberNames: string[],
  newMemberNames: string[]
): boolean {
  try {
    if (old.name !== edited.name) {
      renameFolder(old.name, edited.name);
    }
    const removed = oldMemberNames.filter((name) => !newMemberNames.includes(name));
    const added = newMemberNames.filter((name) => !oldMemberNames.includes(name));
    for (const name of removed) {
      setAlgSetFolder(name, null);
    }
    for (const name of added) {
      setAlgSetFolder(name, edited.name);
    }
    return true;
  } catch (error) {
    console.error(`Failed to edit folder "${edited.name}":`, error);
    return false;
  }
}
