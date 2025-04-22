import React, { useState, useEffect } from "react";
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
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Refresh categories when modal becomes visible
  useEffect(() => {
    if (visible) {
      setExistingCategories(getAllCategories());
    }
  }, [visible]);

  const handleSingleUpload = async () => {
    if (!category) {
      Alert.alert("Error", "Please select or create a category");
      return;
    }

    try {
      setLoading(true);
      // We're leaving wallpaperName blank here intentionally
      // so the name will be extracted from the file name
      const result = await addWallpaperFromGallery(
        wallpaperName, // If blank, will use filename
        category
      );

      if (result) {
        Alert.alert(
          "Success",
          "Wallpaper uploaded and categorized successfully"
        );
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
      Alert.alert("Error", "Please select or create a category");
      return;
    }

    try {
      setLoading(true);
      const results = await addMultipleWallpapersFromGallery(category);

      if (results.length > 0) {
        Alert.alert(
          "Success",
          `${results.length} wallpapers uploaded and categorized successfully`
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
    setShowCreateCategory(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    // Add the new category and select it
    setCategory(newCategory);
    if (!existingCategories.includes(newCategory)) {
      setExistingCategories([...existingCategories, newCategory].sort());
    }
    setNewCategory("");
    setShowCreateCategory(false);
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
              <ThemedText style={styles.helperText}>
                Choose an existing category or create a new one. Images will be
                organized in folders by category.
              </ThemedText>

              {existingCategories.length > 0 && (
                <>
                  <ThemedText style={styles.subLabel}>
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

              <View style={styles.categoryActionContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryActionButton,
                    { backgroundColor: Colors[colorScheme ?? "light"].tint },
                  ]}
                  onPress={() => setShowCreateCategory(true)}
                >
                  <Ionicons name="add-circle" size={16} color="#fff" />
                  <ThemedText
                    style={styles.categoryActionText}
                    lightColor="#fff"
                    darkColor="#fff"
                  >
                    New Category
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {showCreateCategory && (
                <View style={styles.createCategoryContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { color: Colors[colorScheme ?? "light"].text },
                    ]}
                    placeholderTextColor={
                      Colors[colorScheme ?? "light"].text + "80"
                    }
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder="Enter new category name"
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      { backgroundColor: Colors[colorScheme ?? "light"].tint },
                    ]}
                    onPress={handleAddCategory}
                  >
                    <ThemedText
                      style={styles.addButtonText}
                      lightColor="#fff"
                      darkColor="#fff"
                    >
                      Add
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {!showCreateCategory && category && (
                <View style={styles.selectedCategoryContainer}>
                  <ThemedText style={styles.selectedCategoryLabel}>
                    Selected:
                  </ThemedText>
                  <ThemedText style={styles.selectedCategoryValue}>
                    {category}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Wallpaper Name (Optional)
              </ThemedText>
              <ThemedText style={styles.helperText}>
                Leave blank to use filenames automatically. This is recommended
                for better organization.
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
                placeholder="Enter custom name (optional)"
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
                  !category && styles.disabledButton,
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
                  !category && styles.disabledButton,
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
                <Ionicons name="information-circle" size={16} /> Wallpapers are
                automatically named from filenames
              </ThemedText>
              <ThemedText style={styles.helpText}>
                <Ionicons name="information-circle" size={16} /> Each category
                creates a separate folder
              </ThemedText>
              <ThemedText style={styles.helpText}>
                <Ionicons name="information-circle" size={16} /> Use bulk upload
                to add multiple images at once
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
    fontSize: 16,
  },
  subLabel: {
    fontWeight: "500",
    marginBottom: 8,
    fontSize: 14,
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
  categoryActionContainer: {
    marginVertical: 10,
  },
  categoryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  categoryActionText: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: "500",
  },
  createCategoryContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  addButton: {
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontWeight: "600",
  },
  selectedCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 8,
  },
  selectedCategoryLabel: {
    fontWeight: "600",
    marginRight: 5,
  },
  selectedCategoryValue: {
    fontWeight: "bold",
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
  disabledButton: {
    opacity: 0.5,
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
