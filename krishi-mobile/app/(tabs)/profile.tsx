import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';
import { useRouter } from 'expo-router';
import { Screen, SectionTitle, GlassCard, ListRow, StatTile, HeaderIconButton } from '@/components/ui/Screen';
import { Counter, AnimatedProgress } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';

const STRINGS = {
  en: {
    screenTitle: 'Profile Hub',
    settings: 'Settings',
    userLocation: '🌾 Rampur, Karnal • Haryana',
    proMember: 'KrishiAI Pro Member',
    masterFarmer: 'Master Farmer',
    xpProgress: '480 / 600 XP',
    activeStreak: 'Active Streak',
    days: ' Days',
    farmerScore: 'Farmer Score',
    xp: ' XP',
    farmProperties: 'Farm Properties',
    editList: 'Edit list',
    plot1: 'Rampur Main Plot A',
    plot1Details: '4.5 Acres (Wheat)',
    plot2: 'Karnal Vegetable Plot B',
    plot2Details: '1.2 Acres (Tomatoes)',
    farmingEcosystem: 'Farming Ecosystem',
    propertyBoundaries: 'My Property Boundaries',
    krishiAcademy: 'Krishi Academy Tutorials',
    farmerCommunity: 'Farmer Community Feed',
    preferences: 'Preferences',
    systemConfig: 'System Configuration Settings',
    resetOnboarding: 'Reset Onboarding Wizard',
    logout: 'Logout',
  },
  hi: {
    screenTitle: 'प्रोफाइल हब',
    settings: 'सेटिंग्स',
    userLocation: '🌾 रामपुर, करनाल • हरियाणा',
    proMember: 'कृषिAI प्रो सदस्य',
    masterFarmer: 'मास्टर किसान',
    xpProgress: '480 / 600 XP',
    activeStreak: 'सक्रिय स्ट्रीक',
    days: ' दिन',
    farmerScore: 'किसान स्कोर',
    xp: ' XP',
    farmProperties: 'फार्म संपत्तियां',
    editList: 'सूची संपादित करें',
    plot1: 'रामपुर मुख्य प्लॉट A',
    plot1Details: '4.5 एकड़ (गेहूं)',
    plot2: 'करनाल सब्जी प्लॉट B',
    plot2Details: '1.2 एकड़ (टमाटर)',
    farmingEcosystem: 'कृषि पारिस्थितिकी तंत्र',
    propertyBoundaries: 'मेरी संपत्ति सीमाएं',
    krishiAcademy: 'कृषि अकादमी ट्यूटोरियल',
    farmerCommunity: 'किसान समुदाय फीड',
    preferences: 'प्राथमिकताएं',
    systemConfig: 'सिस्टम कॉन्फ़िगरेशन सेटिंग्स',
    resetOnboarding: 'ऑनबोर्डिंग विज़ार्ड रीसेट करें',
    logout: 'लॉगआउट',
  },
  gu: {
    screenTitle: 'પ્રોફાઇલ હબ',
    settings: 'સેટિંગ્સ',
    userLocation: '🌾 રામપુર, કરણાલ • હરિયાણા',
    proMember: 'કૃષિAI પ્રો સભ્ય',
    masterFarmer: 'માસ્ટર ખેડૂત',
    xpProgress: '480 / 600 XP',
    activeStreak: 'સક્રિય સ્ટ્રીક',
    days: ' દિવસ',
    farmerScore: 'ખેડૂત સ્કોર',
    xp: ' XP',
    farmProperties: 'ફાર્મ મિલકત',
    editList: 'સૂચી સંપાદિત કરો',
    plot1: 'રામપુર મુખ્ય પ્લૉટ A',
    plot1Details: '4.5 એકર (ઘઉં)',
    plot2: 'કરણાલ શાકભાજી પ્લૉટ B',
    plot2Details: '1.2 એકર (ટમેટા)',
    farmingEcosystem: 'કૃષિ ઇકોસિસ્ટમ',
    propertyBoundaries: 'મારી મિલકત સીમાઓ',
    krishiAcademy: 'કૃષિ એકેડમી ટ્યુટોરિયલ',
    farmerCommunity: 'ખેડૂત સમુદાય ફીડ',
    preferences: 'પસંદગીઓ',
    systemConfig: 'સિસ્ટમ કોન્ફિગરેશન સેટિંગ્સ',
    resetOnboarding: 'ઑનબોર્ડિંગ વિઝાર્ડ રીસેટ કરો',
    logout: 'લૉગઆઉટ',
  },
  mr: {
    screenTitle: 'प्रोफाइल हब',
    settings: 'सेटिंग्ज',
    userLocation: '🌾 रामपुर, करनाल • हरियाणा',
    proMember: 'कृषीAI प्रो सदस्य',
    masterFarmer: 'मास्टर शेतकरी',
    xpProgress: '480 / 600 XP',
    activeStreak: 'सक्रिय स्ट्रीक',
    days: ' दिवस',
    farmerScore: 'शेतकरी स्कोर',
    xp: ' XP',
    farmProperties: 'शेत मालमत्ता',
    editList: 'यादी संपादित करा',
    plot1: 'रामपुर मुख्य प्लॉट A',
    plot1Details: '4.5 एकर (गहू)',
    plot2: 'करनाल भाज्य प्लॉट B',
    plot2Details: '1.2 एकर (टोमॅटो)',
    farmingEcosystem: 'शेती इकोसिस्टम',
    propertyBoundaries: 'माझी मालमत्ता सीमा',
    krishiAcademy: 'कृषि अकादमी ट्यूटोरिअल',
    farmerCommunity: 'शेतकरी समुदाय फीड',
    preferences: 'प्राधान्ये',
    systemConfig: 'सिस्टम कॉन्फिगरेशन सेटिंग्ज',
    resetOnboarding: 'ऑनबोर्डिंग विजार्ड रीसेट करा',
    logout: 'लॉगआउट',
  },
};

