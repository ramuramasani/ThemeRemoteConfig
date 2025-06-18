import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const buttonStyle = {
    backgroundColor: variant === 'primary' ? theme.colors.primary : theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const textStyleObj = {
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.medium,
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[textStyleObj, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}; 