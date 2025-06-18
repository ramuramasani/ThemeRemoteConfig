/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ThemedButton } from './src/components/ThemedButton';

function AppContent() {
  const { theme, isLoading, error, refreshTheme } = useTheme();
  const isDarkMode = useColorScheme() === 'dark';

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading theme...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Error: {error}</Text>
        <ThemedButton title="Retry" onPress={refreshTheme} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Dynamic Theme Demo
      </Text>
      <View style={styles.buttonContainer}>
        <ThemedButton
          title="Refresh Theme"
          onPress={refreshTheme}
          variant="primary"
        />
        <ThemedButton
          title="Secondary Action"
          onPress={() => {}}
          variant="secondary"
          style={styles.secondaryButton}
        />
      </View>
    </View>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '80%',
  },
  secondaryButton: {
    marginTop: 16,
  },
});

export default App;
