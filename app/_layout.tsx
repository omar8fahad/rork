import { BundleInspector } from '../.rorkai/inspector';
import { RorkErrorBoundary } from '../.rorkai/rork-error-boundary';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useSettingsStore } from "@/store/settingsStore";
import { colors } from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { settings } = useSettingsStore();
  const colorScheme = useColorScheme();
  
  // Determine the active theme
  const activeTheme = settings.theme === 'system' ? colorScheme || 'light' : settings.theme;
  const themeColors = colors[activeTheme];

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav theme={activeTheme} />;
}

function RootLayoutNav({ theme }: { theme: 'light' | 'dark' }) {
  const themeColors = colors[theme];
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: themeColors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="routine/[id]" 
        options={{ 
          title: "تفاصيل الروتين",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="routine/create" 
        options={{ 
          title: "إنشاء روتين",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="routine/edit/[id]" 
        options={{ 
          title: "تعديل الروتين",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="book/[id]" 
        options={{ 
          title: "تفاصيل الكتاب",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="book/create" 
        options={{ 
          title: "إضافة كتاب جديد",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="book/edit/[id]" 
        options={{ 
          title: "تعديل الكتاب",
          presentation: "modal",
        }} 
      />
    </Stack>
  );
}