import { Redirect } from "expo-router";

// This file redirects the root (tabs) path to the wallpapers tab
export default function TabsIndex() {
  return <Redirect href="/(tabs)/wallpapers" />;
}
