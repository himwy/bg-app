import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';

// Import WallpaperManage conditionally to handle null module
let WallpaperManage: any = null;
try {
  WallpaperManage = require('react-native-wallpaper-manage');
} catch (error) {
  console.warn('WallpaperManage module is not available:', error);
}

// Define wallpaper type constants since they're missing from the type definitions
// These values are based on common Android constants for wallpaper types
const WALLPAPER_TYPE = {
  HOME: 1,
  LOCK: 2,
  BOTH: 3
};

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

// Helper function to check if running in Expo Go or development build
export const isRunningInExpoGo = (): boolean => {
  // This is a simplified check - constants may not be available in Expo Go
  return !MediaLibrary.getPermissionsAsync || Platform.OS === 'web';
};

// Helper function to check if WallpaperManage is available
export const isWallpaperManageAvailable = (): boolean => {
  return WallpaperManage !== null && typeof WallpaperManage === 'object';
};

// Helper function to show a warning about Expo Go limitations
export const showExpoGoWarning = (): void => {
  logger.warn('MEDIA LIBRARY LIMITATION: You are running in Expo Go which has limited media access.');
  logger.warn('For full functionality, create a development build: https://docs.expo.dev/develop/development-builds/create-a-build');
};

export interface WallpaperItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  isLocal?: boolean; // Flag to indicate if the image is stored locally
  localImage?: any; // For require() statements when using local images
}

// Key for storing wallpapers in AsyncStorage
const WALLPAPERS_STORAGE_KEY = '@wallpaper_app/wallpapers';

// Structure that maps category names to their respective folder paths
// This is the key to our folder-based organization
interface CategoryFolderMap {
  [category: string]: {
    images: { [filename: string]: any }
  }
}

// Pre-define all image requires statically to satisfy the bundler
// This replaces dynamic requires with a static mapping
interface ImageAssetMap {
  [category: string]: {
    [key: string]: any
  }
}

