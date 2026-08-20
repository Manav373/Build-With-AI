import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = 'Loading...', fullScreen = false }: LoadingSpinnerProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <View style={styles.loaderBox}>
          <Text style={styles.emoji}>🌾</Text>
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 12 }} />
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={colors.accent} />
      {message && <Text style={[styles.inlineText, { color: colors.textMuted }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBox: {
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 48,
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  inlineText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
