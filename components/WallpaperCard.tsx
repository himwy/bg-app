import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  View,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { ThemedText } from "./ThemedText";
import {
  WallpaperItem,
  toggleFavorite,
  isFavorite,
  logger,
  isRunningInExpoGo,
} from "@/services/wallpaperService";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const cardWidth = (width - 52) / 3; // Three columns with padding

interface WallpaperCardProps {
  wallpaper: WallpaperItem;
  showFavoriteButton?: boolean;
  onFavoritesChanged?: () => void;
}

export function WallpaperCard({
  wallpaper,
  showFavoriteButton = true,
  onFavoritesChanged,
}: WallpaperCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Check if this wallpaper is favorited
    const checkFavoriteStatus = async () => {
      try {
        const favStatus = await isFavorite(wallpaper.id);
        setIsFavorited(favStatus);
      } catch (error) {
        logger.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [wallpaper.id]);

  const handleToggleFavorite = async (e: any) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    try {
      // Check if we're in Expo Go on Android, which has limited media access
      if (isRunningInExpoGo() && Platform.OS === "android") {
        logger.warn(
          "Limited functionality in Expo Go. Some features may not work properly."
        );
      }

      const newFavoriteStatus = await toggleFavorite(wallpaper.id);
      setIsFavorited(newFavoriteStatus);

      // If parent component wants to know about favorites changes
      if (onFavoritesChanged) {
        onFavoritesChanged();
      }
    } catch (error) {
      logger.error("Failed to toggle favorite:", error);
    }
  };

  // Determine image source based on whether it's local or remote
  const getImageSource = () => {
    if (wallpaper.isLocal && wallpaper.localImage) {
      return wallpaper.localImage;
    } else {
      return { uri: wallpaper.thumbnailUrl };
    }
  };

  return (
    <Link
      href={{ pathname: "/wallpaper/[id]", params: { id: wallpaper.id } }}
      asChild
    >
      <TouchableOpacity style={styles.card}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode="cover"
        />
        {showFavoriteButton && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorited ? "heart" : "heart-outline"}
              size={22}
              color={isFavorited ? "#ff3b5c" : Colors[colorScheme].text}
            />
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <ThemedText numberOfLines={1} style={styles.name}>
            {wallpaper.name}
          </ThemedText>
          <ThemedText numberOfLines={1} style={styles.category}>
            {wallpaper.category}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 7,
    position: "relative",
  },
  image: {
    width: "100%",
    height: cardWidth * 1.5,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  textContainer: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  category: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
});
