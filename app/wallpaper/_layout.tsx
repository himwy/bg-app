import { Stack } from "expo-router";

export default function WallpaperLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          title: "Wallpaper", // Capitalized the title
        }}
      />
    </Stack>
  );
}
