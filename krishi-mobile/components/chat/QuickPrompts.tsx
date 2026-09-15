import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { QUICK_ACTIONS } from '@/constants/Config';

interface QuickPromptsProps {
  onSelect: (query: string) => void;
}

export function QuickPrompts({ onSelect }: QuickPromptsProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(action.query);
          }}
          style={[styles.chip, {
            backgroundColor: scheme === 'dark' ? 'rgba(22, 101, 52, 0.2)' : 'rgba(16, 185, 129, 0.06)',
            borderColor: scheme === 'dark' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(16, 185, 129, 0.12)',
          }]}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{action.emoji}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  emoji: { fontSize: 15 },
  label: { fontSize: 13, fontWeight: '600' },
});
