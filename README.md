# React Native Dynamic Theme System with Firebase Remote Config

This project implements a dynamic theme system for React Native applications using Firebase Remote Config. It allows you to control your app's theme remotely and update it without requiring app updates.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Setup](#setup)
- [Implementation Guide](#implementation-guide)
- [Usage](#usage)
- [Theme Structure](#theme-structure)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Features

- 🔄 Remote theme control through Firebase Remote Config
- 💾 Local caching for offline support
- 🎨 Type-safe theme definitions
- ⚡ Efficient theme updates using React Context
- 🔍 Error handling and loading states
- 🧩 Reusable themed components
- 📱 Support for both light and dark modes

## Architecture

The theme system is built with the following components:

### 1. Theme Types (`src/theme/types.ts`)
```typescript
interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
}
```
Defines the structure of the theme with TypeScript interfaces for type safety.

### 2. Remote Config Service (`src/services/remoteConfig.ts`)
```typescript
class RemoteConfigService {
  async initialize(): Promise<void>
  async fetchTheme(): Promise<Theme>
  private async cacheTheme(theme: Theme): Promise<void>
  private async getCachedTheme(): Promise<Theme>
}
```
Handles all Firebase Remote Config interactions and local caching.

### 3. Theme Context (`src/theme/ThemeContext.tsx`)
```typescript
const ThemeContext = createContext<ThemeContextType>({...})
export const ThemeProvider: React.FC<{ children: React.ReactNode }>
export const useTheme = () => useContext(ThemeContext)
```
Provides theme data and functions to the entire app using React Context.

## Setup

### 1. Install Dependencies
```bash
# Install Firebase and AsyncStorage
npm install @react-native-firebase/app @react-native-firebase/remote-config @react-native-async-storage/async-storage

# For TypeScript projects, also install types
npm install --save-dev @types/react-native
```

### 2. Firebase Configuration

#### A. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name and follow setup wizard

#### B. Add Android App
1. In Firebase Console, click Android icon to add app
2. Enter your app's package name (e.g., `com.yourcompany.yourapp`)
3. Download `google-services.json`
4. Place `google-services.json` in `android/app/`

#### C. Configure Android Project
1. Update `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        // ... other dependencies
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

2. Update `android/app/build.gradle`:
```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'  // Add this line

android {
    defaultConfig {
        // ... other config
        multiDexEnabled true
    }
}

dependencies {
    // ... other dependencies
    implementation platform('com.google.firebase:firebase-bom:32.0.0')
    implementation 'com.google.firebase:firebase-config'
}
```

### 3. Remote Config Setup

#### A. Configure Remote Config Parameter
1. Go to Firebase Console > Remote Config
2. Click "Add your first parameter" or "Add parameter"
3. Set parameter details:
   - Parameter key: `app_theme`
   - Value type: JSON
   - Value: Your theme JSON (see example below)

#### B. Example Theme JSON
```json
{
  "colors": {
    "primary": "#3F51B5",
    "secondary": "#FF4081",
    "background": "#F0F2F5",
    "surface": "#FFFFFF",
    "text": "#1C1C1C",
    "textSecondary": "#757575",
    "error": "#D32F2F",
    "success": "#388E3C",
    "warning": "#FBC02D"
  },
  "typography": {
    "fontFamily": "System",
    "fontSize": {
      "small": 12,
      "medium": 16,
      "large": 20,
      "xlarge": 24
    },
    "fontWeight": {
      "regular": "400",
      "medium": "500",
      "bold": "700"
    }
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24,
    "xl": 32
  }
}
```

## Implementation Guide

### 1. Create Theme Types
Create `src/theme/types.ts`:
```typescript
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  fontWeight: {
    regular: string;
    medium: string;
    bold: string;
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
}

export const DEFAULT_THEME: Theme = {
  // ... (copy from example above)
};
```

### 2. Create Remote Config Service
Create `src/services/remoteConfig.ts`:
```typescript
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
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 0, // Set to 0 for development
        fetchTimeMillis: 0,
      });

      const cachedTheme = await this.getCachedTheme();
      await remoteConfig().setDefaults({
        [THEME_CONFIG_KEY]: JSON.stringify(cachedTheme),
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing remote config:', error);
      throw error;
    }
  }

  async fetchTheme(): Promise<Theme> {
    try {
      await this.initialize();
      await remoteConfig().fetchAndActivate();
      
      const themeString = remoteConfig().getValue(THEME_CONFIG_KEY).asString();
      const theme = JSON.parse(themeString);
      
      await this.cacheTheme(theme);
      return theme;
    } catch (error) {
      console.error('Error fetching theme:', error);
      return this.getCachedTheme();
    }
  }

  private async cacheTheme(theme: Theme): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_CACHE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.error('Error caching theme:', error);
    }
  }

  private async getCachedTheme(): Promise<Theme> {
    try {
      const cachedTheme = await AsyncStorage.getItem(THEME_CACHE_KEY);
      return cachedTheme ? JSON.parse(cachedTheme) : null;
    } catch (error) {
      console.error('Error getting cached theme:', error);
      return null;
    }
  }
}
```

### 3. Create Theme Context
Create `src/theme/ThemeContext.tsx`:
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeContextType, DEFAULT_THEME } from './types';
import { RemoteConfigService } from '../services/remoteConfig';

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  isLoading: true,
  error: null,
  refreshTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTheme = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newTheme = await RemoteConfigService.getInstance().fetchTheme();
      if (newTheme) {
        setTheme(newTheme);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch theme');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isLoading, error, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 4. Wrap Your App
Update your `App.tsx`:
```typescript
import { ThemeProvider } from './src/theme/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
```

## Usage

### 1. Using Theme in Components
```typescript
import { useTheme } from './src/theme/ThemeContext';

