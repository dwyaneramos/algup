import { useRef, useState, useEffect } from 'react';
import { Text, View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { type AlgSet, validateAlgSet } from '@/src/logic/algsets';
import { useAlgSetStore } from '@/src/store/algsetStore';

const MIN_ALGS_TEXTAREA_HEIGHT = 40;

type AlgSetFormProps = {
  title: string;
  submitLabel: string;
  initialAlgSet?: AlgSet;
  onSubmit: (algset: AlgSet) => void;
};

export function AlgSetForm({ title, submitLabel, initialAlgSet, onSubmit }: AlgSetFormProps) {
  const { height: screenHeight } = useWindowDimensions();
  const algsets = useAlgSetStore(s => s.algSets);

  const [name, setName] = useState(initialAlgSet?.name ?? '');
  const [algsText, setAlgsText] = useState(
    initialAlgSet?.cases.map(c => c.alg).join('\n') ?? ''
  );
  const numAlgsEntered = useRef(initialAlgSet?.cases.length ?? 0);

  const handleAlgsChange = (text: string) => {
    setAlgsText(text.replace(/[’‘]/g, "'"));
    numAlgsEntered.current = text.split('\n').filter(line => line.trim().length > 0).length;
  };

  const handleSubmit = () => {
    const cases = algsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(alg => ({ alg }));

    const algsetToStore: AlgSet = { name: name.trim(), cases };

    const otherAlgsets = initialAlgSet
      ? algsets.filter(a => a.name !== initialAlgSet.name)
      : algsets;

    const validationError = validateAlgSet(algsetToStore, otherAlgsets);
    if (validationError.length !== 0) {
      alert(validationError);
      return;
    }
    onSubmit(algsetToStore);
  };

  return (
    <View className="flex flex-col gap-3 items-center">
      <Text className="text-subheader w-[80vw]">{title}</Text>

      <View className="flex flex-col gap-1">
        <Text className="text-form-header">Algorithm Set Name</Text>
        <BottomSheetTextInput
          className="border border-gray-400 rounded-lg p-2 w-[80vw]"
          onChangeText={setName}
          value={name}
        />
      </View>

      <View className="flex flex-col gap-1">
        <View className="flex flex-row justify-between w-[80vw] items-end gap-2">
          <Text className="text-form-header">Algorithms</Text>
          <Text className="text-muted">
            {numAlgsEntered.current} alg{numAlgsEntered.current !== 1 ? 's' : ''}
          </Text>
        </View>
        <BottomSheetTextInput
          className="border border-gray-400 rounded-lg p-2 w-[80vw]"
          style={[styles.algsInput, { minHeight: MIN_ALGS_TEXTAREA_HEIGHT, maxHeight: screenHeight * 0.5 }]}
          multiline
          keyboardType="ascii-capable"
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="One alg per line"
          onChangeText={handleAlgsChange}
          value={algsText}
        />
      </View>

      <Pressable className="rounded-full bg-accent p-3 cursor-pointer w-32" onPress={handleSubmit}>
        <Text className="text-white text-center">{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  algsInput: {
    textAlignVertical: 'top',
  },
});
