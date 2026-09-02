import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, ActivityIndicator } from "react-native";
import { Toaster } from 'sonner-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";

// TODO: Find a better way to import this
import { Inter_100Thin } from '@expo-google-fonts/inter/100Thin';
import { Inter_200ExtraLight } from '@expo-google-fonts/inter/200ExtraLight';
import { Inter_300Light } from '@expo-google-fonts/inter/300Light';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { Inter_900Black } from '@expo-google-fonts/inter/900Black';
import { Inter_100Thin_Italic } from '@expo-google-fonts/inter/100Thin_Italic';
import { Inter_200ExtraLight_Italic } from '@expo-google-fonts/inter/200ExtraLight_Italic';
import { Inter_300Light_Italic } from '@expo-google-fonts/inter/300Light_Italic';
import { Inter_400Regular_Italic } from '@expo-google-fonts/inter/400Regular_Italic';
import { Inter_500Medium_Italic } from '@expo-google-fonts/inter/500Medium_Italic';
import { Inter_600SemiBold_Italic } from '@expo-google-fonts/inter/600SemiBold_Italic';
import { Inter_700Bold_Italic } from '@expo-google-fonts/inter/700Bold_Italic';
import { Inter_800ExtraBold_Italic } from '@expo-google-fonts/inter/800ExtraBold_Italic';
import { Inter_900Black_Italic } from '@expo-google-fonts/inter/900Black_Italic';
import { initDB, resetDB } from '@/src/db/schema';
import { getSetting, getAlgSets, getAlgSet, applyDecayToAllCases } from '@/src/db/queries';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SELECTED_ALGSET_KEY } from '@/src/logic/algsets';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { useSettingsStore } from '@/src/store/settingsStore';

initDB();
applyDecayToAllCases();
export default function RootLayout() {
  const setSelectedAlgSet = useAlgSetStore(s => s.setSelectedAlgSet);
  const loadAlgSets = useAlgSetStore(s => s.loadAlgSets);
  const loadSettings = useSettingsStore(s => s.loadSettings);

  // DB-driven store hydration is a side effect, not something safe to do
  // during render - calling setSelectedAlgSet here mid-render caused a
  // "Cannot update a component while rendering a different component" error
  // (MainScreen is already subscribed to this store), risking it reading a
  // stale selectedAlgSet on first mount.
  useEffect(() => {
    const selectedAlgsetName = getSetting(SELECTED_ALGSET_KEY);
    // A saved name can go stale (its algset was deleted/renamed elsewhere),
    // so fall back to the first available algset rather than leaving
    // selectedAlgSet unset - guaranteed to exist if initDB succeeded.
    const retrievedAlgSet = selectedAlgsetName !== null ? getAlgSet(selectedAlgsetName) : null;
    setSelectedAlgSet(retrievedAlgSet ?? getAlgSets()[0]);

    loadAlgSets();
    loadSettings();
  }, []);

  let [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    Inter_100Thin_Italic,
    Inter_200ExtraLight_Italic,
    Inter_300Light_Italic,
    Inter_400Regular_Italic,
    Inter_500Medium_Italic,
    Inter_600SemiBold_Italic,
    Inter_700Bold_Italic,
    Inter_800ExtraBold_Italic,
    Inter_900Black_Italic
  });
  if (!fontsLoaded) return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="algset/create" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="algset/edit/[name]" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="folder/create" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="folder/edit/[name]" options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
          <Toaster offset={110} visibleToasts={1} theme="light" />
        </BottomSheetModalProvider>

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
