import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  TextInput,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {
  importWallpapersFromJson,
  exportWallpapersToJson,
  getAllWallpapers,
  initializeWallpapers,
  addWallpaperFromGallery,
  addMultipleWallpapersFromGallery,
  WallpaperItem,
  logger,
  getAllCategories,
} from "@/services/wallpaperService";

export default function AdminScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // State for upload modal
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [newWallpaperName, setNewWallpaperName] = useState("");
  const [newWallpaperCategory, setNewWallpaperCategory] = useState("");
  const [isBatchUpload, setIsBatchUpload] = useState(false);

  useEffect(() => {
    // Load wallpapers when the screen mounts
    const loadWallpapers = async () => {
      try {
        setIsInitializing(true);
        const data = await initializeWallpapers();
        setWallpapers(data);
        setCategories(getAllCategories());
      } catch (error) {
        Alert.alert("Error", "Failed to load wallpapers");
      } finally {
        setIsInitializing(false);
      }
    };

    loadWallpapers();
  }, []);

  const handleImport = async () => {
    try {
      setIsLoading(true);
      const success = await importWallpapersFromJson();

      if (success) {
        // Reload the wallpapers after import
        const updatedWallpapers = getAllWallpapers();
        setWallpapers(updatedWallpapers);
        setCategories(getAllCategories());
        Alert.alert("Success", "Wallpapers imported successfully");
      }
    } catch (error: any) {
      Alert.alert(
        "Import Error",
        error.message || "Failed to import wallpapers"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      await exportWallpapersToJson();
      Alert.alert("Success", "Wallpapers exported successfully");
    } catch (error: any) {
      Alert.alert(
        "Export Error",
        error.message || "Failed to export wallpapers"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle uploading a single wallpaper
  const handleUploadSingle = async () => {
    if (!newWallpaperName.trim() || !newWallpaperCategory.trim()) {
      Alert.alert("Error", "Please provide both name and category");
      return;
    }

    try {
      setIsLoading(true);
      const wallpaper = await addWallpaperFromGallery(
        newWallpaperName,
        newWallpaperCategory
      );

      if (wallpaper) {
        // Refresh the wallpaper list
        setWallpapers(getAllWallpapers());
        setCategories(getAllCategories());
        setIsUploadModalVisible(false);
        setNewWallpaperName("");
        setNewWallpaperCategory("");
        Alert.alert("Success", "Wallpaper added successfully");
      }
    } catch (error: any) {
      Alert.alert(
        "Upload Error",
        error.message || "Failed to upload wallpaper"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle batch uploading multiple wallpapers
  const handleBatchUpload = async () => {
    if (!newWallpaperCategory.trim()) {
      Alert.alert("Error", "Please provide a category");
      return;
    }

    try {
      setIsLoading(true);
      const newWallpapers = await addMultipleWallpapersFromGallery(
        newWallpaperCategory
      );

      if (newWallpapers.length > 0) {
        // Refresh the wallpaper list
        setWallpapers(getAllWallpapers());
        setCategories(getAllCategories());
        setIsUploadModalVisible(false);
        setNewWallpaperCategory("");
        Alert.alert(
          "Success",
          `${newWallpapers.length} wallpapers added successfully`
        );
      } else {
        Alert.alert("Note", "No wallpapers were selected");
      }
    } catch (error: any) {
      Alert.alert(
        "Upload Error",
        error.message || "Failed to upload wallpapers"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderWallpaperItem = ({ item }: { item: WallpaperItem }) => (
    <View style={styles.wallpaperItem}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      <View style={styles.wallpaperDetails}>
        <ThemedText style={styles.wallpaperName}>{item.name}</ThemedText>
        <ThemedText style={styles.wallpaperCategory}>
          {item.category}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Admin",
          headerShown: false,
        }}
      />
      <ThemedView style={styles.container}>
        <StatusBar style="auto" />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: colorScheme === "dark" ? "#2c2c2c" : "#f0f0f0",
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors[colorScheme ?? "light"].icon}
            />
          </TouchableOpacity>
          <ThemedText type="title">Admin</ThemedText>
          <ThemedText style={styles.subtitle}>
            Manage your wallpaper collection
          </ThemedText>
        </View>

        <ScrollView style={styles.content}>
          {/* Upload wallpapers section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Upload Wallpapers
            </ThemedText>
            <ThemedText style={styles.description}>
              Add new wallpapers to your collection
            </ThemedText>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
                onPress={() => {
                  setIsBatchUpload(false);
                  setIsUploadModalVisible(true);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color="#fff"
                    />
                    <ThemedText
                      style={styles.buttonText}
                      lightColor="#fff"
                      darkColor="#fff"
                    >
                      Upload Single
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
                onPress={() => {
                  setIsBatchUpload(true);
                  setIsUploadModalVisible(true);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="images-outline" size={24} color="#fff" />
                    <ThemedText
                      style={styles.buttonText}
                      lightColor="#fff"
                      darkColor="#fff"
                    >
                      Batch Upload
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Bulk Import/Export
            </ThemedText>
            <ThemedText style={styles.description}>
              Import wallpapers from a JSON file or export your collection for
              backup
            </ThemedText>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
                onPress={handleImport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={24}
                      color="#fff"
                    />
                    <ThemedText
                      style={styles.buttonText}
                      lightColor="#fff"
                      darkColor="#fff"
                    >
                      Import Wallpapers
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
                onPress={handleExport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-download-outline"
                      size={24}
                      color="#fff"
                    />
                    <ThemedText
                      style={styles.buttonText}
                      lightColor="#fff"
                      darkColor="#fff"
                    >
                      Export Collection
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Import Format</ThemedText>
            <ThemedText style={styles.codeBlock}>
              {`[
  {
    "name": "Wallpaper Name",
    "category": "Category",
    "imageUrl": "https://example.com/image.jpg",
    "thumbnailUrl": "https://example.com/thumbnail.jpg"
  },
  // More wallpapers...
]`}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Current Collection
            </ThemedText>
            <ThemedText style={styles.description}>
              {wallpapers.length} wallpapers in your collection
            </ThemedText>

            {categories.length > 0 && (
              <View style={styles.categoryList}>
                <ThemedText style={styles.categoryTitle}>
                  Categories:
                </ThemedText>
                <View style={styles.categoryChips}>
                  {categories.map((category) => (
                    <View
                      key={category}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#2c2c2c" : "#f0f0f0",
                        },
                      ]}
                    >
                      <ThemedText style={styles.categoryChipText}>
                        {category}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {isInitializing ? (
              <ActivityIndicator
                style={styles.loader}
                color={Colors[colorScheme ?? "light"].tint}
              />
            ) : (
              <View style={styles.wallpaperList}>
                {wallpapers.map((item) => (
                  <View key={item.id} style={styles.wallpaperItem}>
                    <Image
                      source={{ uri: item.thumbnailUrl }}
                      style={styles.thumbnail}
                    />
                    <View style={styles.wallpaperDetails}>
                      <ThemedText style={styles.wallpaperName}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={styles.wallpaperCategory}>
                        {item.category}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Upload Modal */}
        <Modal
          visible={isUploadModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsUploadModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  {isBatchUpload ? "Batch Upload" : "Upload Wallpaper"}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setIsUploadModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors[colorScheme ?? "light"].text}
                  />
                </TouchableOpacity>
              </View>

              {!isBatchUpload && (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#2c2c2c" : "#f0f0f0",
                      color: Colors[colorScheme ?? "light"].text,
                    },
                  ]}
                  placeholder="Wallpaper Name"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#999" : "#777"
                  }
                  value={newWallpaperName}
                  onChangeText={setNewWallpaperName}
                />
              )}

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2c2c2c" : "#f0f0f0",
                    color: Colors[colorScheme ?? "light"].text,
                  },
                ]}
                placeholder="Category"
                placeholderTextColor={colorScheme === "dark" ? "#999" : "#777"}
                value={newWallpaperCategory}
                onChangeText={setNewWallpaperCategory}
              />

              {categories.length > 0 && (
                <View style={styles.categoryChips}>
                  <ThemedText style={styles.smallLabel}>
                    Existing categories:
                  </ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        onPress={() => setNewWallpaperCategory(category)}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor:
                              colorScheme === "dark" ? "#2c2c2c" : "#f0f0f0",
                          },
                        ]}
                      >
                        <ThemedText style={styles.categoryChipText}>
                          {category}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
                onPress={isBatchUpload ? handleBatchUpload : handleUploadSingle}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText
                    style={styles.uploadButtonText}
                    lightColor="#fff"
                    darkColor="#fff"
                  >
                    {isBatchUpload
                      ? "Select Multiple Wallpapers"
                      : "Select Wallpaper"}
                  </ThemedText>
                )}
              </TouchableOpacity>

              {isBatchUpload && (
                <ThemedText style={styles.batchUploadNote}>
                  All selected images will be added to the "
                  {newWallpaperCategory}" category. You can rename them
                  individually later.
                </ThemedText>
              )}
            </ThemedView>
          </View>
        </Modal>
      </ThemedView>
    </>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    opacity: 0.7,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  buttonText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  codeBlock: {
    fontFamily: "SpaceMono",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    color: "#333",
  },
  wallpaperList: {
    marginTop: 12,
  },
  wallpaperItem: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(150,150,150,0.1)",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  wallpaperDetails: {
    marginLeft: 12,
    justifyContent: "center",
  },
  wallpaperName: {
    fontWeight: "600",
    fontSize: 16,
  },
  wallpaperCategory: {
    opacity: 0.7,
    marginTop: 4,
  },
  loader: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 5,
  },
  input: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  uploadButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  uploadButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  batchUploadNote: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  categoryList: {
    marginTop: 16,
    marginBottom: 20,
  },
  categoryTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  categoryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: {
    fontSize: 13,
  },
  smallLabel: {
    fontSize: 12,
    marginBottom: 6,
    opacity: 0.7,
    width: "100%",
  },
  categoryScroll: {
    marginBottom: 16,
  },
});
