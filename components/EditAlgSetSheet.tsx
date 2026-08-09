import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AlgSetForm } from '@/components/AlgSetForm';
import { Sheet } from '@/components/Sheet';
import type { SheetRef, EditAlgSetSheetRef, AlgSet } from '@/types';

type EditAlgSetSheetProps = {
  algset: AlgSet;
  onEdit: (algset: AlgSet, editedAlgset: AlgSet) => void;
};

export const EditAlgSetSheet = forwardRef<EditAlgSetSheetRef, EditAlgSetSheetProps>(
  function EditAlgSetSheet({ algset, onEdit }, ref) {
    const sheetRef = useRef<SheetRef>(null);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    return (
      <Sheet ref={sheetRef}>
        <AlgSetForm
          title="Edit Algorithm Set"
          submitLabel="Save"
          initialAlgSet={algset}
          onSubmit={(updated) => {
            onEdit(algset, updated);
            sheetRef.current?.dismiss();
          }}
        />
      </Sheet>
    );
  }
);
