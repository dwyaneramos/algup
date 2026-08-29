import { Children, isValidElement, ReactNode } from 'react';
import { View, Text, Pressable, Linking, Switch } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { IconChevronRight, IconMinus, IconPlus } from '@tabler/icons-react-native';
import { COLOR_ACCENT, COLOR_ACCENT_LIGHT } from '@/utils/constants/colors';

const ICON_SIZE = 28;

export function RowIcon({
  icon: Icon,
  color,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}) {
  return (
    <View className="h-11 w-11 items-center justify-center rounded-full">
      <Icon size={ICON_SIZE} color={color} />
    </View>
  );
}

export function RowLabel({ label, subtitle }: { label: string; subtitle: string }) {
  return (
    <View className="flex-1">
      <Text className="font-inter-medium text-base">{label}</Text>
      <Text className="font-inter-regular text-sm text-muted">{subtitle}</Text>
    </View>
  );
}

export function LinkRow({
  label,
  subtitle,
  url,
  icon,
}: {
  label: string;
  subtitle: string;
  url: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}>
      <Animated.View style={animatedStyle} className="flex-row items-center gap-4 px-4 py-3.5">
        <RowIcon icon={icon} color={COLOR_ACCENT} />
        <RowLabel label={label} subtitle={subtitle} />
        <IconChevronRight size={18} color={COLOR_ACCENT} />
      </Animated.View>
    </Pressable>
  );
}

export function SwitchRow({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-4 px-4 py-3.5">
      <RowIcon icon={icon} color={COLOR_ACCENT} />
      <RowLabel label={label} subtitle={subtitle} />
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e5e5e5', true: COLOR_ACCENT_LIGHT }}
        thumbColor={value ? COLOR_ACCENT : '#f4f3f4'}
      />
    </View>
  );
}

export function StepperRow({
  icon,
  label,
  subtitle,
  value,
  min,
  max,
  onValueChange,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  subtitle: string;
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <View className="flex-row items-center gap-4 px-4 py-3.5">
      <RowIcon icon={icon} color={COLOR_ACCENT} />
      <RowLabel label={label} subtitle={subtitle} />
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => onValueChange(value - 1)}
          disabled={value <= min}
          className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
          style={{ opacity: value <= min ? 0.3 : 1 }}>
          <IconMinus size={16} color={COLOR_ACCENT} />
        </Pressable>
        <Text className="w-6 text-center font-inter-semibold text-lg">{value}</Text>
        <Pressable
          onPress={() => onValueChange(value + 1)}
          disabled={value >= max}
          className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
          style={{ opacity: value >= max ? 0.3 : 1 }}>
          <IconPlus size={16} color={COLOR_ACCENT} />
        </Pressable>
      </View>
    </View>
  );
}


export function SettingsGroup({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View className="overflow-hidden rounded-2xl bg-white">
      {rows.map((row, i) => (
        <View key={row.key ?? i}>
          {row}
          {i < rows.length - 1 && <View className="h-px bg-black/[0.06]" />}
        </View>
      ))}
    </View>
  );
}
