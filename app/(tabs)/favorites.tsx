import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, FlatList, View, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WallpaperCard } from "@/components/WallpaperCard";
import { WallpaperItem, getWallpaperById } from "@/services/wallpaperService";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<WallpaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load favorites when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const storedFavorites = await AsyncStorage.getItem("favorites");
      if (storedFavorites) {
        const favoriteIds = JSON.parse(storedFavorites) as string[];
        const favoriteWallpapers = favoriteIds
          .map((id) => getWallpaperById(id))
          .filter((item) => item !== undefined) as WallpaperItem[];
        setFavorites(favoriteWallpapers);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <ThemedText type="title">Favorites</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your collection of favorite wallpapers
        </ThemedText>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#888" />
          <ThemedText style={styles.emptyText}>
            No favorites yet. Tap the heart icon on any wallpaper to add it
            here!
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <WallpaperCard
              wallpaper={item}
              showFavoriteButton={true}
              onFavoritesChanged={loadFavorites}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
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
