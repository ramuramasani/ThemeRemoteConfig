import remoteConfig from '@react-native-firebase/remote-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme/types';

const THEME_CACHE_KEY = '@theme_cache';
const THEME_CONFIG_KEY = 'app_theme';

export class RemoteConfigService {
  private static instance: RemoteConfigService;
  private initialized = false;

  private constructor() {}

  static getInstance(): RemoteConfigService {
    if (!RemoteConfigService.instance) {
      RemoteConfigService.instance = new RemoteConfigService();
    }
    return RemoteConfigService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Enable debug mode for development
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 0, // Set to 0 for development
        fetchTimeMillis: 0,
      });

      const cachedTheme = await this.getCachedTheme();
      console.log('Initializing with cached theme:', cachedTheme);
      
      await remoteConfig().setDefaults({
        [THEME_CONFIG_KEY]: JSON.stringify(cachedTheme),
      });

      this.initialized = true;
      console.log('Remote Config initialized successfully');
    } catch (error) {
      console.error('Error initializing remote config:', error);
      throw error;
    }
  }

  async fetchTheme(): Promise<Theme> {
    try {
      await this.initialize();
      
      console.log('Fetching theme from Remote Config...');
      await remoteConfig().fetchAndActivate();
      
      const themeString = remoteConfig().getValue(THEME_CONFIG_KEY).asString();
      console.log('Received theme from Remote Config:', themeString);
      
      const theme = JSON.parse(themeString);
      console.log('Parsed theme:', theme);
      
      await this.cacheTheme(theme);
      return theme;
    } catch (error) {
      console.error('Error fetching theme:', error);
      const cachedTheme = await this.getCachedTheme();
      console.log('Falling back to cached theme:', cachedTheme);
      return cachedTheme;
    }
  }

  private async cacheTheme(theme: Theme): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_CACHE_KEY, JSON.stringify(theme));
      console.log('Theme cached successfully');
    } catch (error) {
      console.error('Error caching theme:', error);
    }
  }

  private async getCachedTheme(): Promise<Theme> {
    try {
      const cachedTheme = await AsyncStorage.getItem(THEME_CACHE_KEY);
      console.log('Retrieved cached theme:', cachedTheme);
      return cachedTheme ? JSON.parse(cachedTheme) : null;
    } catch (error) {
      console.error('Error getting cached theme:', error);
      return null;
    }
  }
} 