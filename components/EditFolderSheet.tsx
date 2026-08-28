import { useRef, forwardRef, useImperativeHandle } from 'react';
import { FolderForm } from '@/components/FolderForm';
import { Sheet } from '@/components/Sheet';
import type { SheetRef, EditFolderSheetRef, Folder } from '@/types';

type EditFolderSheetProps = {
  folder: Folder;
  onEdit: (folder: Folder, editedFolder: Folder, algsetNamesToAssign: string[]) => void;
  onDelete: (folder: Folder) => void;
};

export const EditFolderSheet = forwardRef<EditFolderSheetRef, EditFolderSheetProps>(
  function EditFolderSheet({ folder, onEdit, onDelete }, ref) {
    const sheetRef = useRef<SheetRef>(null);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    return (
      <Sheet ref={sheetRef}>
        <FolderForm
          title="Edit Folder"
          submitLabel="Save"
          initialFolder={folder}
          onSubmit={(updated, algsetNamesToAssign) => {
            onEdit(folder, updated, algsetNamesToAssign);
            sheetRef.current?.dismiss();
          }}
          onDelete={() => {
            sheetRef.current?.dismiss();
            onDelete(folder);
          }}
        />
      </Sheet>
    );
  }
);
