import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Screen, SectionTitle, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, Counter, AnimatedBar, ProgressRing, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    title: 'My Crops',
    subtitle: 'Farm Overview & Health',
    insightsLabel: 'Insights',
    location: 'Karnal, Haryana',
    sizeAcres: '4.5 Acres',
    kharifSeason: 'Kharif Season',
    weeklyFarmGrowth: 'Weekly Farm Growth',
    ndviHealthIndex: 'NDVI Health Index',
    trends: 'Trends',
    healthIncreasing: 'Health increasing',
    updatedTime: 'Updated 2h ago',
    cultivatedCrops: 'Cultivated Crops',
    wheat: 'Wheat',
    wheatArea: '2.5 Acres',
    wheatHealth: 'Excellent',
    wheatStatus: 'Vegetative Stage',
    cotton: 'Cotton',
    cottonArea: '1.2 Acres',
    cottonHealth: 'Good',
    cottonStatus: 'Flowering Stage',
    groundnut: 'Groundnut',
    groundnutArea: '0.8 Acres',
    groundnutHealth: 'Healthy',
    groundnutStatus: 'Pod Development',
    satelliteSoilInsights: 'Satellite Soil Insights',
    satelliteUpdated: 'Updated 2 hours ago',
    satelliteDesc: 'High resolution NDVI imaging shows healthy chlorophyll concentration across 85% of your wheat plots. Crop watering can be reduced for the next 2 days.',
    viewSatelliteMaps: 'View Satellite Maps',
  },
  hi: {
    title: 'मेरी फसलें',
    subtitle: 'फार्म अवलोकन और स्वास्थ्य',
    insightsLabel: 'अंतर्दृष्टि',
    location: 'करनाल, हरियाणा',
    sizeAcres: '4.5 एकड़',
    kharifSeason: 'खरीफ मौसम',
    weeklyFarmGrowth: 'साप्ताहिक फार्म वृद्धि',
    ndviHealthIndex: 'एनडीवीआई स्वास्थ्य सूचकांक',
    trends: 'ट्रेंड',
    healthIncreasing: 'स्वास्थ्य बढ़ रहा है',
    updatedTime: '2 घंटे पहले अपडेट',
    cultivatedCrops: 'उगाई गई फसलें',
    wheat: 'गेहूं',
    wheatArea: '2.5 एकड़',
    wheatHealth: 'उत्कृष्ट',
    wheatStatus: 'वनस्पति चरण',
    cotton: 'कपास',
    cottonArea: '1.2 एकड़',
    cottonHealth: 'अच्छा',
    cottonStatus: 'पुष्पन चरण',
    groundnut: 'मूंगफली',
    groundnutArea: '0.8 एकड़',
    groundnutHealth: 'स्वस्थ',
    groundnutStatus: 'फली विकास',
    satelliteSoilInsights: 'सैटेलाइट मिट्टी अंतर्दृष्टि',
    satelliteUpdated: '2 घंटे पहले अपडेट',
    satelliteDesc: 'उच्च रिज़ॉल्यूशन एनडीवीआई इमेजिंग आपकी गेहूं की 85% भूखंडों में स्वस्थ क्लोरोफिल सांद्रता दिखाती है। फसल की सिंचाई अगले 2 दिनों के लिए कम की जा सकती है।',
    viewSatelliteMaps: 'सैटेलाइट मानचित्र देखें',
  },
  gu: {
    title: 'મારી ફસલો',
    subtitle: 'ખેતર અવલોકન અને આરોગ્ય',
    insightsLabel: 'અંતર્દૃષ્ટિ',
    location: 'કરનાલ, હરિયાણા',
    sizeAcres: '4.5 એકર',
    kharifSeason: 'ખરીફ સીઝન',
    weeklyFarmGrowth: 'સાપ્તાહિક ખેતર વૃદ્ધિ',
    ndviHealthIndex: 'NDVI આરોગ્ય સૂચકાંક',
    trends: 'ટ્રેન્ડ્સ',
    healthIncreasing: 'આરોગ્ય વધી રહ્યું છે',
    updatedTime: '2 કલાક પહેલા અપડેટ',
    cultivatedCrops: 'ઉગાવેલી ફસલો',
    wheat: 'ઘઉં',
    wheatArea: '2.5 એકર',
    wheatHealth: 'શ્રેષ્ઠ',
    wheatStatus: 'વનસ્પતિ તબક્કો',
    cotton: 'કપાસ',
    cottonArea: '1.2 એકર',
    cottonHealth: 'સારું',
    cottonStatus: 'પુષ્પન તબક્કો',
    groundnut: 'મગફળી',
    groundnutArea: '0.8 એકર',
    groundnutHealth: 'સ્વસ્થ',
    groundnutStatus: 'શરીરના વિકાસ',
    satelliteSoilInsights: 'સેટેલાઇટ જમીન અંતર્દૃષ્ટિ',
    satelliteUpdated: '2 કલાક પહેલા અપડેટ',
    satelliteDesc: 'ઉચ્ચ રિઝોલ્યુશન NDVI ઇમેજિંગ તમારા ઘઉંની 85% ભૂખંડોમાં સ્વસ્થ ક્લોરોફિલ સાંદ્રતા દર્શાવે છે. આગામી 2 દિવસ માટે ફસલ જલવાયુ ઓછી કરી શકાય છે.',
    viewSatelliteMaps: 'સેટેલાઇટ મેપ્સ જુઓ',
  },
  mr: {
    title: 'माझ्या पिक्या',
    subtitle: 'शेत अवलोकन आणि आरोग्य',
    insightsLabel: 'अंतर्दृष्टी',
    location: 'करनाल, हरियाणा',
    sizeAcres: '4.5 एकर',
    kharifSeason: 'खरीफ हंगाम',
    weeklyFarmGrowth: 'साप्ताहिक शेत वाढ',
    ndviHealthIndex: 'NDVI आरोग्य निर्देशांक',
    trends: 'ट्रेंड',
    healthIncreasing: 'आरोग्य वाढत आहे',
    updatedTime: '2 तास पूर्वी अपडेट',
    cultivatedCrops: 'लागवड केलेल्या पिक्या',
    wheat: 'गहू',
    wheatArea: '2.5 एकर',
    wheatHealth: 'उत्कृष्ट',
    wheatStatus: 'वनस्पती टप्पा',
    cotton: 'कापूस',
    cottonArea: '1.2 एकर',
    cottonHealth: 'चांगले',
    cottonStatus: 'पुष्पन टप्पा',
    groundnut: 'मूंगफळी',
    groundnutArea: '0.8 एकर',
    groundnutHealth: 'निरोगी',
    groundnutStatus: 'फळ विकास',
    satelliteSoilInsights: 'उपग्रह मातीची अंतर्दृष्टी',
    satelliteUpdated: '2 तास पूर्वी अपडेट',
    satelliteDesc: 'उच्च रिজोल्यूशन NDVI इमेजिंग तुमच्या गहूच्या 85% भूखंडांमध्ये निरोगी क्लोरोफिल एकाग्रता दर्शविते. पुढील 2 दिवसांसाठी पिकांची सिंचाई कमी केली जाऊ शकते.',
    viewSatelliteMaps: 'उपग्रह नकाशे पहा',
  },
};

