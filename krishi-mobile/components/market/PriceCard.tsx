import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface PriceCardProps {
  commodity: string;
  price: string;
  unit?: string;
  change?: string;
  market?: string;
  state?: string;
  onPress?: () => void;
}

export function PriceCard({
  commodity,
  price,
  unit = '/quintal',
  change,
  market,
  state,
  onPress,
}: PriceCardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const isPositive = change && !change.startsWith('-');
  const changeColor = change
    ? (change.startsWith('-') ? colors.danger : colors.success)
    : colors.textMuted;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.commodityInfo}>
            <Text style={[styles.commodity, { color: colors.text }]}>{commodity}</Text>
            {market && (
              <View style={styles.marketRow}>
                <Feather name="map-pin" size={10} color={colors.textMuted} />
                <Text style={[styles.market, { color: colors.textMuted }]}>
                  {market}{state ? `, ${state}` : ''}
                </Text>
              </View>
            )}
          </View>
          {change && (
            <Badge
              label={`${isPositive ? '↑' : '↓'} ${change}`}
              color={changeColor}
            />
          )}
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.accent }]}>{price}</Text>
          <Text style={[styles.unit, { color: colors.textMuted }]}>{unit}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, marginBottom: 8 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commodityInfo: { gap: 4, flex: 1 },
  commodity: { fontSize: 15, fontWeight: '700' },
  marketRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  market: { fontSize: 11, fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 22, fontWeight: '800' },
  unit: { fontSize: 12, fontWeight: '500' },
});