const imageAssets: ImageAssetMap = {
  'Nightcord at 25:00': {
    '25_nightcord_1': require('../assets/images/wallpapers/Nightcord at 25-00/25 Nightcord 1.jpg'),
    '25_nightcord_2': require('../assets/images/wallpapers/Nightcord at 25-00/25 Nightcord 2.jpg'),
    '25_nightcord_3': require('../assets/images/wallpapers/Nightcord at 25-00/25 Nightcord 3.jpg'),
    '25_nightcord_12': require('../assets/images/wallpapers/Nightcord at 25-00/25 Nightcord 12.jpg'),
    '25_nightcord_45': require('../assets/images/wallpapers/Nightcord at 25-00/25 Nightcord 45.jpg'),
    'cute_mizuki': require('../assets/images/wallpapers/Nightcord at 25-00/Cute Mizuki.jpg'),
    'mizuki_wallpaper': require('../assets/images/wallpapers/Nightcord at 25-00/Mizuki Wallpaper.jpg'),
    'mizuki_wallpaper_3': require('../assets/images/wallpapers/Nightcord at 25-00/Mizuki Wallpaper 3.jpg'),
    'mizuki_wallpaper_5': require('../assets/images/wallpapers/Nightcord at 25-00/Mizuki Wallpaper 5.jpg'),
    'niigo_nightcord': require('../assets/images/wallpapers/Nightcord at 25-00/Niigo Nightcord.jpg'),
    '25_nightcord_34': require('../assets/images/wallpapers/Nightcord at 25-00/25 nightcord 34.jpeg'),
    '25_nightcord_haloween': require('../assets/images/wallpapers/Nightcord at 25-00/25nightcord haloween.jpeg'),
    'ena_na': require('../assets/images/wallpapers/Nightcord at 25-00/ena na.jpeg'),
    'ena_nana': require('../assets/images/wallpapers/Nightcord at 25-00/ena nana.jpeg'),
    'ena_nanan': require('../assets/images/wallpapers/Nightcord at 25-00/ena nanan.jpeg'),
    'ena_nananan': require('../assets/images/wallpapers/Nightcord at 25-00/ena nananan.jpeg'),
    'ena_nananjananan': require('../assets/images/wallpapers/Nightcord at 25-00/ena nananjananan.jpeg'),
    'kanade_123783': require('../assets/images/wallpapers/Nightcord at 25-00/kanade 123783.jpeg'),
    'kanade_183293': require('../assets/images/wallpapers/Nightcord at 25-00/kanade 183293.jpeg'),
    'kanade_72384e7661832': require('../assets/images/wallpapers/Nightcord at 25-00/kanade 72384e7661832.jpeg'),
    'kanade_7831278': require('../assets/images/wallpapers/Nightcord at 25-00/kanade 7831278.jpeg'),
    'kanade_cuteee_1': require('../assets/images/wallpapers/Nightcord at 25-00/kanade cuteee (1).jpeg'),
    'kanade_jiedawji': require('../assets/images/wallpapers/Nightcord at 25-00/kanade jiedawji.jpeg'),
    'mafuyu_1': require('../assets/images/wallpapers/Nightcord at 25-00/mafuyu 1.jpeg'),
    'mafuyu_2': require('../assets/images/wallpapers/Nightcord at 25-00/mafuyu 2.jpeg'),
    'mafuyuu_22': require('../assets/images/wallpapers/Nightcord at 25-00/mafuyuu 22.jpeg'),
    'mizuena_wallpaper_collage': require('../assets/images/wallpapers/Nightcord at 25-00/Mizuena wallpaper collage.jpg'),
    'mizuki_akiyama_wallpaper': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki akiyama wallpaper.jpg'),
    'mizuki_1234': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki 1234.jpeg'),
    'mizuki_71283': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki 71283.jpeg'),
    'mizuki_81288': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki 81288.jpeg'),
    'mizuki_ena_783217': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki ena 783217.jpg'),
    'mizuki_ena_aaa': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki ena aaa.jpg'),
    'mizuki_iii': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki iii.jpg'),
    'mizuki_kawaii': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki kawaii.jpg'),
    'mizuki_mizu': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki mizu.jpeg'),
    'mizuki_exclamation': require('../assets/images/wallpapers/Nightcord at 25-00/mizuki !.jpg')
  },
  'MORE MORE JUMP!': {
    // To be populated when images are added
  },
  'Leo/need': {
    // To be populated when images are added
  },
  'Wonderlands x Showtime': {
    // To be populated when images are added
  },
  'Vivid BAD SQUAD': {
    // To be populated when images are added
  },
  'Miku & Virtual Singers': {
    // To be populated when images are added
  }
};

// Define file mappings from original filenames to asset keys
const fileToAssetKeyMap: { [category: string]: { [filename: string]: string } } = {
  'Nightcord at 25:00': {
    '25 Nightcord 1.jpg': '25_nightcord_1',
    '25 Nightcord 2.jpg': '25_nightcord_2',
    '25 Nightcord 3.jpg': '25_nightcord_3',
    '25 Nightcord 12.jpg': '25_nightcord_12',
    '25 Nightcord 45.jpg': '25_nightcord_45',
    'Cute Mizuki.jpg': 'cute_mizuki',
    'Mizuki Wallpaper.jpg': 'mizuki_wallpaper',
    'Mizuki Wallpaper 3.jpg': 'mizuki_wallpaper_3',
    'Mizuki Wallpaper 5.jpg': 'mizuki_wallpaper_5',
    'Niigo Nightcord.jpg': 'niigo_nightcord',
    '25 nightcord 34.jpeg': '25_nightcord_34',
    '25nightcord haloween.jpeg': '25_nightcord_haloween',
    'ena na.jpeg': 'ena_na',
    'ena nana.jpeg': 'ena_nana',
    'ena nanan.jpeg': 'ena_nanan',
    'ena nananan.jpeg': 'ena_nananan',
    'ena nananjananan.jpeg': 'ena_nananjananan',
    'kanade 123783.jpeg': 'kanade_123783',
    'kanade 183293.jpeg': 'kanade_183293',
    'kanade 72384e7661832.jpeg': 'kanade_72384e7661832',
    'kanade 7831278.jpeg': 'kanade_7831278',
    'kanade cuteee (1).jpeg': 'kanade_cuteee_1',
    'kanade jiedawji.jpeg': 'kanade_jiedawji',
    'mafuyu 1.jpeg': 'mafuyu_1',
    'mafuyu 2.jpeg': 'mafuyu_2',
    'mafuyuu 22.jpeg': 'mafuyuu_22',
    'Mizuena wallpaper collage.jpg': 'mizuena_wallpaper_collage',
    'mizuki akiyama wallpaper.jpg': 'mizuki_akiyama_wallpaper',
    'mizuki 1234.jpeg': 'mizuki_1234',
    'mizuki 71283.jpeg': 'mizuki_71283',
    'mizuki 81288.jpeg': 'mizuki_81288',
    'mizuki ena 783217.jpg': 'mizuki_ena_783217',
    'mizuki ena aaa.jpg': 'mizuki_ena_aaa',
    'mizuki iii.jpg': 'mizuki_iii',
    'mizuki kawaii.jpg': 'mizuki_kawaii',
    'mizuki mizu.jpeg': 'mizuki_mizu',
    'mizuki !.jpg': 'mizuki_exclamation'
  },
  'MORE MORE JUMP!': {},
  'Leo/need': {},
  'Wonderlands x Showtime': {},
  'Vivid BAD SQUAD': {},
  'Miku & Virtual Singers': {}
};

