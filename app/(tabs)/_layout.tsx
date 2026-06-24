import { Tabs } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { IconChartDots2, IconCards, IconStopwatch } from '@tabler/icons-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLOR_ACCENT } from '@/utils/constants/colors';

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
      <Text
        style={{ color: isFocused ? COLOR_ACCENT : '#9ca3af' }}
        className="text-xs font-semibold">
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

  return (
    <View
      className="absolute bottom-6 left-6 right-6 flex-row bg-white rounded-full px-2 py-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      {visibleRoutes.map((route) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const currentRoute = state.routes[state.index];
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
          size: 22,
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
        name="algsets"
        options={{
          title: 'Algsets',
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
        name="stats/algset"
        options={{ title: 'Algset', href: null }}
      />
    </Tabs>
  );
}
