import { Children, isValidElement, ReactNode } from 'react';
import { View, Text, Pressable, Linking, Switch, Platform, ScrollView } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { IconBrandGithub, IconCoffee, IconMail, IconChevronRight, IconArrowBarToUp, IconMinus, IconPlus, IconStack2, IconSchool } from '@tabler/icons-react-native';
import { COLOR_ACCENT, COLOR_ACCENT_LIGHT } from '@/utils/constants/colors';
import {
  useSettingsStore,
  MIN_MAX_ACTIVE,
  MAX_MAX_ACTIVE,
  MIN_MAX_LEARNING,
  MAX_MAX_LEARNING,
} from '@/src/store/settingsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_SIZE = 28;

const LINKS = [
  {
    label: 'GitHub',
    subtitle: 'Star my repo to show support',
    url: 'https://github.com/dwyaneramos/algup',
    icon: IconBrandGithub,
  },
  {
    label: 'Buy Me a Coffee',
    subtitle: 'Funds go towards an iOS version',
    url: 'https://buymeacoffee.com/dwyaneramos',
    icon: IconCoffee,
  },
  {
    label: 'Contact',
    subtitle: 'Let me know of any issues',
    url: 'mailto:ramosdt55@gmail.com',
    icon: IconMail,
  },
];

function RowIcon({ icon: Icon, color }: { icon: React.ComponentType<{ size: number; color: string }>; color: string }) {
  return (
    <View className="w-11 h-11 rounded-full items-center justify-center"  >
      <Icon size={ICON_SIZE} color={color} />
    </View >
  );
}

function RowLabel({ label, subtitle }: { label: string; subtitle: string }) {
  return (
    <View className="flex-1">
      <Text className="font-inter-medium text-base">{label}</Text>
      <Text className="font-inter-regular text-sm text-muted">{subtitle}</Text>
    </View>
  );
}

function LinkRow({ label, subtitle, url, icon }: {
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
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View style={animatedStyle} className="flex-row items-center gap-4 px-4 py-3.5">
        <RowIcon icon={icon} color={COLOR_ACCENT} />
        <RowLabel label={label} subtitle={subtitle} />
        <IconChevronRight size={18} color={COLOR_ACCENT} />
      </Animated.View>
    </Pressable>
  );
}

function SwitchRow({ icon, label, subtitle, value, onValueChange }: {
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

function StepperRow({ icon, label, subtitle, value, min, max, onValueChange }: {
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
          className="w-8 h-8 rounded-full items-center justify-center bg-gray-100"
          style={{ opacity: value <= min ? 0.3 : 1 }}
        >
          <IconMinus size={16} color={COLOR_ACCENT} />
        </Pressable>
        <Text className="font-inter-semibold text-lg w-6 text-center">{value}</Text>
        <Pressable
          onPress={() => onValueChange(value + 1)}
          disabled={value >= max}
          className="w-8 h-8 rounded-full items-center justify-center bg-gray-100"
          style={{ opacity: value >= max ? 0.3 : 1 }}
        >
          <IconPlus size={16} color={COLOR_ACCENT} />
        </Pressable>
      </View>
    </View>
  );
}

function SettingsGroup({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View className="bg-white rounded-2xl overflow-hidden">
      {rows.map((row, i) => (
        <View key={row.key ?? i}>
          {row}
          {i < rows.length - 1 && <View className="h-px bg-black/[0.06]" />}
        </View>
      ))}
    </View>
  );
}

export default function Settings() {
  const shiftNavbarUp = useSettingsStore((s) => s.shiftNavbarUp);
  const setShiftNavbarUp = useSettingsStore((s) => s.setShiftNavbarUp);
  const maxActive = useSettingsStore((s) => s.maxActive);
  const setMaxActive = useSettingsStore((s) => s.setMaxActive);
  const maxLearning = useSettingsStore((s) => s.maxLearning);
  const setMaxLearning = useSettingsStore((s) => s.setMaxLearning);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 px-4"
      contentContainerStyle={{ paddingTop: 64, paddingBottom: insets.bottom + 96 }}
    >
      <Animated.View entering={FadeIn.duration(300)}>
        <Text className="text-header mb-2 text-center">Settings</Text>

        <View className="mb-6">
          <SettingsGroup>
            <StepperRow
              icon={IconStack2}
              label="Max active cases"
              subtitle="Cases in learning or review at once"
              value={maxActive}
              min={MIN_MAX_ACTIVE}
              max={MAX_MAX_ACTIVE}
              onValueChange={setMaxActive}
            />
            <StepperRow
              icon={IconSchool}
              label="Max learning cases"
              subtitle="New cases introduced at once"
              value={maxLearning}
              min={MIN_MAX_LEARNING}
              max={MAX_MAX_LEARNING}
              onValueChange={setMaxLearning}
            />
            {Platform.OS === 'android' && (
              <SwitchRow
                icon={IconArrowBarToUp}
                label="Shift navbar up"
                subtitle="Nudge the tab bar above system gestures"
                value={shiftNavbarUp}
                onValueChange={setShiftNavbarUp}
              />
            )}
          </SettingsGroup>
        </View>

        <View>
          <Text className="text-subheader mb-2 text-center">Links</Text>
          <SettingsGroup>
            {LINKS.map((link) => (
              <LinkRow key={link.label} {...link} />
            ))}
          </SettingsGroup>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
