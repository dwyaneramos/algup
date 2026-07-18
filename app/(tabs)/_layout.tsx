import { Tabs, useRouter } from 'expo-router';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import { IconChartDots2, IconCards, IconStopwatch, IconLink } from '@tabler/icons-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLOR_ACCENT } from '@/utils/constants/colors';

const FAB_SIZE = 56;
const GAP = 12;
const SPRING_CONFIG = { damping: 16, stiffness: 140, mass: 0.7 };

type TabItemProps = {
  route: BottomTabBarProps['state']['routes'][number];
  isFocused: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
};

function TabItem({ isFocused, onPress, icon, label }: TabItemProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(1.2); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      className="flex-1 items-center justify-center py-1 rounded-xl gap-1"
    >
      <Reanimated.View style={animatedStyle}>
        {icon}
      </Reanimated.View>
      <Text className={`text-xs font-semibold ${isFocused ? 'text-accent' : 'text-gray-400'}`}>
        {label}
      </Text>
    </Pressable>
  );
}


function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {

  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (options as Record<string, unknown>).title !== 'Algset';
  });

  const currentRoute = state.routes[state.index];
  const isOnSelectScreen = currentRoute.name.startsWith('select');

  // Drives the tab bar's shrink only. FAB animates independently on mount/unmount.
  const progress = useSharedValue(0);
  const containerWidth = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isOnSelectScreen ? 1 : 0, SPRING_CONFIG);
  }, [isOnSelectScreen]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    containerWidth.value = e.nativeEvent.layout.width;
  };
  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    const shrinkAmount = progress.value * (FAB_SIZE + GAP);
    return {
      width: containerWidth.value > 0 ? containerWidth.value - shrinkAmount : undefined,
    };
  });

  return (
    <View
      className="absolute bottom-6 left-6 right-6 flex-row items-center"
      onLayout={onContainerLayout}
    >
      <Reanimated.View
        style={[
          tabBarAnimatedStyle,
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 10,
          },
        ]}
        className="flex-row bg-white rounded-full px-2 py-3"
      >
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          const isFocused =
            state.index === state.routes.indexOf(route) ||
            currentRoute.name.startsWith(route.name.split('/')[0]);
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? COLOR_ACCENT : '#9ca3af',
            size: 28,
          });
          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              icon={icon}
              label={label}
            />
          );
        })}
      </Reanimated.View>

    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="select"
        options={{
          title: 'Select',
          tabBarIcon: ({ color, size }) => <IconCards color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Train',
          tabBarIcon: ({ color, size }) => <IconStopwatch color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stats/index"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <IconChartDots2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="links"
        options={{
          title: 'Links',
          tabBarIcon: ({ color, size }) => <IconLink color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stats/algset"
        options={{ title: 'Algset', href: null }}
      />
    </Tabs>
  );
}
