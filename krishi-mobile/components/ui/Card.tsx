import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'default' | 'elevated' | 'accent';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const variantStyles: Record<string, any> = {
    default: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    elevated: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.borderStrong,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: scheme === 'dark' ? 0.3 : 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: `0px 4px 12px ${scheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
        },
      }),
    },
    accent: {
      backgroundColor: scheme === 'dark' ? 'rgba(22, 101, 52, 0.2)' : 'rgba(16, 185, 129, 0.06)',
      borderColor: scheme === 'dark' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(16, 185, 129, 0.15)',
    },
  };

  return (
    <View style={[styles.card, variantStyles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});
