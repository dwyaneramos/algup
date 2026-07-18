import { View, Text, Pressable, Linking } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { IconBrandGithub, IconCoffee } from '@tabler/icons-react-native';

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
        className="flex-row items-center gap-4 bg-white rounded-2xl p-4 shadow-sm"
      >
        <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={24} color={color} />
        </View>
        <Text className="font-inter-semibold text-lg flex-1">{label}</Text>
        <Text className="text-accent text-sm font-inter-medium">Open</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function Links() {
  return (
    <View className="flex-1 pt-16 px-4">
      <Animated.View entering={FadeIn.duration(300)}>
        <Text className="font-inter-bold text-center text-header mb-2">Links</Text>
        <Text className="text-center text-muted mb-6">Support the project</Text>

        <View className="gap-3">
          {LINKS.map((link) => (
            <LinkCard key={link.label} {...link} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
