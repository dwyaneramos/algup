import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Train' }} />
      <Tabs.Screen name="algsets" options={{ title: 'Algsets' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="algset" options={{ title: 'Algset', href: null }} />
    </Tabs>
  );
}
