import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WallpaperCard } from "@/components/WallpaperCard";
import { getWallpapersByCategory } from "@/services/wallpaperService";

export default function CategoriesScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [wallpapers, setWallpapers] = useState(
    getWallpapersByCategory(category as string)
  );
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? "light";

  useEffect(() => {
    // Validate that we have a valid category
    if (!category) {
      router.replace("/(tabs)/wallpapers");
    } else {
      setWallpapers(getWallpapersByCategory(category as string));
    }
  }, [category, router]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setWallpapers(getWallpapersByCategory(category as string));
      setRefreshing(false);
    }, 1000);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: colorScheme === "dark" ? "#2c2c2c" : "#f0f0f0" },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[colorScheme].icon}
          />
        </TouchableOpacity>

        <ThemedText type="title">Categories</ThemedText>
        <ThemedText style={styles.subtitle}>
          {wallpapers.length} wallpapers available
        </ThemedText>
      </View>

      {wallpapers.length > 0 ? (
        <FlatList
          data={wallpapers}
          renderItem={({ item }) => <WallpaperCard wallpaper={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color="#888" />
          <ThemedText style={styles.emptyText}>
            No wallpapers found in this category.
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
    position: "relative",
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
});
