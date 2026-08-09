import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AlgSetForm } from '@/components/AlgSetForm';
import { Sheet } from '@/components/Sheet';
import type { SheetRef, CreateAlgSetSheetRef, AlgSet } from '@/types';

type CreateAlgSetSheetProps = {
  onCreate: (algset: AlgSet) => void;
};

export const CreateAlgSetSheet = forwardRef<CreateAlgSetSheetRef, CreateAlgSetSheetProps>(
  function CreateAlgSetSheet({ onCreate }, ref) {
    const sheetRef = useRef<SheetRef>(null);
    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    return (
      <Sheet ref={sheetRef}>
        <AlgSetForm
          title="Create new Algorithm Set"
          submitLabel="Create"
          onSubmit={(algset) => {
            onCreate(algset);
            sheetRef.current?.dismiss();
          }}
        />
      </Sheet>
    );
  }
);
