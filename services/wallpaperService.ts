import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add a simple logging utility
export const logger = {
  log: (...args: any[]) => {
    console.log('[WALLPAPER-APP]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[WALLPAPER-APP]', ...args);
  },
  info: (...args: any[]) => {
    console.info('[WALLPAPER-APP]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[WALLPAPER-APP]', ...args);
  }
};

export interface WallpaperItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
}

// Key for storing wallpapers in AsyncStorage
const WALLPAPERS_STORAGE_KEY = '@wallpaper_app/wallpapers';

// Initial default wallpaper data
// ----------------------------------------------------
// ADD YOUR WALLPAPERS HERE - Just add entries to this array!
// ----------------------------------------------------
const defaultWallpapers: WallpaperItem[] = [
  {
    id: '1',
    name: 'Demon Slayer',
    category: 'Anime',
    imageUrl: 'https://images.pexels.com/photos/7809123/pexels-photo-7809123.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/7809123/pexels-photo-7809123.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'One Piece',
    category: 'Anime',
    imageUrl: 'https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Anime Girl',
    category: 'Aesthetic',
    imageUrl: 'https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '4',
    name: 'Night Cityscape',
    category: 'Aesthetic',
    imageUrl: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '5',
    name: 'Studio Ghibli',
    category: 'Anime',
    imageUrl: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '6',
    name: 'Neo Tokyo',
    category: 'Cyberpunk',
    imageUrl: 'https://images.pexels.com/photos/2129796/pexels-photo-2129796.png',
    thumbnailUrl: 'https://images.pexels.com/photos/2129796/pexels-photo-2129796.png?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '7',
    name: 'Sakura Season',
    category: 'Anime',
    imageUrl: 'https://images.pexels.com/photos/1287075/pexels-photo-1287075.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/1287075/pexels-photo-1287075.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '8',
    name: 'Neon Anime',
    category: 'Cyberpunk',
    imageUrl: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '9',
    name: 'Anime Beach',
    category: 'Summer',
    imageUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '10',
    name: 'Fantasy Aurora',
    category: 'Fantasy',
    imageUrl: 'https://images.pexels.com/photos/1693095/pexels-photo-1693095.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/1693095/pexels-photo-1693095.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '11',
    name: 'Attack on Titan',
    category: 'Anime',
    imageUrl: 'https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '12',
    name: 'Naruto',
    category: 'Anime',
    imageUrl: 'https://images.pexels.com/photos/6507483/pexels-photo-6507483.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/6507483/pexels-photo-6507483.jpeg?auto=compress&cs=tinysrgb&w=400',
  }
];

// Get wallpapers from storage or use default
let wallpapers: WallpaperItem[] = [...defaultWallpapers];

// Initialize wallpapers from storage
export const initializeWallpapers = async (): Promise<WallpaperItem[]> => {
  try {
    const storedWallpapers = await AsyncStorage.getItem(WALLPAPERS_STORAGE_KEY);
    if (storedWallpapers) {
      wallpapers = JSON.parse(storedWallpapers);
      logger.info(`Loaded ${wallpapers.length} wallpapers from storage`);
    } else {
      logger.info('No stored wallpapers found, using defaults');
      wallpapers = [...defaultWallpapers];
    }
    return wallpapers;
  } catch (error) {
    logger.error('Error initializing wallpapers:', error);
    return defaultWallpapers;
  }
};

// Save wallpapers to storage
export const saveWallpapers = async (wallpaperList: WallpaperItem[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(WALLPAPERS_STORAGE_KEY, JSON.stringify(wallpaperList));
    wallpapers = [...wallpaperList];
    logger.info(`Saved ${wallpapers.length} wallpapers to storage`);
    return true;
  } catch (error) {
    logger.error('Error saving wallpapers:', error);
    return false;
  }
};

// Add wallpaper from image gallery (for user uploads)
export const addWallpaperFromGallery = async (name: string, category: string): Promise<WallpaperItem | null> => {
  try {
    logger.info('Adding wallpaper from gallery');
    
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }
    
    // Allow user to select image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: false,
    });
    
    if (result.canceled) {
      logger.info('Image selection canceled by user');
      return null;
    }
    
    const imageAsset = result.assets[0];
    logger.info('Image selected:', imageAsset.uri);
    
    // For a real app, you'd upload the image to a server here and get back URLs
    // For this demo, we'll just use the local URI for both image and thumbnail
    // In a real implementation, you'd:
    // 1. Upload the image to your server or cloud storage
    // 2. Generate a thumbnail 
    // 3. Get back the URLs for both
    
    const newWallpaper: WallpaperItem = {
      id: `local_${Date.now()}`,
      name: name,
      category: category,
      imageUrl: imageAsset.uri, // In a real app, this would be a remote URL
      thumbnailUrl: imageAsset.uri, // In a real app, this would be a remote URL
    };
    
    // Add to collection
    const updatedWallpapers = [...wallpapers, newWallpaper];
    await saveWallpapers(updatedWallpapers);
    
    logger.info('Wallpaper added successfully');
    return newWallpaper;
  } catch (error) {
    logger.error('Error adding wallpaper from gallery:', error);
    throw error;
  }
};