const CROPS_BASE = [
  { name: 'wheat', area: 'wheatArea', health: 'wheatHealth', pct: 94, status: 'wheatStatus', icon: '🌾', bgColor: '#fef08a', iconColor: '#854d0e' },
  { name: 'cotton', area: 'cottonArea', health: 'cottonHealth', pct: 88, status: 'cottonStatus', icon: '☁️', bgColor: '#faf5ff', iconColor: '#6b21a8' },
  { name: 'groundnut', area: 'groundnutArea', health: 'groundnutHealth', pct: 91, status: 'groundnutStatus', icon: '🥜', bgColor: '#fef3c7', iconColor: '#9a3412' },
];

export default function CropsScreen() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);
  const go = (r: string) => router.push(r as any);

  const farmStats = {
    location: s.location,
    size: s.sizeAcres,
    season: s.kharifSeason,
    healthScore: 92,
    crops: CROPS_BASE.map((crop) => ({
      ...crop,
      name: s[crop.name as keyof typeof s],
      area: s[crop.area as keyof typeof s],
      health: s[crop.health as keyof typeof s],
      status: s[crop.status as keyof typeof s],
    })),
    growthHistory: [
      { week: 'W1', value: 45 },
      { week: 'W2', value: 60 },
      { week: 'W3', value: 72 },
      { week: 'W4', value: 85 },
      { week: 'W5', value: 92 },
    ],
  };

  return (
    <Screen
      title={s.title}
      emoji="🌾"
      subtitle={s.subtitle}
      back
      right={<HeaderIconButton icon="trending-up" label={s.insightsLabel} onPress={() => go('/insights')} />}
    >
      {/* Farm location hero */}
      <FadeInUp index={0} distance={16}>
        <LinearGradient
          colors={scheme === 'dark' ? ['#0a180e', '#040906'] : ['#eaf6ed', '#ffffff']}
          style={[styles.locationCard, { borderColor: colors.border, ...DesignTokens.shadow.level3 }]}
        >
          <View style={styles.locLeft}>
            <View style={[styles.locIcon, { backgroundColor: colors.accent }]}>
              <Feather name="map-pin" size={20} color="#ffffff" />
            </View>
            <View style={{ gap: 4, flex: 1 }}>
              <Text style={[styles.locationTitle, { color: colors.text, fontWeight: '800' }]} numberOfLines={1}>{farmStats.location}</Text>
              <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '500' }]} numberOfLines={1}>
                {farmStats.size} • {farmStats.season}
              </Text>
            </View>
          </View>
          <View style={styles.healthBadgeWrapper}>
            <ProgressRing value={farmStats.healthScore} color={colors.accent} size={56} strokeWidth={4} />
          </View>
        </LinearGradient>
      </FadeInUp>

      {/* Growth chart */}
      <FadeInUp index={1} distance={16}>
        <GlassCard padding={20}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[t.overline, { color: colors.textSecondary, letterSpacing: 0.5, fontWeight: '600' }]}>{s.weeklyFarmGrowth}</Text>
              <Text style={[t.caption, { color: colors.textMuted, marginTop: 2 }]}>{s.ndviHealthIndex}</Text>
            </View>
            <PressableScale onPress={() => go('/insights')} haptic="light" style={[styles.viewTrendsBtn, { backgroundColor: colors.accent + '12', borderColor: colors.accent }]}>
              <Feather name="arrow-up-right" size={14} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[t.label, { color: colors.accent, fontWeight: '700' }]}>{s.trends}</Text>
            </PressableScale>
          </View>

          <View style={styles.chartBars}>
            {farmStats.growthHistory.map((h, i) => {
              const isLast = i === farmStats.growthHistory.length - 1;
              return (
                <View key={h.week} style={styles.chartColumn}>
                  <View style={[styles.chartTrack, { backgroundColor: colors.surfaceElevated }]}>
                    <AnimatedBar
                      fraction={h.value / 100}
                      index={i}
                      width={20}
                      radius={10}
                      style={{ overflow: 'hidden' }}
                    >
                      <LinearGradient
                        colors={isLast ? colors.gradient.accent : colors.gradient.primary}
                        style={StyleSheet.absoluteFill as any}
                      />
                    </AnimatedBar>
                  </View>
                  <Text style={[t.caption, { color: isLast ? colors.accent : colors.textSecondary, fontWeight: '700', fontSize: 11, marginTop: 6 }]}>{h.week}</Text>
                </View>
              );
            })}
          </View>

          <View style={[styles.legendRow, { borderTopColor: colors.border }]}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '500', flexShrink: 1 }]} numberOfLines={1}>{s.healthIncreasing} • {s.updatedTime}</Text>
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Crop list */}
      <FadeInUp index={2} distance={16}>
        <View style={{ marginTop: 20 }}>
          <SectionTitle action={`${farmStats.crops.length} Active`}>{s.cultivatedCrops}</SectionTitle>
        </View>
      </FadeInUp>

      <View style={[styles.cropsListContainer, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level2 }]}>
        {farmStats.crops.map((crop, idx) => (
          <FadeInUp key={crop.name} index={idx + 3} distance={16}>
            <View>
              {idx > 0 && <View style={[styles.listDivider, { backgroundColor: colors.border }]} />}
              <PressableScale style={styles.cropRow} onPress={() => go('/insights')} haptic="light">
                <View style={styles.cropLeft}>
                  <View style={[styles.cropIconWrap, { backgroundColor: scheme === 'dark' ? colors.surfaceElevated : crop.bgColor }]}>
                    <Text style={styles.cropEmoji}>{crop.icon}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>{crop.name}</Text>
                    <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '500' }]} numberOfLines={1}>{crop.status}</Text>
                  </View>
                </View>
                <View style={styles.cropRight}>
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>{crop.area}</Text>
                    <View style={[styles.healthBadge, { backgroundColor: colors.accent + '12', borderColor: colors.accent }]}>
                      <Text style={[t.caption, { color: colors.accent, fontWeight: '700', fontSize: 11 }]}>
                        {crop.pct}%
                      </Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} style={{ marginLeft: 8 }} />
                </View>
              </PressableScale>
            </View>
          </FadeInUp>
        ))}
      </View>

      {/* Satellite insight */}
      <FadeInUp index={6} distance={16}>
        <LinearGradient
          colors={scheme === 'dark' ? ['#091520', '#040906'] : ['#eef6ff', '#ffffff']}
          style={[styles.satelliteCard, { borderColor: colors.border, ...DesignTokens.shadow.level2 }]}
        >
          <View style={styles.satelliteHeader}>
            <View style={[styles.infoIcon, { backgroundColor: colors.info + '15', borderColor: colors.info + '30', borderWidth: 1 }]}>
              <Feather name="map" size={16} color={colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[t.overline, { color: colors.textSecondary, letterSpacing: 0.5, fontWeight: '600' }]}>{s.satelliteSoilInsights}</Text>
              <Text style={[t.caption, { color: colors.textMuted, marginTop: 1 }]}>{s.satelliteUpdated}</Text>
            </View>
          </View>
          <Text style={[t.body, { color: colors.textSecondary, marginTop: 12, lineHeight: 22, fontWeight: '500' }]}>
            {s.satelliteDesc}
          </Text>
          <PressableScale onPress={() => go('/insights')} haptic="light" style={[styles.insightAction, { backgroundColor: colors.info + '12', borderColor: colors.info }]}>
            <Text style={[t.label, { color: colors.info, fontWeight: '700' }]}>{s.viewSatelliteMaps}</Text>
            <Feather name="arrow-right" size={14} color={colors.info} />
          </PressableScale>
        </LinearGradient>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  locLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  locIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  locationTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  healthBadgeWrapper: { alignItems: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  viewTrendsBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingHorizontal: 8, marginVertical: 16 },
  chartColumn: { alignItems: 'center', gap: 8, flex: 1 },
  chartTrack: { width: 20, height: 90, borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderTopWidth: 1, paddingTop: 14, marginTop: 16 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },

  // Crops list
  cropsListContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 12,
  },
  listDivider: {
    height: 1,
  },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cropLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  cropIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  cropEmoji: { fontSize: 22 },
  cropRight: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 },
  healthBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, overflow: 'hidden' },

  // Satellite card
  satelliteCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    gap: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  satelliteHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, overflow: 'hidden' },
  insightAction: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
