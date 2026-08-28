import { Pressable, StyleSheet } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { COLOR_ACCENT } from '@/utils/constants/colors';
import { IconPlus, IconDotsVertical, IconFolderPlus } from '@tabler/icons-react-native';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { FabRef, IconComponent, SatelliteAction } from '@/types';
import {
  SATELLITE_SIZE,
  MAIN_SIZE,
  HORIZONTAL_CENTER_OFFSET,
  SATELLITE_HIT_SLOP,
  SATELLITE_BOTTOM_OFFSET,
  getSatelliteDistance,
  getFabContainerHeight,
} from './fabLayout';

const OPEN_SPRING = { damping: 15, stiffness: 180, mass: 0.6 };
const CLOSE_SPRING = { damping: 18, stiffness: 220, mass: 0.5 };
const ROTATION_DURATION = 200;
const FADE_IN_DURATION = 180;
const FADE_OUT_DURATION = 150;
const PRESS_SCALE = 0.9;

const SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
} as const;

type FabProps = {
  onCreate: () => void;
  onCreateFolder: () => void;
  onOpenChange?: (open: boolean) => void;
  bottomOffset?: number;
};

function usePressScale() {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(PRESS_SCALE);
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  return { style, onPressIn, onPressOut };
}

type SatelliteButtonProps = {
  icon: IconComponent;
  onPress: () => void;
  distance: number;
  isOpen: boolean;
  isOpenSV: SharedValue<boolean>;
  backgroundColor?: string;
};

function SatelliteButton({
  icon: Icon,
  onPress,
  distance,
  isOpen,
  isOpenSV,
  backgroundColor = COLOR_ACCENT,
}: SatelliteButtonProps) {
  const { style: pressStyle, onPressIn, onPressOut } = usePressScale();

  const containerStyle = useAnimatedStyle(() => {
    const open = isOpenSV.value;
    const config = open ? OPEN_SPRING : CLOSE_SPRING;
    return {
      opacity: withTiming(open ? 1 : 0, {
        duration: open ? FADE_IN_DURATION : FADE_OUT_DURATION,
        easing: Easing.out(Easing.ease),
      }),
      transform: [
        { translateY: withSpring(open ? -distance : 0, config) },
        { translateX: -HORIZONTAL_CENTER_OFFSET },
        { scale: withSpring(open ? 1 : 0, config) },
      ],
    };
  });

  return (
    <Reanimated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[
        styles.satelliteWrapper,
        containerStyle,
        // Elevation (not just zIndex) governs Android's touch hit-testing
        // between overlapping siblings, so it must rise above the FAB
        // while open or nearby satellites can eat the FAB's touches.
        { zIndex: isOpen ? 20 : 0, elevation: isOpen ? 20 : 0 },
      ]}
    >
      <Reanimated.View style={pressStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          hitSlop={SATELLITE_HIT_SLOP}
          style={[
            styles.satelliteButton,
            { width: SATELLITE_SIZE, height: SATELLITE_SIZE, borderRadius: SATELLITE_SIZE / 2, backgroundColor },
          ]}
        >
          <Icon color="white" size={22} />
        </Pressable>
      </Reanimated.View>
    </Reanimated.View>
  );
}

export const Fab = forwardRef<FabRef, FabProps>(function Fab(
  { onCreate, onCreateFolder, onOpenChange, bottomOffset = 0 },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenSV = useSharedValue(false);
  const rotation = useSharedValue(0);
  const mainScale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    mainScale.value = withSpring(PRESS_SCALE);
  }, [mainScale]);

  const onPressOut = useCallback(() => {
    mainScale.value = withSpring(1);
  }, [mainScale]);

  // Scale + rotate both write to `transform`, so they must share one
  // useAnimatedStyle — splitting them across two hooks means whichever
  // fires last (e.g. onPressOut's scale reset) wipes out the other's
  // transform entry, which is why rotation was snapping back.
  const mainStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: mainScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const toggle = useCallback(() => {
    const next = !isOpen;
    isOpenSV.value = next;
    rotation.value = withTiming(next ? 45 : 0, { duration: ROTATION_DURATION });
    setIsOpen(next);
    onOpenChange?.(next);
  }, [isOpen, isOpenSV, rotation, onOpenChange]);
  const close = useCallback(() => {
    isOpenSV.value = false;
    rotation.value = withTiming(0, { duration: ROTATION_DURATION });
    setIsOpen(false);
    onOpenChange?.(false);
  }, [isOpenSV, rotation, onOpenChange]);

  useImperativeHandle(ref, () => ({ close }), [close]);

  useFocusEffect(
    useCallback(() => {
      return () => close();
    }, [close])
  );

  const handleSatellitePress = useCallback(
    (action: () => void) => {
      action();
      close();
    },
    [close]
  );

  const actions: SatelliteAction[] = [
    { key: 'create', icon: IconPlus, onPress: onCreate },
    { key: 'create-folder', icon: IconFolderPlus, onPress: onCreateFolder },
  ];

  return (
    <Reanimated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          bottom: styles.container.bottom + bottomOffset,
          height: getFabContainerHeight(actions.length),
        },
      ]}
    >
      {actions.map(({ key, icon, onPress, backgroundColor }, index) => (
        <SatelliteButton
          key={key}
          icon={icon}
          onPress={() => handleSatellitePress(onPress)}
          distance={getSatelliteDistance(index)}
          isOpen={isOpen}
          isOpenSV={isOpenSV}
          backgroundColor={backgroundColor}
        />
      ))}

      <Reanimated.View style={[styles.mainWrapper, mainStyle]}>
        <Pressable
          onPress={toggle}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          hitSlop={SATELLITE_HIT_SLOP}
          style={styles.mainButton}
        >
          <IconDotsVertical color="white" size={26} />
        </Pressable>
      </Reanimated.View>
    </Reanimated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 28,
    right: 16,
    width: MAIN_SIZE,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  satelliteWrapper: {
    position: 'absolute',
    right: 0,
    bottom: SATELLITE_BOTTOM_OFFSET,
    ...SHADOW,
  },
  satelliteButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainWrapper: {
    zIndex: 10,
    elevation: 10,
    ...SHADOW,
  },
  mainButton: {
    width: MAIN_SIZE,
    height: MAIN_SIZE,
    borderRadius: MAIN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR_ACCENT,
  },
});

export default Fab;
