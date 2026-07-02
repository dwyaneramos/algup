import { Pressable } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLOR_ACCENT } from '@/utils/constants/colors';
import { IconPlus, IconPencil, IconTrash, IconDotsVertical } from '@tabler/icons-react-native';
import { useCallback, useState, ComponentType } from 'react';
import { useFocusEffect } from 'expo-router';
const SATELLITE_SIZE = 52;
const MAIN_SIZE = 64;
const GAP = 12;
const HORIZONTAL_CENTER_OFFSET = 5;
const SPRING_CONFIG = { damping: 15, stiffness: 180, mass: 0.6 };
const COLLAPSE_SPRING_CONFIG = { damping: 18, stiffness: 220, mass: 0.5 };

type FabProps = {
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

type IconComponent = ComponentType<{ color?: string; size?: number }>;

type SatelliteButtonProps = {
  icon: IconComponent;
  onPress: () => void;
  distance: number;
  isOpen: boolean;
  backgroundColor?: string;
};

function SatelliteButton({ icon: Icon, onPress, distance, isOpen, backgroundColor = COLOR_ACCENT }: SatelliteButtonProps) {
  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 1 : 0, { duration: isOpen ? 180 : 150, easing: Easing.out(Easing.ease) }),
    transform: [
      { translateY: withSpring(isOpen ? -distance : 0, isOpen ? SPRING_CONFIG : COLLAPSE_SPRING_CONFIG) },
      { translateX: -HORIZONTAL_CENTER_OFFSET },
      { scale: withSpring(isOpen ? 1 : 0, isOpen ? SPRING_CONFIG : COLLAPSE_SPRING_CONFIG) },
    ],
  }));

  return (
    <Reanimated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[
        containerStyle,
        {
          position: 'absolute',
          right: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
        },
      ]}
    >
      <Reanimated.View style={pressStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => { pressScale.value = withSpring(0.9); }}
          onPressOut={() => { pressScale.value = withSpring(1); }}
          style={{
            width: SATELLITE_SIZE,
            height: SATELLITE_SIZE,
            borderRadius: SATELLITE_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
          }}
        >
          <Icon color="white" size={22} />
        </Pressable>
      </Reanimated.View>
    </Reanimated.View>
  );
}

export function Fab({ onCreate, onEdit, onDelete }: FabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    rotation.value = withTiming(next ? 45 : 0, { duration: 200 });
  };


  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsOpen(false);
      };
    }, [])
  );

  const handleSatellitePress = (action: () => void) => {
    action();
    setIsOpen(false);
    rotation.value = withTiming(0, { duration: 200 });
  };

  return (
    <Reanimated.View
      style={{
        position: 'absolute',
        bottom: 28,
        right: 16,
      }}
    >
      <SatelliteButton
        icon={IconTrash}
        onPress={() => handleSatellitePress(onDelete)}
        distance={(SATELLITE_SIZE + GAP) * 3}
        isOpen={isOpen}
        backgroundColor="#ef4444"
      />
      <SatelliteButton
        icon={IconPencil}
        onPress={() => handleSatellitePress(onEdit)}
        distance={(SATELLITE_SIZE + GAP) * 2}
        isOpen={isOpen}
      />
      <SatelliteButton
        icon={IconPlus}
        onPress={() => handleSatellitePress(onCreate)}
        distance={SATELLITE_SIZE + GAP}
        isOpen={isOpen}
      />

      <Reanimated.View
        style={[
          pressStyle,
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          },
        ]}
      >
        <Pressable
          onPress={toggle}
          onPressIn={() => { scale.value = withSpring(0.9); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          className="items-center justify-center"
          style={{
            width: MAIN_SIZE,
            height: MAIN_SIZE,
            borderRadius: MAIN_SIZE / 2,
            backgroundColor: COLOR_ACCENT,
          }}
        >
          <IconDotsVertical color="white" size={26} />
        </Pressable>
      </Reanimated.View>
    </Reanimated.View>
  );
}

export default Fab;
