import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderButton } from '@/components/HeaderButton';
import { LinkRow, SettingsGroup } from '@/components/SettingsRows';

const TESTERS = [
  'Adrien Auvray Matyn',
  'Álvaro González Vizuete',
  'Amanda Wang',
  'Divyaansh Khatri',
  'Ephraim Lim Shao Liang',
  'Ethan Lim',
  'Floyd Rosse Berganos',
  'Franmy Pérez',
  "Jacob O'Callaghan",
  'Jeremy Loh Kai Choong',
  'John Brent Aguilar',
  'Kaden Ho',
  'Kenta Ikeda',
  'Mai Duy',
  'Nick Jiang',
  'Nikolas Baxevanis',
  'Patty Clark',
  'Rafael Chuy Darm',
  'Ricky Hu',
  'Samuel Jehanno',
  'Sudeep Lanka',
  'Tafheem Ahmad',
  'Whistler Huang',
];

export default function Credits() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 pt-16">
      <View className="mb-4 flex-row items-center justify-between px-4">
        <HeaderButton onPress={() => router.replace('/settings')}>
          <IconArrowLeft size={20} color="white" />
        </HeaderButton>
        <Text className="text-header text-center">Credits</Text>
        <View className="h-11 w-11" />
      </View>
      <ScrollView
        className="w-full flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
        <Animated.View entering={FadeIn.duration(300)}>
          <View className="mb-6">
            <Text className="text-subheader mb-2 text-center">Testers</Text>
            <View className="overflow-hidden rounded-2xl bg-white px-4 py-4">
              <Text className="font-inter-regular text-base leading-7">
                {TESTERS.map((tester, i) => (
                  <Text key={tester}>
                    {tester}
                    {i < TESTERS.length - 1 && ', '}
                  </Text>
                ))}
              </Text>
            </View>
          </View>

          <View>
            <Text className="text-subheader mb-2 text-center">Algorithm Sources</Text>
            <SettingsGroup>
              <LinkRow
                label="SpeedCubeDB"
                subtitle="2x2 Algs"
                url="https://speedcubedb.com"
              />
              <LinkRow
                label="Tao Yu"
                subtitle="3x3 Algs"
                url="https://tao-yu.github.io/"
              />
            </SettingsGroup>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
