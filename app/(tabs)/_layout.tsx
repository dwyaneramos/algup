

import React from 'react';
import { withLayoutContext } from 'expo-router';
import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationOptions,
  NativeBottomTabNavigationEventMap,
} from '@bottom-tabs/react-navigation';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{
        title: 'Train',
        tabBarIcon: () => ({ sfSymbol: 'house.fill' }),
      }} />
      <Tabs.Screen name="algsets" options={{ title: 'Algsets' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="algset" options={{ title: 'Algset' }} />
    </Tabs>
  );
}