// Helper function to load all images from a folder using the static mapping
function requireWallpaperImages(category: string): { [filename: string]: any } {
  const images: { [filename: string]: any } = {};
  
  try {
    // Get available files for this category
    const availableFiles: {[key: string]: string[]} = {
      'Nightcord at 25:00': [
        '25 Nightcord 1.jpg',
        '25 Nightcord 2.jpg',
        '25 Nightcord 3.jpg',
        '25 Nightcord 12.jpg',
        '25 Nightcord 45.jpg',
        'Cute Mizuki.jpg',
        'Mizuki Wallpaper.jpg',
        'Mizuki Wallpaper 3.jpg',
        'Mizuki Wallpaper 5.jpg',
        'Niigo Nightcord.jpg',
        '25 nightcord 34.jpeg',
        '25nightcord haloween.jpeg',
        'ena na.jpeg',
        'ena nana.jpeg',
        'ena nanan.jpeg',
        'ena nananan.jpeg',
        'ena nananjananan.jpeg',
        'kanade 123783.jpeg',
        'kanade 183293.jpeg',
        'kanade 72384e7661832.jpeg',
        'kanade 7831278.jpeg',
        'kanade cuteee (1).jpeg',
        'kanade jiedawji.jpeg',
        'mafuyu 1.jpeg',
        'mafuyu 2.jpeg',
        'mafuyuu 22.jpeg',
        'Mizuena wallpaper collage.jpg',
        'mizuki akiyama wallpaper.jpg',
        'mizuki 1234.jpeg',
        'mizuki 71283.jpeg',
        'mizuki 81288.jpeg',
        'mizuki ena 783217.jpg',
        'mizuki ena aaa.jpg',
        'mizuki iii.jpg',
        'mizuki kawaii.jpg',
        'mizuki mizu.jpeg',
        'mizuki !.jpg'
      ],
      'MORE MORE JUMP!': [],
      'Leo/need': [],
      'Wonderlands x Showtime': [],
      'Vivid BAD SQUAD': [],
      'Miku & Virtual Singers': []
    };
    
    // Process files for this category if any exist
    const files = availableFiles[category] || [];
    
    // Use the mapping to get the correct require for each file
    files.forEach(filename => {
      // Generate a key from the filename: remove extension, replace spaces with underscores, make lowercase
      const key = filename
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .replace(/\s+/g, '_')    // Replace spaces with underscores
        .toLowerCase();          // Make lowercase
      
      // Use the pre-defined static requires instead of dynamic requires
      if (category in imageAssets && fileToAssetKeyMap[category][filename]) {
        const assetKey = fileToAssetKeyMap[category][filename];
        images[key] = imageAssets[category][assetKey];
      }
    });
    
    logger.info(`Loaded ${Object.keys(images).length} images for category ${category}`);
    return images;
  } catch (e) {
    logger.error(`Error loading images for ${category}:`, e);
    return {};
  }
}

