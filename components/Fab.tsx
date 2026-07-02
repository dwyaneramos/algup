import { Pressable } from 'react-native';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLOR_ACCENT } from '@/utils/constants/colors';
import { IconPlus } from '@tabler/icons-react-native';

type FabProps = {
  onPress: () => void;
};

export function Fab({ onPress }: FabProps) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Reanimated.View
      style={{
        position: 'absolute',
        bottom: 32,
        right: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <Reanimated.View style={pressStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => { scale.value = withSpring(0.9); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: COLOR_ACCENT }}
        >
          <IconPlus color="white" size={26} />
        </Pressable>
      </Reanimated.View>
    </Reanimated.View>
  );
}

export default Fab;
