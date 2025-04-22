import React, { useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  getWallpaperById,
  setAsWallpaper,
  saveToGallery,
} from "@/services/wallpaperService";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function WallpaperDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const wallpaper = getWallpaperById(id || "");
  const colorScheme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(false);

  if (!wallpaper) {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={Colors[colorScheme].text}
          />
        </TouchableOpacity>
        <View style={styles.centered}>
          <ThemedText>Wallpaper not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleAction = async (action: "save" | "home" | "lock" | "both") => {
    try {
      setLoading(true);

      if (action === "save") {
        await saveToGallery(wallpaper.imageUrl);
        Alert.alert("Success", "Wallpaper saved to gallery", [{ text: "OK" }]);
      } else {
        await setAsWallpaper(wallpaper.imageUrl, action);
        Alert.alert(
          "Success",
          Platform.OS === "android"
            ? "Wallpaper set successfully"
            : "Wallpaper saved to photos. Please set it as wallpaper from your gallery.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error with wallpaper action:", error);
      Alert.alert("Error", "Failed to complete action. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Image
        source={{ uri: wallpaper.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <View style={styles.infoContainer}>
        <ThemedText type="title" style={styles.title}>
          {wallpaper.name}
        </ThemedText>
        <ThemedText style={styles.category}>{wallpaper.category}</ThemedText>

        <View style={styles.actionsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          ) : (
            <View style={styles.buttonGrid}>
              <TouchableOpacity
                style={styles.gridButton}
                onPress={() => handleAction("lock")}
              >
                <Ionicons name="lock-closed" size={24} color="white" />
                <ThemedText style={styles.buttonText}>Lock Screen</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridButton}
                onPress={() => handleAction("home")}
              >
                <Ionicons name="home" size={24} color="white" />
                <ThemedText style={styles.buttonText}>Home Screen</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridButton}
                onPress={() => handleAction("both")}
              >
                <Ionicons name="phone-portrait" size={24} color="white" />
                <ThemedText style={styles.buttonText}>Both Screens</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridButton}
                onPress={() => handleAction("save")}
              >
                <Ionicons name="download" size={24} color="white" />
                <ThemedText style={styles.buttonText}>Save Image</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(0,0,0,0.4)",
    opacity: 0.8,
  },
  infoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: "white",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  category: {
    color: "white",
    opacity: 0.8,
    marginBottom: 24,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  actionsContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
  },
  gridButton: {
    width: "48%",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
