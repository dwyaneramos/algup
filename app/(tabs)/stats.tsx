import { Text, View, Button } from 'react-native';
import { Link } from 'expo-router';

export default function Stats() {
  return (
    <View className="items-center flex-1 justify-center bg-white">
      <Text>stats page</Text>
      <Link href="/">go to main page</Link>
    </View>
  );
}
