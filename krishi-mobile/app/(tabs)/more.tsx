import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { Screen, SectionTitle, GlassCard, ListRow } from '@/components/ui/Screen';

const MENU_SECTIONS = [
  {
    title: 'Intelligence',
    items: [
      { id: 'predict', icon: 'trending-up', label: 'Crop Prediction', desc: 'ML-powered yield estimation', color: '#8b5cf6', route: '/predict' },
      { id: 'weather', icon: 'cloud', label: 'Weather Details', desc: 'Forecasts & agricultural impact', color: '#3b82f6', route: '/weather' },
      { id: 'schemes', icon: 'award', label: 'Government Schemes', desc: 'PM-KISAN, PMFBY & more', color: '#ec4899', route: '/schemes' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { id: 'satellite', icon: 'globe', label: 'Satellite View', desc: 'NDVI crop health monitoring', color: '#06b6d4', route: '/satellite' },
      { id: 'community', icon: 'users', label: 'Community', desc: 'Connect with fellow farmers', color: '#f59e0b', route: '/community' },
      { id: 'voice', icon: 'mic', label: 'Voice Assistant', desc: 'Talk in your language', color: '#10b981', route: '/voice-assistant' },
    ],
  },
  {
    title: 'App',
    items: [
      { id: 'settings', icon: 'settings', label: 'Settings', desc: 'Theme, language & preferences', color: '#64748b', route: '/settings' },
      { id: 'help', icon: 'help-circle', label: 'Help & FAQ', desc: 'How to use KrishiAI', color: '#14b8a6', route: '/settings' },
      { id: 'about', icon: 'info', label: 'About KrishiAI', desc: 'Version 1.0.0', color: '#a855f7', route: '/about' },
    ],
  },
];

export default function MoreScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();
  const go = (r: string) => router.push(r as any);

  return (
    <Screen title="More" emoji="⚙️" subtitle="All features & settings">
      {/* User card */}
      <GlassCard accent onPress={() => go('/profile')}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: colors.green }]}>
            <Text style={{ fontSize: 22 }}>🧑‍🌾</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[t.titleSmall, { color: colors.text }]}>Farmer</Text>
            <Text style={[t.caption, { color: colors.accent, marginTop: 2 }]}>KrishiAI Pro Member</Text>
          </View>
        </View>
      </GlassCard>

      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={{ gap: 8 }}>
          <SectionTitle>{section.title}</SectionTitle>
          <GlassCard padding={4}>
            <View style={{ paddingHorizontal: 14 }}>
              {section.items.map((item, idx) => (
                <ListRow
                  key={item.id}
                  icon={item.icon}
                  iconColor={item.color}
                  label={item.label}
                  subtitle={item.desc}
                  onPress={() => go(item.route)}
                  divider={idx < section.items.length - 1}
                />
              ))}
            </View>
          </GlassCard>
        </View>
      ))}

      <Text style={[t.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 6 }]}>
        KrishiAI Mobile v1.0.0 • Built with ❤️ for Indian Farmers
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