function MyComponent() {
  const { theme, isLoading, error, refreshTheme } = useTheme();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Hello, Themed World!
      </Text>
    </View>
  );
}
```

### 2. Creating Themed Components
```typescript
const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor: variant === 'primary' 
          ? theme.colors.primary 
          : theme.colors.secondary,
        padding: theme.spacing.md,
      }}
      onPress={onPress}
    >
      <Text style={{ color: theme.colors.background }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

## Theme Structure

### Colors
- `primary`: Main brand color
- `secondary`: Secondary brand color
- `background`: App background color
- `surface`: Surface color for cards, sheets
- `text`: Primary text color
- `textSecondary`: Secondary text color
- `error`: Error state color
- `success`: Success state color
- `warning`: Warning state color

### Typography
- `fontFamily`: Font family name
- `fontSize`: Object containing size variants
- `fontWeight`: Object containing weight variants

### Spacing
- `xs`: Extra small spacing (4)
- `sm`: Small spacing (8)
- `md`: Medium spacing (16)
- `lg`: Large spacing (24)
- `xl`: Extra large spacing (32)

## Best Practices

1. **Theme Updates**
   - Use the `refreshTheme` function to manually update the theme
   - Handle loading and error states appropriately
   - Cache theme locally for offline support

2. **Component Design**
   - Create reusable themed components
   - Use theme values consistently
   - Support both light and dark modes

3. **Performance**
   - Minimize theme updates
   - Use memoization for expensive computations
   - Cache theme values appropriately

4. **Error Handling**
   - Always provide fallback values
   - Handle network errors gracefully
   - Log errors for debugging

## Troubleshooting

### Common Issues

1. **Theme Not Updating**
   - Check Firebase Remote Config console
   - Verify network connection
   - Check error logs
   - Try manual refresh

2. **Type Errors**
   - Ensure theme structure matches TypeScript interfaces
   - Check for missing required properties
   - Verify JSON format in Remote Config

3. **Performance Issues**
   - Check for unnecessary re-renders
   - Verify caching implementation
   - Monitor network requests

### Debugging

1. Enable debug logging:
```typescript
remoteConfig().setConfigSettings({
  minimumFetchIntervalMillis: 0,
  fetchTimeMillis: 0,
});
```

2. Check cached theme:
```typescript
const cachedTheme = await AsyncStorage.getItem('@theme_cache');
console.log('Cached theme:', cachedTheme);
```

3. Monitor Remote Config updates:
```typescript
remoteConfig().onConfigUpdated(() => {
  console.log('Remote Config updated');
});
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
