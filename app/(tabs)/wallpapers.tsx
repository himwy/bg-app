import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  Dimensions,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SearchBar } from "@/components/SearchBar";
import {
  getAllWallpapers,
  searchWallpapers,
} from "@/services/wallpaperService";
import { WallpaperItem } from "@/services/wallpaperService";

const { width } = Dimensions.get("window");

// Helper function to get unique categories
const getAllCategories = () => {
  const wallpapers = getAllWallpapers();
  const categories = new Map<string, WallpaperItem>();

  // First pass: collect all wallpapers by category
  const wallpapersByCategory: Record<string, WallpaperItem[]> = {};
  wallpapers.forEach((wallpaper) => {
    if (!wallpapersByCategory[wallpaper.category]) {
      wallpapersByCategory[wallpaper.category] = [];
    }
    wallpapersByCategory[wallpaper.category].push(wallpaper);
  });

  // Second pass: use the first wallpaper from each category as the thumbnail
  Object.entries(wallpapersByCategory).forEach(
    ([category, categoryWallpapers]) => {
      if (categoryWallpapers.length > 0) {
        categories.set(category, categoryWallpapers[0]);
      }
    }
  );

  return Array.from(categories.entries()).map(([category, wallpaper]) => ({
    category,
    thumbnailUrl: wallpaper.thumbnailUrl,
    localImage: wallpaper.localImage, // Make sure we pass the local image if it exists
  }));
};

// Count wallpapers in each category
const getCategoryCount = (category: string) => {
  const wallpapers = getAllWallpapers();
  return wallpapers.filter((wallpaper) => wallpaper.category === category)
    .length;
};

export default function WallpapersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<WallpaperItem[]>([]);
  const colorScheme = useColorScheme() ?? "light";
  const categories = getAllCategories();

  useEffect(() => {
    if (searchQuery) {
      setSearchResults(searchWallpapers(searchQuery));
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const navigateToAdmin = () => {
    router.push("/admin");
  };

  const navigateToCategory = (category: string) => {
    router.push({
      pathname: "/categories",
      params: { category },
    });
  };

  const navigateToWallpaper = (id: string) => {
    router.push({
      pathname: "/wallpaper/[id]",
      params: { id },
    });
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const renderSearchResults = () => (
    <FlatList
      key="search-results"
      data={searchResults}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.searchResultItem}
          onPress={() => navigateToWallpaper(item.id)}
        >
          <ImageBackground
            source={
              item.isLocal && item.localImage
                ? item.localImage
                : { uri: item.thumbnailUrl }
            }
            style={styles.searchResultImage}
            imageStyle={{ borderRadius: 12 }}
          >
            <View style={styles.searchResultOverlay}>
              <Text style={styles.searchResultName}>{item.name}</Text>
              <Text style={styles.searchResultCategory}>{item.category}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
      numColumns={3}
      columnWrapperStyle={styles.searchResultsColumns}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptySearchContainer}>
          <Ionicons name="search-outline" size={64} color="#888" />
          <ThemedText style={styles.emptySearchText}>
            No wallpapers found. Try a different search term.
          </ThemedText>
        </View>
      }
    />
  );

  const renderCategories = () => (
    <FlatList
      key="categories"
      data={categories}
      numColumns={1}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigateToCategory(item.category)}
        >
          <ImageBackground
            source={
              item.localImage ? item.localImage : { uri: item.thumbnailUrl }
            }
            style={styles.categoryImage}
            imageStyle={{ borderRadius: 12 }}
          >
            <View style={styles.categoryOverlay}>
              <Text style={styles.categoryName}>{item.category}</Text>
              <Text style={styles.categoryCount}>
                {getCategoryCount(item.category)} wallpapers
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.category}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    />
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText type="title">Categories</ThemedText>
          <ThemedText style={styles.subtitle}>
            Explore wallpapers by category
          </ThemedText>
        </View>
        <TouchableOpacity onPress={navigateToAdmin} style={styles.adminButton}>
          <Ionicons
            name="settings"
            size={24}
            color={Colors[colorScheme].text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search wallpapers..."
        />
      </View>

      {isSearching && searchQuery ? renderSearchResults() : renderCategories()}
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
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  categoryCard: {
    width: "100%",
    height: 160,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  categoryOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  categoryName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  categoryCount: {
    color: "#ffffff",
    fontSize: 14,
    opacity: 0.8,
  },
  searchResultsColumns: {
    justifyContent: "space-between",
  },
  searchResultItem: {
    width: (width - 48) / 3,
    height: 180,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  searchResultImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  searchResultOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 12,
  },
  searchResultName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  searchResultCategory: {
    color: "#ffffff",
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  emptySearchContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptySearchText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  adminButton: {
    padding: 8,
    borderRadius: 20,
  },
});
