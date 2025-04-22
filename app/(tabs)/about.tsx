import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { UploadWallpaperModal } from "@/components/UploadWallpaperModal";
import { initializeWallpapers } from "@/services/wallpaperService";

export default function AboutScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  // Initialize wallpapers when the component mounts
  useEffect(() => {
    initializeWallpapers();
  }, []);

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Error opening URL:", err)
    );
  };

  const navigateToAdmin = () => {
    router.push("/admin");
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <ThemedText type="title">Beautiful Wallpapers</ThemedText>
        <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
      </View>

      <View style={styles.content}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText style={styles.description}>
          Your ultimate destination for high-quality wallpapers. Find the
          perfect background for your device from our extensive collection of
          art and photography.
        </ThemedText>

        <View style={styles.divider} />

        <ThemedText style={styles.sectionTitle}>Features</ThemedText>
        <View style={styles.featureItem}>
          <Ionicons
            name="sparkles-outline"
            size={24}
            style={[styles.featureIcon, { color: Colors[colorScheme].icon }]}
          />
          <ThemedText style={styles.featureText}>
            Curated wallpaper collection
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Ionicons
            name="heart-outline"
            size={24}
            style={[styles.featureIcon, { color: Colors[colorScheme].icon }]}
          />
          <ThemedText style={styles.featureText}>
            Save your favorite wallpapers
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Ionicons
            name="color-palette-outline"
            size={24}
            style={[styles.featureIcon, { color: Colors[colorScheme].icon }]}
          />
          <ThemedText style={styles.featureText}>
            Categorized collections
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Ionicons
            name="search-outline"
            size={24}
            style={[styles.featureIcon, { color: Colors[colorScheme].icon }]}
          />
          <ThemedText style={styles.featureText}>
            Search for specific styles
          </ThemedText>
        </View>

        <View style={styles.divider} />

        <ThemedText style={styles.sectionTitle}>Contact & Support</ThemedText>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openLink("mailto:support@wallpaperapp.com")}
        >
          <Ionicons
            name="mail-outline"
            size={24}
            style={[styles.linkIcon, { color: Colors[colorScheme].icon }]}
          />
          <ThemedText style={styles.linkText}>
            support@wallpaperapp.com
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openLink("https://wallpaperapp.com")}
        >
          <Ionicons
            name="globe-outline"
            size={24}
            style={[styles.linkIcon, { color: Colors[colorScheme].icon }]}
          />
          <ThemedText style={styles.linkText}>wallpaperapp.com</ThemedText>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setUploadModalVisible(true)}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={24}
            color="#fff"
            style={styles.uploadIcon}
          />
          <ThemedText style={styles.uploadText}>Upload Wallpapers</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.adminButton} onPress={navigateToAdmin}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="#fff"
            style={styles.adminIcon}
          />
          <ThemedText style={styles.adminText}>Manage Wallpapers</ThemedText>
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText style={styles.copyright}>
            © 2025 Beautiful Wallpapers
          </ThemedText>
        </View>
      </View>

      {/* Upload Wallpaper Modal */}
      <UploadWallpaperModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUploadComplete={() => setUploadModalVisible(false)}
      />
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
    alignItems: "center",
  },
  version: {
    marginTop: 4,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginVertical: 20,
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.2)",
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 12,
    opacity: 0.8,
  },
  featureText: {
    fontSize: 16,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  linkIcon: {
    marginRight: 12,
    opacity: 0.8,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50", // Green color for upload
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
  },
  adminIcon: {
    marginRight: 8,
  },
  adminText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingTop: 24,
  },
  copyright: {
    fontSize: 14,
    opacity: 0.6,
  },
});