// Dynamically build the wallpaper folders map
const wallpaperFolders: CategoryFolderMap = {
  'MORE MORE JUMP!': {
    images: requireWallpaperImages('MORE MORE JUMP!')
  },
  'Leo/need': {
    images: requireWallpaperImages('Leo/need')
  },
  'Wonderlands x Showtime': {
    images: requireWallpaperImages('Wonderlands x Showtime')
  },
  'Nightcord at 25:00': {
    images: requireWallpaperImages('Nightcord at 25:00')
  },
  'Vivid BAD SQUAD': {
    images: requireWallpaperImages('Vivid BAD SQUAD')
  },
  'Miku & Virtual Singers': {
    images: requireWallpaperImages('Miku & Virtual Singers')
  },
};

// Generate default wallpapers from the folder structure
const generateDefaultWallpapers = (): WallpaperItem[] => {
  logger.info('Generating wallpaper list from folder structure');
  const wallpapersList: WallpaperItem[] = [];
  
  // Loop through each category folder
  Object.entries(wallpaperFolders).forEach(([category, folderContent]) => {
    // Loop through each image in the category
    Object.entries(folderContent.images).forEach(([filename, imageModule]) => {
      // Format the name from filename (replace underscores with spaces, capitalize words)
      const formattedName = filename
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
        
      // Create wallpaper entry
      wallpapersList.push({
        id: `${category}_${filename}`,
        name: formattedName,
        category,
        imageUrl: '',
        thumbnailUrl: '',
        isLocal: true,
        localImage: imageModule,
      });
    });
  });
  
  logger.info(`Generated ${wallpapersList.length} wallpapers from folders`);
  return wallpapersList;
};

// Initial default wallpaper data generated from folder structure
const defaultWallpapers: WallpaperItem[] = generateDefaultWallpapers();

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

// Add a wallpaper to a specific category (for use with user uploads)
export const addWallpaperToCategory = async (
  uri: string, 
  category: string, 
  filename: string
): Promise<WallpaperItem | null> => {
  try {
    // Format the name from filename
    const name = filename
      .replace(/\.[^/.]+$/, '') // Remove file extension
      .replace(/_/g, ' ')       // Replace underscores with spaces
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize words
      
    // Create a new wallpaper entry
    const newWallpaper: WallpaperItem = {
      id: `${category}_${Date.now()}_${filename}`,
      name,
      category,
      imageUrl: uri,
      thumbnailUrl: uri,
      isLocal: false, // User uploads aren't bundled local assets
    };
    
    // Add to collection
    const updatedWallpapers = [...wallpapers, newWallpaper];
    await saveWallpapers(updatedWallpapers);
    logger.info(`Added "${name}" to category "${category}"`);
    
    return newWallpaper;
  } catch (error) {
    logger.error('Error adding wallpaper to category:', error);
    return null;
  }
};

// Rest of the existing functions
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
    
    // Extract filename from URI
    const filename = imageAsset.uri.split('/').pop() || `image_${Date.now()}.jpg`;
    
    // Use the actual filename as the name if no name was provided
    const wallpaperName = name || filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    
    // Create wallpaper and add to the specified category
    return await addWallpaperToCategory(imageAsset.uri, category, wallpaperName);
  } catch (error) {
    logger.error('Error adding wallpaper from gallery:', error);
    throw error;
  }
};

