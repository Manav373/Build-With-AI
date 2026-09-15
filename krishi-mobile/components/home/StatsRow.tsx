import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/Screen';
import { Colors } from '@/constants/Colors';
import { useColorScheme, useType } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    todaysSnapshot: 'Today\'s Snapshot',
    wheatMsp: 'Wheat MSP',
    cottonPrice: 'Cotton Price',
    ndviIndex: 'NDVI Index',
    healthy: 'Healthy',
  },
  hi: {
    todaysSnapshot: 'आज का स्नैपशॉट',
    wheatMsp: 'गेहूं एमएसपी',
    cottonPrice: 'कपास की कीमत',
    ndviIndex: 'एनडीवीआई सूचकांक',
    healthy: 'स्वस्थ',
  },
  gu: {
    todaysSnapshot: 'આજનો સ્નેપશૉટ',
    wheatMsp: 'ઘઉં MSP',
    cottonPrice: 'કપાસ ભાવ',
    ndviIndex: 'NDVI સૂચકાંક',
    healthy: 'સ્વસ્થ',
  },
  mr: {
    todaysSnapshot: 'आजचे स्नेपशॉट',
    wheatMsp: 'गहू एमएसपी',
    cottonPrice: 'कापूस किंमत',
    ndviIndex: 'NDVI निर्देशांक',
    healthy: 'निरोगी',
  },
};

const STATS_BASE = [
  { label: 'wheatMsp', value: '₹2,275', icon: 'trending-up' as const, color: '#10b981', change: '+₹125', emoji: '📈' },
  { label: 'cottonPrice', value: '₹7,121', icon: 'bar-chart-2' as const, color: '#f59e0b', change: '-₹89', emoji: '📊' },
  { label: 'ndviIndex', value: '0.72', icon: 'activity' as const, color: '#8b5cf6', change: 'healthy', emoji: '✨' },
];

export function StatsRow() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const t = useType();
  const s = useScreenStrings(STRINGS as any);

  const STATS = STATS_BASE.map((stat) => ({
    ...stat,
    displayLabel: s[stat.label as keyof typeof s],
    displayChange: stat.change === 'healthy' ? s.healthy : stat.change,
  }));

  return (
    <View style={styles.container}>
      <Text style={[t.titleSmall, { color: colors.text, fontWeight: '700' }]}>{s.todaysSnapshot}</Text>
      <View style={styles.row}>
        {STATS.map((stat) => (
          <GlassCard
            key={stat.label}
            liquid
            padding={12}
            style={styles.statCard}
          >
            <View style={[styles.iconDot, { backgroundColor: `${stat.color}18` }]}>
              <Feather name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={[styles.value, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.label, { color: colors.textMuted }]}>{stat.displayLabel}</Text>
            <Text style={[styles.change, {
              color: stat.displayChange.startsWith('-') ? '#ef4444' : '#10b981',
            }]}>
              {stat.displayChange}
            </Text>
          </GlassCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    justifyContent: 'flex-start',
    minHeight: 140,
    borderRadius: 18,
    overflow: 'hidden',
  },
  iconDot: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 17, fontWeight: '800', lineHeight: 20, textAlign: 'center' },
  label: { fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 12 },
  change: { fontSize: 10, fontWeight: '700' },
});