// Add multiple wallpapers from gallery (batch upload)
export const addMultipleWallpapersFromGallery = async (category: string): Promise<WallpaperItem[]> => {
  try {
    logger.info('Adding multiple wallpapers from gallery');
    
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }
    
    // Allow user to select images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true, // Enable multiple selection
    });
    
    if (result.canceled || !result.assets || result.assets.length === 0) {
      logger.info('Image selection canceled by user or no images selected');
      return [];
    }
    
    logger.info(`${result.assets.length} images selected`);
    
    // Process each image
    const newWallpapers: WallpaperItem[] = result.assets.map((asset, index) => ({
      id: `local_batch_${Date.now()}_${index}`,
      name: `${category} ${index + 1}`, // Basic naming, could be improved
      category: category,
      imageUrl: asset.uri, // In a real app, this would be a remote URL
      thumbnailUrl: asset.uri, // In a real app, this would be a remote URL
    }));
    
    // Add to collection
    const updatedWallpapers = [...wallpapers, ...newWallpapers];
    await saveWallpapers(updatedWallpapers);
    
    logger.info(`${newWallpapers.length} wallpapers added successfully`);
    return newWallpapers;
  } catch (error) {
    logger.error('Error adding multiple wallpapers from gallery:', error);
    throw error;
  }
};

// Generate a unique category list
export const getAllCategories = (): string[] => {
  const uniqueCategories = new Set(wallpapers.map(w => w.category));
  return Array.from(uniqueCategories).sort();
};

// Import wallpapers from a JSON file
export const importWallpapersFromJson = async (): Promise<boolean> => {
  try {
    logger.info('Starting wallpaper import process');
    
    // Pick a JSON file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true
    });
    
    if (result.canceled) {
      logger.info('Import canceled by user');
      return false;
    }
    
    // Read the file
    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
    logger.info('File read successfully');
    
    // Parse the JSON and validate format
    const importedData = JSON.parse(fileContent);
    if (!Array.isArray(importedData)) {
      logger.error('Invalid import format - not an array');
      throw new Error('Invalid import format. Expected an array of wallpapers.');
    }
    
    // Validate each wallpaper item
    const validWallpapers = importedData.filter((item: any) => {
      return (
        item && 
        typeof item.name === 'string' &&
        typeof item.category === 'string' &&
        typeof item.imageUrl === 'string' &&
        typeof item.thumbnailUrl === 'string'
      );
    }).map((item: any, index: number) => ({
      id: item.id || `imported_${Date.now()}_${index}`,
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl
    }));
    
    logger.info(`Found ${validWallpapers.length} valid wallpapers out of ${importedData.length} items`);
    
    if (validWallpapers.length === 0) {
      throw new Error('No valid wallpapers found in the import file');
    }
    
    // Add new wallpapers to collection (avoid duplicates by ID)
    const existingIds = new Set(wallpapers.map(w => w.id));
    const newWallpapers = validWallpapers.filter(w => !existingIds.has(w.id));
    
    const mergedWallpapers = [...wallpapers, ...newWallpapers];
    await saveWallpapers(mergedWallpapers);
    
    logger.info(`Added ${newWallpapers.length} new wallpapers to collection`);
    return true;
  } catch (error) {
    logger.error('Error importing wallpapers:', error);
    throw error;
  }
};

