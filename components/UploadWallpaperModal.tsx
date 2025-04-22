import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {
  addWallpaperFromGallery,
  addMultipleWallpapersFromGallery,
  getAllCategories,
} from "@/services/wallpaperService";

interface UploadWallpaperModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export const UploadWallpaperModal = ({
  visible,
  onClose,
  onUploadComplete,
}: UploadWallpaperModalProps) => {
  const colorScheme = useColorScheme();
  const [wallpaperName, setWallpaperName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [existingCategories, setExistingCategories] = useState<string[]>(
    getAllCategories()
  );

  const handleSingleUpload = async () => {
    if (!category) {
      Alert.alert("Error", "Please enter a category");
      return;
    }

    try {
      setLoading(true);
      const result = await addWallpaperFromGallery(
        wallpaperName || "New Wallpaper",
        category
      );

      if (result) {
        Alert.alert("Success", "Wallpaper uploaded successfully");
        setWallpaperName("");
        setCategory("");
        setPreviewUri(null);
        onUploadComplete();
      }
    } catch (error: any) {
      Alert.alert(
        "Upload Failed",
        error.message || "Failed to upload wallpaper"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!category) {
      Alert.alert("Error", "Please enter a category");
      return;
    }

    try {
      setLoading(true);
      const results = await addMultipleWallpapersFromGallery(category);

      if (results.length > 0) {
        Alert.alert(
          "Success",
          `${results.length} wallpapers uploaded successfully`
        );
        setCategory("");
        onUploadComplete();
      } else {
        Alert.alert("Info", "No wallpapers were selected");
      }
    } catch (error: any) {
      Alert.alert(
        "Upload Failed",
        error.message || "Failed to upload wallpapers"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Upload Wallpapers</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={Colors[colorScheme ?? "light"].text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Category *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].text + "80"
                }
                value={category}
                onChangeText={setCategory}
                placeholder="Enter category (required)"
              />

              {existingCategories.length > 0 && (
                <>
                  <ThemedText style={styles.label}>
                    Existing Categories
                  </ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScrollView}
                  >
                    <View style={styles.categoriesContainer}>
                      {existingCategories.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryTag,
                            category === cat && styles.selectedCategoryTag,
                            {
                              borderColor: Colors[colorScheme ?? "light"].tint,
                            },
                          ]}
                          onPress={() => selectCategory(cat)}
                        >
                          <ThemedText
                            style={[
                              styles.categoryText,
                              category === cat && styles.selectedCategoryText,
                            ]}
                          >
                            {cat}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Wallpaper Name (Optional)
              </ThemedText>
              <ThemedText style={styles.helperText}>
                For single uploads only. Multiple uploads will be named
                automatically.
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].text + "80"
                }
                value={wallpaperName}
                onChangeText={setWallpaperName}
                placeholder="Enter name (optional)"
              />
            </View>

            {previewUri && (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: previewUri }}
                  style={styles.previewImage}
                />
              </View>
            )}

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
                onPress={handleSingleUpload}
                disabled={loading || !category}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="image" size={24} color="#fff" />
                    <ThemedText
                      style={styles.buttonText}
                      lightColor="#fff"
                      darkColor="#fff"
                    >
                      Single Upload
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
                onPress={handleBulkUpload}
                disabled={loading || !category}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="images" size={24} color="#fff" />
                    <ThemedText
                      style={styles.buttonText}
                      lightColor="#fff"
                      darkColor="#fff"
                    >
                      Bulk Upload
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.helpTextContainer}>
              <ThemedText style={styles.helpText}>
                <Ionicons name="information-circle" size={16} /> Single Upload:
                Select one image and add details
              </ThemedText>
              <ThemedText style={styles.helpText}>
                <Ionicons name="information-circle" size={16} /> Bulk Upload:
                Select multiple images at once
              </ThemedText>
            </View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  categoriesScrollView: {
    marginTop: 8,
    marginBottom: 16,
    maxHeight: 50,
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  selectedCategoryTag: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    color: "#fff",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  optionsContainer: {
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
    fontSize: 16,
  },
  helpTextContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  helpText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
});
