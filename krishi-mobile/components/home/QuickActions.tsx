import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme, useType } from '@/hooks/useColorScheme';
import { PressableScale } from '@/components/ui/Motion';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    quickTools: 'Quick Tools',
    aiChat: 'AI Chat',
    scanCrop: 'Scan Crop',
    prices: 'Prices',
    weather: 'Weather',
    predict: 'Predict',
    schemes: 'Schemes',
  },
  hi: {
    quickTools: 'त्वरित उपकरण',
    aiChat: 'एआई चैट',
    scanCrop: 'फसल स्कैन करें',
    prices: 'कीमतें',
    weather: 'मौसम',
    predict: 'भविष्यवाणी',
    schemes: 'योजनाएं',
  },
  gu: {
    quickTools: 'ઝડપી સાધનો',
    aiChat: 'AI ચેટ',
    scanCrop: 'પાક સ્કેન કરો',
    prices: 'ભાવ',
    weather: 'હવામાન',
    predict: 'આગાહી',
    schemes: 'યોજનાઓ',
  },
  mr: {
    quickTools: 'जलद साधने',
    aiChat: 'AI चॅट',
    scanCrop: 'पिकीचे स्कॅन करा',
    prices: 'किंमती',
    weather: 'हवामान',
    predict: 'अंदाज',
    schemes: 'योजना',
  },
};

const ACTIONS_BASE = [
  { id: 'chat', icon: 'message-circle' as const, labelKey: 'aiChat', route: '/chat', color: '#4ade80' },
  { id: 'scan', icon: 'camera' as const, labelKey: 'scanCrop', route: '/scan', color: '#f59e0b' },
  { id: 'market', icon: 'bar-chart-2' as const, labelKey: 'prices', route: '/market', color: '#3b82f6' },
  { id: 'weather', icon: 'cloud' as const, labelKey: 'weather', route: '/weather', color: '#06b6d4' },
  { id: 'predict', icon: 'trending-up' as const, labelKey: 'predict', route: '/predict', color: '#8b5cf6' },
  { id: 'schemes', icon: 'award' as const, labelKey: 'schemes', route: '/schemes', color: '#ec4899' },
];

export function QuickActions() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const t = useType();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);

  const ACTIONS = ACTIONS_BASE.map((action) => ({
    ...action,
    label: s[action.labelKey as keyof typeof s],
  }));

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push(route as never);
  };

  return (
    <View style={styles.container}>
      <Text style={[t.titleSmall, { color: colors.text, fontWeight: '700' }]}>{s.quickTools}</Text>
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <View key={action.id} style={styles.actionCardWrapper}>
            <PressableScale
              style={[styles.actionCard, {
                backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(20, 83, 45, 0.02)',
                borderColor: colors.border,
              }]}
              onPress={() => handlePress(action.route)}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${action.color}15` }]}>
                <Feather name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={[styles.label, { color: colors.text }]}>{action.label}</Text>
            </PressableScale>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingHorizontal: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  actionCardWrapper: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 2,
  },
  actionCard: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
