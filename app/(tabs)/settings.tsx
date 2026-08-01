import { View, Text, Pressable, Linking, Switch, Platform, ScrollView } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { IconBrandGithub, IconCoffee, IconMail, IconChevronRight, IconArrowBarToUp } from '@tabler/icons-react-native';
import { COLOR_ACCENT, COLOR_ACCENT_LIGHT } from '@/utils/constants/colors';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useNavBarShift } from '@/src/hooks/useNavBarShift';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LINKS = [
  {
    label: 'GitHub',
    url: 'https://github.com/dwyaneramos/algup',
    icon: IconBrandGithub,
    color: '#333',
  },
  {
    label: 'Buy Me a Coffee',
    url: 'https://buymeacoffee.com/dwyaneramos',
    icon: IconCoffee,
    color: '#FFDD00',
  },
  {
    label: 'Contact',
    url: 'mailto:ramosdt55@gmail.com',
    icon: IconMail,
    color: '#4A90D9',
  },
];

function LinkCard({ label, url, icon: Icon, color }: {
  label: string;
  url: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View
        style={animatedStyle}
        className="flex-row items-center gap-4 bg-white rounded-2xl p-4 border border-black/5"
      >
        <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={24} color={color} />
        </View>
        <Text className="font-inter-semibold text-lg flex-1">{label}</Text>
        <IconChevronRight size={20} color={COLOR_ACCENT} />
      </Animated.View>
    </Pressable>
  );
}

function SettingRow({ icon: Icon, label, description, value, onValueChange }: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-4 bg-white rounded-2xl p-4 border border-black/5">
      <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: `${COLOR_ACCENT}15` }}>
        <Icon size={24} color={COLOR_ACCENT} />
      </View>
      <View className="flex-1">
        <Text className="font-inter-semibold text-lg">{label}</Text>
        <Text className="text-muted text-sm">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e5e5e5', true: COLOR_ACCENT_LIGHT }}
        thumbColor={value ? COLOR_ACCENT : '#f4f3f4'}
      />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text className="font-inter-semibold text-subheader mb-3">{title}</Text>;
}

export default function Settings() {
  const shiftNavbarUp = useSettingsStore((s) => s.shiftNavbarUp);
  const setShiftNavbarUp = useSettingsStore((s) => s.setShiftNavbarUp);
  const navBarShift = useNavBarShift();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 px-4"
      contentContainerStyle={{ paddingTop: 64, paddingBottom: insets.bottom + 96 + navBarShift }}
    >
      <Animated.View entering={FadeIn.duration(300)}>
        <Text className="font-inter-bold text-center text-header mb-6">Settings</Text>

        {Platform.OS === 'android' && (
          <View className="mb-6">
            <SectionHeader title="Settings" />
            <View className="gap-3">
              <SettingRow
                icon={IconArrowBarToUp}
                label="Shift navbar up"
                description="Move the tab bar above your device's navigation buttons"
                value={shiftNavbarUp}
                onValueChange={setShiftNavbarUp}
              />
            </View>
          </View>
        )}

        <View>
          <SectionHeader title="Links" />
          <View className="gap-3">
            {LINKS.map((link) => (
              <LinkCard key={link.label} {...link} />
            ))}
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
