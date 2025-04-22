import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useNavigation } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { View, Alert, Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";

import { useColorScheme } from "@/hooks/useColorScheme";
import DebugConsole from "@/components/DebugConsole"; // Import the DebugConsole component

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Check if running in Expo Go
const isExpoGo = !MediaLibrary.getPermissionsAsync;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Show Expo Go limitations warning once when app first loads
  useEffect(() => {
    if (isExpoGo && Platform.OS === "android") {
      Alert.alert(
        "Limited Functionality",
        "Due to changes in Android's permission requirements, Expo Go has limited access to media features. Some wallpaper functionality may not work properly. For full access, consider creating a development build.",
        [{ text: "OK" }]
      );
    }
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Reset navigation state when the app loads
  useEffect(() => {
    // Ensure we always start with a clean navigation state
    router.replace("/(tabs)" as any);
  }, []);

  // Wrap the entire navigation in a View component to ensure proper nesting
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack initialRouteName="(tabs)">
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          <Stack.Screen name="wallpaper" options={{ headerShown: false }} />
          <Stack.Screen name="categories" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
        </Stack>
        <DebugConsole />
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}