// Export wallpapers to a JSON file
export const exportWallpapersToJson = async (): Promise<void> => {
  try {
    logger.info('Exporting wallpaper collection');
    
    // Create the JSON content
    const jsonContent = JSON.stringify(wallpapers, null, 2);
    
    // Save to a temporary file
    const fileUri = `${FileSystem.documentDirectory}wallpaper_export_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonContent);
    logger.info('Export file created at:', fileUri);
    
    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
      logger.info('Export file shared successfully');
    } else {
      logger.warn('Sharing not available on this device');
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    logger.error('Error exporting wallpapers:', error);
    throw error;
  }
};

export const getAllWallpapers = (): WallpaperItem[] => {
  logger.log('Fetching all wallpapers');
  return wallpapers;
};

export const searchWallpapers = (query: string): WallpaperItem[] => {
  logger.log('Searching wallpapers with query:', query);
  const lowercaseQuery = query.toLowerCase();
  const results = wallpapers.filter((wallpaper) => 
    wallpaper.name.toLowerCase().includes(lowercaseQuery) || 
    wallpaper.category.toLowerCase().includes(lowercaseQuery)
  );
  logger.log(`Search results: ${results.length} wallpapers found`);
  return results;
};

export const getWallpaperById = (id: string): WallpaperItem | undefined => {
  logger.log('Fetching wallpaper by ID:', id);
  const wallpaper = wallpapers.find(wallpaper => wallpaper.id === id);
  if (wallpaper) {
    logger.log('Wallpaper found:', wallpaper.name);
  } else {
    logger.warn('No wallpaper found with ID:', id);
  }
  return wallpaper;
};

export const getWallpapersByCategory = (category: string): WallpaperItem[] => {
  logger.log('Fetching wallpapers by category:', category);
  const results = wallpapers.filter(wallpaper => wallpaper.category === category);
  logger.log(`Category results: ${results.length} wallpapers found in "${category}"`);
  return results;
};

// New favorites functionality
export const toggleFavorite = async (wallpaperId: string): Promise<boolean> => {
  try {
    const storedFavorites = await AsyncStorage.getItem('favorites');
    let favorites: string[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    
    const isCurrentlyFavorite = favorites.includes(wallpaperId);
    
    if (isCurrentlyFavorite) {
      // Remove from favorites
      favorites = favorites.filter(id => id !== wallpaperId);
      logger.info(`Removed wallpaper ${wallpaperId} from favorites`);
    } else {
      // Add to favorites
      favorites.push(wallpaperId);
      logger.info(`Added wallpaper ${wallpaperId} to favorites`);
    }
    
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    return !isCurrentlyFavorite; // Return the new favorite status
  } catch (error) {
    logger.error('Error toggling favorite:', error);
    throw error;
  }
};

export const isFavorite = async (wallpaperId: string): Promise<boolean> => {
  try {
    const storedFavorites = await AsyncStorage.getItem('favorites');
    const favorites: string[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    return favorites.includes(wallpaperId);
  } catch (error) {
    logger.error('Error checking favorite status:', error);
    return false;
  }
};

export const saveToGallery = async (imageUrl: string): Promise<boolean> => {
  logger.log('Attempting to save image to gallery:', imageUrl);
  try {
    // Request permissions
    logger.info('Requesting media library permissions');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      logger.error('Media library permission denied');
      throw new Error('Media library permission not granted');
    }

    // Download the image first
    logger.info('Downloading image');
    const fileUri = FileSystem.documentDirectory + 'wallpaper.jpg';
    const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
    logger.info('Image downloaded to:', uri);
    
    // Save to media library
    logger.info('Saving to media library');
    await MediaLibrary.saveToLibraryAsync(uri);
    logger.info('Successfully saved to gallery');
    return true;
  } catch (error) {
    logger.error('Error saving to gallery:', error);
    throw error;
  }
};

export const setAsWallpaper = async (imageUrl: string, wallpaperType: 'home' | 'lock' | 'both' = 'both') => {
  logger.log(`Attempting to set wallpaper (${wallpaperType}):`, imageUrl);
  try {
    // Request permissions
    logger.info('Requesting media library permissions');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      logger.error('Media library permission denied');
      throw new Error('Media library permission not granted');
    }

    // Download the image first
    logger.info('Downloading image');
    const fileUri = FileSystem.documentDirectory + 'wallpaper.jpg';
    const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
    logger.info('Image downloaded to:', uri);
    
    if (Platform.OS === 'android') {
      logger.info('Setting wallpaper on Android');
      // For Android, we need to convert the file:// URI to a content:// URI
      const contentUri = await FileSystem.getContentUriAsync(uri);
      logger.info('Content URI:', contentUri);
      
      try {
        // Using a more universal approach with ACTION_ATTACH_DATA
        // This typically opens the system's "Complete action using" dialog
        // where the user can choose the wallpaper app
        logger.info('Launching wallpaper chooser intent');
        await IntentLauncher.startActivityAsync('android.intent.action.ATTACH_DATA', {
          data: contentUri,
          type: 'image/jpeg',
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        });
        logger.info('Successfully launched wallpaper intent on Android');
        return true;
      } catch (intentError) {
        logger.warn('First attempt failed, trying alternate method:', intentError);
        
        // Fall back to a different approach - try to open the image
        // Most gallery apps offer "Set as wallpaper" functionality
        try {
          logger.info('Trying to open image with ACTION_VIEW');
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            type: 'image/jpeg',
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          });
          logger.info('Successfully opened image for user to set as wallpaper');
          return true;
        } catch (viewError) {
          logger.error('All attempts to set wallpaper failed:', viewError);
          
          // As a last resort, save to gallery and inform user
          await MediaLibrary.saveToLibraryAsync(uri);
          logger.info('Image saved to gallery as a fallback');
          throw new Error('Could not set wallpaper directly. The image has been saved to your gallery. Please use your device settings to set it as wallpaper.');
        }
      }
    } else {
      logger.info('Setting wallpaper on iOS (saving to gallery)');
      // iOS doesn't allow directly setting wallpapers, so we just save to gallery
      await MediaLibrary.saveToLibraryAsync(uri);
      logger.info('Successfully saved to gallery on iOS');
      // No need to share when explicitly setting as wallpaper
      return true;
    }
  } catch (error) {
    logger.error('Error setting wallpaper:', error);
    throw error;
  }
};