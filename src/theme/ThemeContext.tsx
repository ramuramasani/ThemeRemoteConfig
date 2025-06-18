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
      console.log('Refreshing theme...');
      setIsLoading(true);
      setError(null);
      const newTheme = await RemoteConfigService.getInstance().fetchTheme();
      console.log('New theme received:', newTheme);
      if (newTheme) {
        setTheme(newTheme);
      } else {
        console.log('No new theme received, using default theme');
        setTheme(DEFAULT_THEME);
      }
    } catch (err) {
      console.error('Error refreshing theme:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch theme');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('ThemeProvider mounted, initializing theme...');
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