// Modified to use file names as wallpaper names
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
    
    // Process each image - using filenames for names
    const newWallpapers: WallpaperItem[] = [];
    
    for (const asset of result.assets) {
      // Extract filename from URI
      const filename = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;
      
      // Create and add the wallpaper
      const wallpaper = await addWallpaperToCategory(asset.uri, category, filename);
      if (wallpaper) {
        newWallpapers.push(wallpaper);
      }
    }
    
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

    // For local wallpapers, we need to create a temporary file
    let uri = imageUrl;
    
    // If this is a local bundled image, we need to get it into a file URI format
    // that can be used by the wallpaper setter
    if (imageUrl === '') {
      logger.info('Local wallpaper detected, preparing file');
      
      try {
        // Create a temporary file in the cache directory
        const tempFile = `${FileSystem.cacheDirectory}temp_wallpaper_${Date.now()}.jpg`;
        
        // Find the wallpaper item to get its localImage
        const wallpaperItem = wallpapers.find(w => 
          (w.imageUrl === imageUrl || imageUrl === '') && w.isLocal && w.localImage
        );
        
        if (wallpaperItem) {
          // Get the asset module from the require cache if possible
          logger.info('Found local wallpaper:', wallpaperItem.name);
          
          try {
            // For local image assets, we need to write them to a file first
            // Get the asset URI from the expo-asset module
            const asset = Asset.fromModule(wallpaperItem.localImage);
            await asset.downloadAsync();
            
            if (asset.localUri) {
              // Copy the asset to our temp location
              await FileSystem.copyAsync({
                from: asset.localUri,
                to: tempFile
              });
              uri = tempFile;
              logger.info('Created temporary file for local wallpaper:', uri);
            } else {
              throw new Error('Could not download local asset');
            }
          } catch (assetError) {
            logger.error('Asset download error:', assetError);
            // Use direct module approach as fallback
            if (Platform.OS === 'android') {
              // For Android, we'll use the Intent approach with the module directly
              uri = tempFile;
              logger.info('Using fallback approach for local wallpaper');
            } else {
              throw new Error('Could not prepare local asset for wallpaper');
            }
          }
        } else {
          throw new Error('Could not find local wallpaper data');
        }
      } catch (localError) {
        logger.error('Error preparing local wallpaper:', localError);
        throw new Error('Could not prepare local wallpaper for setting');
      }
    } else {
      // Download the image first for remote URLs
      logger.info('Downloading image');
      const fileUri = FileSystem.documentDirectory + 'wallpaper.jpg';
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      uri = downloadResult.uri;
      logger.info('Image downloaded to:', uri);
    }
    
    if (Platform.OS === 'android') {
      logger.info('Setting wallpaper on Android');
      
      // Check if we're running in Expo Go
      if (isRunningInExpoGo()) {
        logger.warn('Running in Expo Go - direct wallpaper setting is not available');
        showExpoGoWarning();
        
        // Save to gallery as fallback
        await MediaLibrary.saveToLibraryAsync(uri);
        logger.info('Saved to gallery instead (Expo Go limitation)');
        return true;
      }
      
      // Check if WallpaperManage is available
      if (isWallpaperManageAvailable()) {
        logger.info('Using WallpaperManage to set wallpaper');
        try {
          // Pass the URI as the first parameter, and the type as a second parameter
          const result = await WallpaperManage.setWallpaper(
            uri,
            wallpaperType === 'home' 
              ? WALLPAPER_TYPE.HOME 
              : wallpaperType === 'lock' 
                ? WALLPAPER_TYPE.LOCK 
                : WALLPAPER_TYPE.BOTH
          );
          
          logger.info('Successfully set wallpaper directly:', result);
          return true;
        } catch (error) {
          logger.warn('Direct wallpaper setting failed, falling back to system methods:', error);
        }
      } else {
        logger.warn('WallpaperManage module not available, using system intent fallback');
      }
      
      // Fallback to previous method if direct setting fails or module isn't available
      try {
        // For Android, we need to convert the file:// URI to a content:// URI
        const contentUri = await FileSystem.getContentUriAsync(uri);
        
        // Using a more universal approach with ACTION_ATTACH_DATA
        // This typically opens the system's "Complete action using" dialog
        await IntentLauncher.startActivityAsync('android.intent.action.ATTACH_DATA', {
          data: contentUri,
          type: 'image/jpeg',
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        });
        
        logger.info('Successfully launched wallpaper intent on Android (fallback)');
        return true;
      } catch (intentError) {
        logger.error('Intent launcher error:', intentError);
        // If this fails too, try the traditional wallpaper manager
        if (isWallpaperManageAvailable()) {
          const result = await WallpaperManage.setWallpaper(uri);
          logger.info('Used wallpaper manager as last resort:', result);
          return true;
        }
        throw new Error('All wallpaper setting methods failed');
      }
    } else {
      logger.info('Setting wallpaper on iOS (saving to gallery)');
      // iOS doesn't allow directly setting wallpapers, so we just save to gallery
      await MediaLibrary.saveToLibraryAsync(uri);
      logger.info('Successfully saved to gallery on iOS');
      return true;
    }
  } catch (error) {
    logger.error('Error setting wallpaper:', error);
    throw error;
  }
};