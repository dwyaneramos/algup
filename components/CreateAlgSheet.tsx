import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Text, View, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { type AlgSet, validateAlgSet } from '@/src/logic/algsets';
import { useAlgSetStore } from '@/src/store/algsetStore';

export type CreateAlgSetSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type CreateAlgSetSheetProps = {
  onCreate: (algset: AlgSet) => void;
};

const MIN_ALGS_HEIGHT = 40;

export const CreateAlgSetSheet = forwardRef<CreateAlgSetSheetRef, CreateAlgSetSheetProps>(
  function CreateAlgSetSheet({ onCreate }, ref) {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['90%'], []);

    const algsets = useAlgSetStore(s => s.algSets);
    const [name, setName] = useState('');
    const [algsText, setAlgsText] = useState('');
    const [algsInputHeight, setAlgsInputHeight] = useState(MIN_ALGS_HEIGHT);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetModalRef.current?.present(),
      dismiss: () => bottomSheetModalRef.current?.dismiss(),
    }));

    const handleAlgsChange = (text: string) => {
      setAlgsText(text.replace(/[’‘]/g, "'"));
    };

    const reset = () => {
      setName('');
      setAlgsText('');
      setAlgsInputHeight(MIN_ALGS_HEIGHT);
    };

    const handleCreate = () => {
      if (algsets.some(a => a.name === name.trim())) {
        alert("Algset name already exists.");
        return;
      }

      const cases = algsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(alg => ({ alg }));

      if (cases.length === 0 || name.trim().length === 0) return;

      const algsetToStore: AlgSet = { name: name.trim(), cases };
      if (!validateAlgSet(algsetToStore)) {
        alert("Invalid algorithm");
        return;
      }
      console.log(algsetToStore);
      onCreate(algsetToStore);
      reset();
      bottomSheetModalRef.current?.dismiss();
    };

    const handleSheetChanges = (index: number) => {
      console.log('handleSheetChanges', index);
    };

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        keyboardBehavior="fillParent"
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View className="flex flex-col gap-3">
            <Text>SHEEET</Text>

            <View className="flex flex-col gap-1">
              <Text className="text-form-header">Algset Name</Text>
              <BottomSheetTextInput
                className="border border-gray-400 rounded-lg p-2 w-[80vw]"
                onChangeText={setName}
                value={name}
              />
            </View>

            <View className="flex flex-col gap-1">
              <Text className="text-form-header">Algorithms</Text>
              <BottomSheetTextInput
                className="border border-gray-400 rounded-lg p-2 w-[80vw]"
                style={[styles.algsInput, { minHeight: algsInputHeight }]}
                multiline
                keyboardType="ascii-capable"
                autoCorrect={false}
                autoCapitalize="none"
                placeholder="One alg per line"
                onChangeText={handleAlgsChange}
                value={algsText}
                onContentSizeChange={(e) =>
                  setAlgsInputHeight(Math.max(MIN_ALGS_HEIGHT, e.nativeEvent.contentSize.height))
                }
              />
            </View>

            <Pressable
              className="rounded-full bg-accent p-3 cursor-pointer w-32"
              onPress={handleCreate}
            >
              <Text className="text-white text-center">Create</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  algsInput: {
    textAlignVertical: 'top',
  },
});
