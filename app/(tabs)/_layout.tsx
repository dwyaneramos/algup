import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter((route) => {
    const options = descriptors[route.key].options as Record<string, unknown>;
    return options.title !== "Algset";
  });


  return (
    <View className="absolute bottom-6 left-6 right-6 flex-row bg-white rounded-full px-2 py-3"
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
        const label = options.title ?? route.name;
        const currentRoute = state.routes[state.index];
        const isFocused =
          state.index === state.routes.indexOf(route) ||
          currentRoute.name.startsWith(route.name.split("/")[0]);



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

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center justify-center py-1 rounded-xl"
          >
            <Text className={`text-sm font-semibold ${isFocused ? 'text-black' : 'text-gray-400'}`}>
              {label}
            </Text>
            {isFocused && (
              <View className="absolute bottom-0 w-1 h-1 rounded-full bg-black" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Train' }} />
      <Tabs.Screen name="algsets" options={{ title: 'Algsets' }} />
      <Tabs.Screen name="stats/index" options={{ title: 'Stats' }} />
      <Tabs.Screen name="stats/algset" options={{ title: 'Algset', href: null }} />
    </Tabs>
  );
}
