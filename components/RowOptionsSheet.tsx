import { forwardRef, useRef, useImperativeHandle } from 'react';
import { Text, View, Pressable } from 'react-native';
import { Sheet } from '@/components/Sheet';
import type { SheetRef } from '@/types';

type RowOptionsSheetProps = {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
  onDismiss?: () => void;
};

export const RowOptionsSheet = forwardRef<SheetRef, RowOptionsSheetProps>(
  function RowOptionsSheet({ title, onEdit, onDelete, onDismiss }, ref) {
    const sheetRef = useRef<SheetRef>(null);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    return (
      <Sheet ref={sheetRef} snapPoints={['25%']} onDismiss={onDismiss}>
        <View className="flex flex-col gap-3 items-center w-full">
          <Text className="text-form-header">{title}</Text>
          <Pressable
            className="rounded-full bg-accent p-3 w-40"
            onPress={() => {
              sheetRef.current?.dismiss();
              onEdit();
            }}
          >
            <Text className="text-white text-center">Edit</Text>
          </Pressable>
          <Pressable
            className="rounded-full bg-red-500 p-3 w-40"
            onPress={() => {
              sheetRef.current?.dismiss();
              onDelete();
            }}
          >
            <Text className="text-white text-center">Delete</Text>
          </Pressable>
        </View>
      </Sheet>
    );
  }
);