export default function ProfileScreen() {
  const colors = useThemeColors();
  const t = useType();
  const scheme = useColorScheme();
  const s = useScreenStrings(STRINGS as any);
  const router = useRouter();
  const go = (r: string) => router.push(r as any);

  return (
    <Screen
      title={s.screenTitle}
      emoji="👤"
      back
      right={<HeaderIconButton icon="settings" label={s.settings} onPress={() => go('/settings')} />}
    >
      {/* User profile card */}
      <GlassCard padding={16}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: colors.green }]}>
            <Feather name="user" size={28} color="#ffffff" />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.usernameText, { color: colors.text }]} numberOfLines={1}>Manav</Text>
            <Text style={[t.caption, { color: colors.textSecondary }]} numberOfLines={1}>{s.userLocation}</Text>
            <View style={[styles.tag, { backgroundColor: colors.accentSoft }]}>
              <MaterialCommunityIcons name="crown-outline" size={12} color={colors.accent} />
              <Text style={[styles.tagText, { color: colors.accent }]}>{s.proMember}</Text>
            </View>
          </View>
        </View>

        {/* XP progress details */}
        <View style={styles.xpWrapper}>
          <View style={styles.xpLabelRow}>
            <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '700', flexShrink: 1 }]} numberOfLines={1}>Level 4 · {s.masterFarmer}</Text>
            <Text style={[t.caption, { color: colors.accent, fontWeight: '800' }]}>{s.xpProgress}</Text>
          </View>
          <AnimatedProgress fraction={480 / 600} color={colors.accent} height={6} />
        </View>
      </GlassCard>

      {/* Fitness-style stats tiles */}
      <View style={styles.statsRow}>
        <StatTile
          icon="zap"
          iconColor="#f97316"
          value={<Counter value={7} suffix={s.days} style={[styles.statValueText, { color: colors.text }] as any} />}
          label={s.activeStreak}
          onPress={() => go('/achievements')}
        />
        <StatTile
          icon="award"
          iconColor={colors.accent}
          value={<Counter value={480} suffix={s.xp} style={[styles.statValueText, { color: colors.text }] as any} />}
          label={s.farmerScore}
          onPress={() => go('/community')}
        />
      </View>

      {/* Farm properties settings table */}
      <SectionTitle action={s.editList} onAction={() => go('/farms')}>{s.farmProperties}</SectionTitle>
      <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level1 }]}>
        <View style={styles.tableRow}>
          <Text style={[t.body, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>{s.plot1}</Text>
          <Text style={[t.bodyStrong, { color: colors.text, flexShrink: 1 }]} numberOfLines={1}>{s.plot1Details}</Text>
        </View>
        <View style={[styles.tableDivider, { backgroundColor: colors.border }]} />
        <View style={styles.tableRow}>
          <Text style={[t.body, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>{s.plot2}</Text>
          <Text style={[t.bodyStrong, { color: colors.text, flexShrink: 1 }]} numberOfLines={1}>{s.plot2Details}</Text>
        </View>
      </View>

      {/* Grouped Ecosystem settings list */}
      <SectionTitle>{s.farmingEcosystem}</SectionTitle>
      <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level1 }]}>
        <View style={{ paddingHorizontal: 12 }}>
          <ListRow icon="home" iconColor={colors.accent} label={s.propertyBoundaries} onPress={() => go('/farms')} divider />
          <ListRow icon="book-open" iconColor="#f59e0b" label={s.krishiAcademy} onPress={() => go('/learning')} divider />
          <ListRow icon="users" iconColor="#3b82f6" label={s.farmerCommunity} onPress={() => go('/community')} />
        </View>
      </View>

      {/* Preferences settings list */}
      <SectionTitle>{s.preferences}</SectionTitle>
      <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level1 }]}>
        <View style={{ paddingHorizontal: 12 }}>
          <ListRow icon="settings" iconColor="#64748b" label={s.systemConfig} onPress={() => go('/settings')} divider />
          <ListRow icon="refresh-cw" label={s.resetOnboarding} danger onPress={() => router.replace('/onboarding' as any)} divider />
          <ListRow icon="log-out" label={s.logout} danger onPress={() => router.replace('/onboarding' as any)} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden' },
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  usernameText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 2, overflow: 'hidden' },
  tagText: { fontSize: 10, fontWeight: '700' },
  xpWrapper: { marginTop: 14, gap: 6 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statValueText: { fontSize: 17, fontWeight: '900', letterSpacing: -0.2 },
  
  // Table style containers
  tableContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableDivider: {
    height: 1,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16
  },
});
