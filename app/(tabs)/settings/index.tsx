import { Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  IconBrandGithub,
  IconCoffee,
  IconMail,
  IconArrowBarToUp,
  IconStack2,
  IconSchool,
  IconArrowsDiagonalMinimize2,
  IconRotateClockwise,
} from '@tabler/icons-react-native';
import {
  useSettingsStore,
  MIN_MAX_ACTIVE,
  MAX_MAX_ACTIVE,
  MIN_MAX_LEARNING,
  MAX_MAX_LEARNING,
} from '@/src/store/settingsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinkRow, SettingsGroup, StepperRow, SwitchRow } from '@/components/SettingsRows';

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

export default function Settings() {
  const shiftNavbarUp = useSettingsStore((s) => s.shiftNavbarUp);
  const setShiftNavbarUp = useSettingsStore((s) => s.setShiftNavbarUp);
  const maxActive = useSettingsStore((s) => s.maxActive);
  const setMaxActive = useSettingsStore((s) => s.setMaxActive);
  const maxLearning = useSettingsStore((s) => s.maxLearning);
  const setMaxLearning = useSettingsStore((s) => s.setMaxLearning);
  const miniScramble = useSettingsStore((s) => s.miniScramble);
  const setMiniScramble = useSettingsStore((s) => s.setMiniScramble);
  const scrambleWithAUF = useSettingsStore((s) => s.scrambleWithAUF);
  const setScrambleWithAUF = useSettingsStore((s) => s.setScrambleWithAUF);

  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 items-center pt-16">
      <Text className="text-header mb-2 text-center">Settings</Text>
      <ScrollView
        className="w-full flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
        <Animated.View entering={FadeIn.duration(300)}>
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
              <SwitchRow
                icon={IconArrowsDiagonalMinimize2}
                label="Mini draw scramble"
                subtitle="Shrink the draw scramble"
                value={miniScramble}
                onValueChange={setMiniScramble}
              />
              <SwitchRow
                icon={IconRotateClockwise}
                label="Scramble with AUFs"
                subtitle="Practice slight variations"
                value={scrambleWithAUF}
                onValueChange={setScrambleWithAUF}
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
    </View>
  );
}
