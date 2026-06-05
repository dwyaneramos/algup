import { Text, View, Button } from 'react-native';
import { Link } from 'expo-router';

export default function MainScreen() {
  return (
    <View className="flex-1 pt-16 items-center justify-start">
      <Text className="">CMLL</Text>
      <Link href="/stats">go to stats page</Link>
    </View>
  );
}
