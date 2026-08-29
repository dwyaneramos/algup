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
      <Sheet ref={sheetRef} snapPoints={['35%']} onDismiss={onDismiss}>
        <View className="w-full">
          <Text className="text-form-header text-center mb-5">{title}</Text>

          <View className="w-full flex flex-col gap-3">
            <Pressable
              className="w-full rounded-full bg-accent py-4 items-center"
              onPress={() => {
                sheetRef.current?.dismiss();
                onEdit();
              }}
            >
              <Text className="font-inter-semibold text-base text-white">Edit</Text>
            </Pressable>
            <Pressable
              className="w-full rounded-full bg-red-500 py-4 items-center"
              onPress={() => {
                sheetRef.current?.dismiss();
                onDelete();
              }}
            >
              <Text className="font-inter-semibold text-base text-white">Delete</Text>
            </Pressable>
          </View>

          <Pressable
            className="w-full rounded-full bg-gray-100 items-center py-4 mt-3"
            onPress={() => sheetRef.current?.dismiss()}
          >
            <Text className="font-inter-semibold text-base text-muted">Cancel</Text>
          </Pressable>
        </View>
      </Sheet>
    );
  }
);
