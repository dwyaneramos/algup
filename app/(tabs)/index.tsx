import { View, Text, Button, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function MainScreen() {
  return (
    <View className="flex-1 pt-16 px-3 items-center justify-start">
      <Text className="font-inter-bold text-header">CMLL</Text>
      <View className="bg-white p-2 shadow-xl rounded-3xl min-h-32 max-h-32 w-full items-center justify-center">
        <Text className="text-center">
          D2 L D B2 R2 D2 R F' D' F2 U R2 B2 R2 U' D' B2 R' D2 L D B2 R2 D2 R
        </Text>
      </View>

      <Pressable
        className="bg-accent p-2 shadow-xl rounded-3xl min-w-32 items-center justify-center mt-4"
        onPress={() => alert('')}
      >
        <Text className="text-white">Show solution</Text>
      </Pressable>




      <Text className="text-7xl font-inter-medium">2.84</Text>
    </View>
  );
}
