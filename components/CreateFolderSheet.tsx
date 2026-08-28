import { useRef, forwardRef, useImperativeHandle } from 'react';
import { FolderForm } from '@/components/FolderForm';
import { Sheet } from '@/components/Sheet';
import type { SheetRef, CreateFolderSheetRef, Folder } from '@/types';

type CreateFolderSheetProps = {
  onCreate: (folder: Folder, algsetNamesToAssign: string[]) => void;
};

export const CreateFolderSheet = forwardRef<CreateFolderSheetRef, CreateFolderSheetProps>(
  function CreateFolderSheet({ onCreate }, ref) {
    const sheetRef = useRef<SheetRef>(null);
    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    return (
      <Sheet ref={sheetRef}>
        <FolderForm
          title="New Folder"
          submitLabel="Create"
          onSubmit={(folder, algsetNamesToAssign) => {
            onCreate(folder, algsetNamesToAssign);
            sheetRef.current?.dismiss();
          }}
        />
      </Sheet>
    );
  }
);
