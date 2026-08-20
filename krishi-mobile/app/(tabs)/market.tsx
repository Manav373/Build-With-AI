import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';
import { Screen, SectionTitle, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, Counter, AnimatedBar, Pulse, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';
import { useLocation } from '@/hooks/useLocation';
import { getLiveMandis, getCommodityTrends } from '@/services/api';

const STRINGS = {
  en: {
    screenTitle: 'Mandi Intel',
    screenSubtitle: 'Live Agricultural APMC Rates',
    priceAlerts: 'Price alerts',
    searchPlaceholder: 'Search mandi or crop...',
    categoryAll: 'All',
    categoryCereals: 'Cereals',
    categoryVegetables: 'Vegetables',
    categoryFruits: 'Fruits',
    categoryPulses: 'Pulses',
    activeCommodity: 'Active Commodity',
    minPrice: 'Min Price',
    avgPrice: 'Avg Price',
    maxPrice: 'Max Price',
    trending: '🔥 Trending',
    aiMarketInsight: 'AI Market Insight',
    sellNow: 'SELL NOW:',
    insightText: 'Regional wheat prices are at a 3-month peak. Mandis show high buying activity. Prices stabilize next week.',
    detailedAnalysis: 'Get Detailed Analysis',
    weeklyPriceMovement: 'Weekly Price Movement',
    perQuintal: 'Per Quintal (Q)',
    nearbyAPMC: 'Nearby APMC Mandis',
    updatedAgo: 'Updated 10m ago',
    away: 'away',
  },
  hi: {
    screenTitle: 'मंडी इंटेल',
    screenSubtitle: 'लाइव कृषि APMC दरें',
    priceAlerts: 'मूल्य सतर्कताएं',
    searchPlaceholder: 'मंडी या फसल खोजें...',
    categoryAll: 'सभी',
    categoryCereals: 'अनाज',
    categoryVegetables: 'सब्जियां',
    categoryFruits: 'फल',
    categoryPulses: 'दालें',
    activeCommodity: 'सक्रिय वस्तु',
    minPrice: 'न्यूनतम कीमत',
    avgPrice: 'औसत कीमत',
    maxPrice: 'अधिकतम कीमत',
    trending: '🔥 ट्रेंडिंग',
    aiMarketInsight: 'AI मंडी सलाह',
    sellNow: 'अभी बेचें:',
    insightText: 'क्षेत्रीय गेहूं की कीमतें 3-महीने के शीर्ष पर हैं। मंडियों में उच्च खरीद गतिविधि। अगले सप्ताह कीमत स्थिर रहेगी।',
    detailedAnalysis: 'विस्तृत विश्लेषण प्राप्त करें',
    weeklyPriceMovement: 'साप्ताहिक मूल्य प्रवृत्ति',
    perQuintal: 'प्रति क्विंटल (Q)',
    nearbyAPMC: 'पास की APMC मंडियां',
    updatedAgo: '10 मिनट पहले अपडेट',
    away: 'दूर',
  },
  gu: {
    screenTitle: 'માર્કેટ ઇન્ટેલ',
    screenSubtitle: 'જીવંત કૃષિ APMC દરો',
    priceAlerts: 'કિંમત સતર્કતાઓ',
    searchPlaceholder: 'માર્કેટ અથવા પાક શોધો...',
    categoryAll: 'બધા',
    categoryCereals: 'અનાજ',
    categoryVegetables: 'શાકભાજી',
    categoryFruits: 'ફળો',
    categoryPulses: 'તણતણ',
    activeCommodity: 'સક્રિય વસ્તુ',
    minPrice: 'ન્યૂનતમ કિંમત',
    avgPrice: 'સરેરાશ કિંમત',
    maxPrice: 'મહત્તમ કિંમત',
    trending: '🔥 ટ્રેન્ડિંગ',
    aiMarketInsight: 'AI માર્કેટ સલાહ',
    sellNow: 'હવે વેચો:',
    insightText: 'પ્રાદેશિક ઘઉં ભાવ 3-મહિનાનો શિખર છે. બજારોમાં ઊંચી ખરીદ પ્રવૃત્તિ. આગલા સપ્તાહે ભાવ સ્થિર રહેશે.',
    detailedAnalysis: 'વિસ્તૃત વિશ્લેષણ મેળવો',
    weeklyPriceMovement: 'સાપ્તાહિક ભાવ ગતિ',
    perQuintal: 'પ્રતિ ક્વિંટલ (Q)',
    nearbyAPMC: 'નજીક APMC બજારો',
    updatedAgo: '10 મિનિટ પહેલાં અપડેટ',
    away: 'દૂર',
  },
  mr: {
    screenTitle: 'मंडी इंटेल',
    screenSubtitle: 'लाइव कृषि APMC दर',
    priceAlerts: 'किंमत सूचना',
    searchPlaceholder: 'मंडी किंवा पिक शोधा...',
    categoryAll: 'सर्व',
    categoryCereals: 'धान्य',
    categoryVegetables: 'भाज्या',
    categoryFruits: 'फळे',
    categoryPulses: 'दाळ',
    activeCommodity: 'सक्रिय वस्तू',
    minPrice: 'किमान किंमत',
    avgPrice: 'सरासरी किंमत',
    maxPrice: 'कमाल किंमत',
    trending: '🔥 ट्रेंडिंग',
    aiMarketInsight: 'AI मंडी सल्ला',
    sellNow: 'आता विक्रय करा:',
    insightText: 'प्रादेशिक गहू भाव 3-महिने सर्वोच्च आहेत. मंडीमध्ये उच्च खरेदी क्रिया. पुढील आठवड्यात किंमत स्थिर राहणार.',
    detailedAnalysis: 'तपशीलवार विश्लेषण मिळवा',
    weeklyPriceMovement: 'साप्ताहिक किंमत प्रवृत्ती',
    perQuintal: 'प्रति क्विंटल (Q)',
    nearbyAPMC: 'जवळील APMC मंडी',
    updatedAgo: '10 मिनिट आधी अपडेट',
    away: 'दूर',
  },
};

interface MandiItem {
  id: string;
  name: string;
  distance: string;
  price: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

interface MandiItem {
  id: string;
  name: string;
  distance: string;
  price: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

export default function MarketScreen() {
  const colors = useThemeColors();
  const t = useType();
  const scheme = useColorScheme();
  const s = useScreenStrings(STRINGS as any);
  const { location, loading: locationLoading } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCrop] = useState('Wheat (Kanak)');
  const [mandiData, setMandiData] = useState<MandiItem[] | null>(null);
  const [trendData, setTrendData] = useState<{ min: number; avg: number; max: number } | null>(null);
  const [chartData, setChartData] = useState<{ day: string; price: string; frac: number }[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const requestCounterRef = useRef(0);

  const categories = [
    { key: 'categoryAll', label: s.categoryAll },
    { key: 'categoryCereals', label: s.categoryCereals },
    { key: 'categoryVegetables', label: s.categoryVegetables },
    { key: 'categoryFruits', label: s.categoryFruits },
    { key: 'categoryPulses', label: s.categoryPulses },
  ];

  const mockMandiPrices: MandiItem[] = [
    { id: 'm1', name: 'Karnal APMC Main Mandi', distance: '4.2 km', price: '₹2,420/Q', trend: 'up', change: '+₹45' },
    { id: 'm2', name: 'Gharaunda APMC Sub Mandi', distance: '12.8 km', price: '₹2,390/Q', trend: 'up', change: '+₹30' },
    { id: 'm3', name: 'Panipat APMC Market', distance: '28.5 km', price: '₹2,410/Q', trend: 'stable', change: '₹0' },
    { id: 'm4', name: 'Indri Grain Yard Mandi', distance: '18.1 km', price: '₹2,360/Q', trend: 'down', change: '-₹15' },
  ];

  const mockChartPoints = [
    { day: 'Mon', price: '₹2,320', frac: 0.4 },
    { day: 'Tue', price: '₹2,350', frac: 0.55 },
    { day: 'Wed', price: '₹2,330', frac: 0.45 },
    { day: 'Thu', price: '₹2,380', frac: 0.7 },
    { day: 'Fri', price: '₹2,400', frac: 0.85 },
    { day: 'Sat', price: '₹2,420', frac: 1 },
  ];

  const mockTrendData = { min: 2210, avg: 2380, max: 2450 };

  // Fetch live mandis when location resolves
  useEffect(() => {
    if (!location || locationLoading) return;

    (async () => {
      try {
        setFetching(true);
        const response = await getLiveMandis(location.lat, location.lon);

        if (response?.data && Array.isArray(response.data)) {
          const mapped = response.data.slice(0, 4).map((mandi: any, idx: number) => ({
            id: mandi.id || `m${idx + 1}`,
            name: mandi.name || mandi.mandi_name || `Mandi ${idx + 1}`,
            distance: mandi.distance ? `${Number(mandi.distance).toFixed(1)} km` : `${(idx + 1) * 5} km`,
            price: mandi.price ? `₹${Math.round(mandi.price)}/Q` : `₹${2300 + idx * 20}/Q`,
            trend: mandi.trend === 'up' ? 'up' : mandi.trend === 'down' ? 'down' : 'stable' as const,
            change: mandi.change ? (mandi.change > 0 ? `+₹${Math.round(mandi.change)}` : `₹${Math.round(mandi.change)}`) : ['up', 'down', 'stable'][idx % 3] === 'up' ? '+₹30' : '₹0',
          }));
          setMandiData(mapped);
        }
      } catch (err) {
        // Fallback to mock data on error
      } finally {
        setFetching(false);
      }
    })();
  }, [location, locationLoading]);

  // Fetch commodity trends when category changes
  useEffect(() => {
    if (!location?.state) return;

    const reqId = ++requestCounterRef.current;

    (async () => {
      try {
        setFetching(true);
        const response = await getCommodityTrends('Wheat', location.state);

        if (reqId !== requestCounterRef.current) return; // Stale response

        if (response?.data) {
          const min = response.data.min_price ?? response.data.minPrice ?? mockTrendData.min;
          const avg = response.data.avg_price ?? response.data.avgPrice ?? mockTrendData.avg;
          const max = response.data.max_price ?? response.data.maxPrice ?? mockTrendData.max;

          setTrendData({ min, avg, max });

          if (response.data.history && Array.isArray(response.data.history)) {
            const mapped = response.data.history.slice(-6).map((point: any, idx: number) => ({
              day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx],
              price: `₹${Math.round(point.price ?? point.modal_price ?? 2300)}`,
              frac: Math.min(1, (point.price ?? point.modal_price ?? 2300) / 2500),
            }));
            setChartData(mapped);
          }
        }
      } catch (err) {
        if (reqId === requestCounterRef.current) {
          // Keep existing data on error
        }
      } finally {
        setFetching(false);
      }
    })();
  }, [location?.state]);

  const selectCat = (catLabel: string) => {
    Haptics.selectionAsync?.().catch?.(() => {});
    setActiveCategory(catLabel);
  };

  return (
    <Screen
      title={s.screenTitle}
      emoji="📈"
      subtitle={s.screenSubtitle}
      right={<HeaderIconButton icon="bell" label={s.priceAlerts} />}
    >
      {/* Search + categories */}
      <FadeInUp index={0} distance={16}>
        <View style={{ gap: 14 }}>
          <View style={[styles.searchBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Feather name="search" size={18} color={colors.textMuted} />
            <TextInput
              placeholder={s.searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.text }]}
              accessibilityLabel="Search"
            />
            {searchQuery.length > 0 && (
              <PressableScale onPress={() => setSearchQuery('')} haptic="light" style={styles.clearBtn} accessibilityLabel="Clear search">
                <Feather name="x" size={16} color={colors.textMuted} />
              </PressableScale>
            )}
          </View>

          {/* Capsule Segmented Control Style scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat, i) => {
              const on = activeCategory === cat.label;
              return (
                <FadeInUp key={cat.key} index={i} distance={8}>
                  <PressableScale onPress={() => selectCat(cat.label)} haptic="light" scaleTo={0.94}>
                    <View style={[
                      styles.categorySegment,
                      {
                        backgroundColor: on ? colors.accent : colors.surface,
                        borderColor: on ? 'transparent' : colors.border,
                        ...( on ? DesignTokens.shadow.level1 : {})
                      }
                    ]}>
                      <Text style={[styles.categoryText, { color: on ? '#ffffff' : colors.textSecondary, fontWeight: on ? '700' : '600', fontSize: 13 }]}>
                        {cat.label}
                      </Text>
                    </View>
                  </PressableScale>
                </FadeInUp>
              );
            })}
          </ScrollView>
        </View>
      </FadeInUp>

      {/* Selected crop summary */}
      <FadeInUp index={1} distance={16}>
        <GlassCard padding={20}>
          <View style={styles.summaryHeader}>
            <View style={{ gap: 4, flex: 1 }}>
              <Text style={[t.overline, { color: colors.textMuted, letterSpacing: 0.5, fontWeight: '600' }]}>
                {s.activeCommodity}
              </Text>
              <Text style={[styles.summaryTitle, { color: colors.text, fontWeight: '800', letterSpacing: -0.3 }]} numberOfLines={1}>
                {selectedCrop}
              </Text>
            </View>
            <View style={[styles.demandBadge, { backgroundColor: colors.accent + '20', borderColor: colors.accent, borderWidth: 1 }]}>
              <Text style={[t.label, { color: colors.accent, fontWeight: '700' }]}>
                {s.trending}
              </Text>
            </View>
          </View>

          <View style={[styles.statsRow, { borderTopColor: colors.border, marginTop: 18 }]}>
            {[
              { label: s.minPrice, value: trendData?.min ?? mockTrendData.min, color: colors.danger },
              { label: s.avgPrice, value: trendData?.avg ?? mockTrendData.avg, color: colors.text },
              { label: s.maxPrice, value: trendData?.max ?? mockTrendData.max, color: colors.accent },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.statBox}>
                  <Counter
                    value={stat.value}
                    style={[styles.priceNumberText, { color: stat.color }]}
                    format={(n) => `₹${Math.round(n).toLocaleString('en-IN')}`}
                  />
                  <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '600', marginTop: 4 }]} numberOfLines={1}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </GlassCard>
      </FadeInUp>

      {/* AI advisory */}
      <FadeInUp index={2} distance={16}>
        <LinearGradient
          colors={scheme === 'dark' ? ['#0e2a14', '#050e07'] : ['#f0fdf4', '#f8faf7']}
          style={[styles.advisoryCard, { borderColor: colors.accent + '40', ...DesignTokens.shadow.level2 }]}
        >
          <View style={styles.advisoryHead}>
            <View style={[styles.advisoryIcon, { backgroundColor: colors.accent + '15' }]}>
              <MaterialCommunityIcons name="lightbulb-on" size={16} color={colors.accent} />
            </View>
            <Text style={[t.overline, { color: colors.textSecondary, letterSpacing: 0.5, fontWeight: '600', flex: 1 }]} numberOfLines={1}>{s.aiMarketInsight}</Text>
          </View>
          <Text style={[t.body, { color: colors.textSecondary, marginTop: 12, lineHeight: 22 }]}>
            <Text style={{ fontWeight: '700', color: colors.accent }}>{s.sellNow} </Text>
            <Text style={{ fontWeight: '500' }}>{s.insightText}</Text>
          </Text>
          <PressableScale onPress={() => {}} haptic="light" style={[styles.advisoryAction, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}>
            <Text style={[t.label, { color: colors.accent, fontWeight: '700' }]}>{s.detailedAnalysis}</Text>
            <Feather name="arrow-right" size={14} color={colors.accent} />
          </PressableScale>
        </LinearGradient>
      </FadeInUp>

      {/* Weekly price chart */}
      <FadeInUp index={3} distance={16}>
        <GlassCard padding={20}>
          <View style={styles.chartHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[t.overline, { color: colors.textSecondary, letterSpacing: 0.5, fontWeight: '600' }]}>{s.weeklyPriceMovement}</Text>
              <Text style={[t.caption, { color: colors.textMuted, marginTop: 2 }]}>{s.perQuintal}</Text>
            </View>
            <PressableScale onPress={() => {}} haptic="light" style={[styles.chartAction, { backgroundColor: colors.accent + '12', borderColor: colors.accent }]}>
              <Feather name="calendar" size={14} color={colors.accent} />
            </PressableScale>
          </View>
          <View style={styles.chartArea}>
            {(chartData || mockChartPoints).map((p, i) => {
              const data = chartData || mockChartPoints;
              const isLast = i === data.length - 1;
              return (
                <View key={p.day} style={styles.chartColumn}>
                  {isLast && (
                    <View style={[styles.tooltip, { backgroundColor: colors.accent }]}>
                      <Text style={styles.tooltipText}>{p.price}</Text>
                    </View>
                  )}
                  <View style={[styles.barTrack, { backgroundColor: colors.surfaceElevated }]}>
                    <AnimatedBar fraction={p.frac} index={i} width={22} radius={11} style={{ overflow: 'hidden' }}>
                      <LinearGradient colors={isLast ? colors.gradient.accent : colors.gradient.primary} style={StyleSheet.absoluteFill as any} />
                    </AnimatedBar>
                  </View>
                  <Text style={[t.caption, { color: isLast ? colors.accent : colors.textSecondary, fontWeight: '700', fontSize: 11, marginTop: 8 }]}>{p.day}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Mandi list */}
      <FadeInUp index={4} distance={16}>
        <View style={styles.mandiHead}>
          <View style={styles.mandiHeadTop}>
            <View style={{ flex: 1 }}>
              <SectionTitle>{s.nearbyAPMC}</SectionTitle>
            </View>
            <View style={styles.liveRow}>
              <Pulse>
                <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
              </Pulse>
              <Text style={[t.caption, { color: colors.textMuted, fontWeight: '500' }]} numberOfLines={1}>{s.updatedAgo}</Text>
            </View>
          </View>
        </View>
      </FadeInUp>

      <View style={[styles.mandiListContainer, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level2 }]}>
        {(mandiData || mockMandiPrices).map((m, idx) => {
          const tint = m.trend === 'up' ? colors.accent : m.trend === 'down' ? colors.danger : colors.textSecondary;
          return (
            <FadeInUp key={m.id} index={idx + 5} distance={16}>
              <View>
                {idx > 0 && <View style={[styles.mandiDivider, { backgroundColor: colors.border }]} />}
                <PressableScale style={styles.mandiRow} onPress={() => {}} haptic="light">
                  <View style={styles.mandiLeft}>
                    <View style={[styles.mandiIcon, { backgroundColor: colors.accent + '15' }]}>
                      <Feather name="map-pin" size={16} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>{m.name}</Text>
                      <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '500' }]} numberOfLines={1}>{m.distance} {s.away}</Text>
                    </View>
                  </View>
                  <View style={styles.mandiRight}>
                    <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700', fontSize: 15 }]}>{m.price}</Text>
                    <View style={[styles.trendBadge, { backgroundColor: tint + '15', borderColor: tint, borderWidth: 1 }]}>
                      <Feather name={m.trend === 'up' ? 'trending-up' : m.trend === 'down' ? 'trending-down' : 'minus'} size={11} color={tint} />
                      <Text style={[t.caption, { color: tint, fontWeight: '700', fontSize: 10 }]}>{m.change}</Text>
                    </View>
                  </View>
                </PressableScale>
              </View>
            </FadeInUp>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, overflow: 'hidden' },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  clearBtn: { padding: 6, borderRadius: 6, overflow: 'hidden' },
  categoryScroll: { gap: 10, paddingHorizontal: 2 },
  categorySegment: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  categoryText: { fontWeight: '700' },

  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  summaryTitle: { fontSize: 22, letterSpacing: -0.4 },
  demandBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexShrink: 0, overflow: 'hidden' },

  statsRow: { flexDirection: 'row', borderTopWidth: 1, marginTop: 18, paddingTop: 16, alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center', gap: 6 },
  priceNumberText: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  divider: { width: 1, height: '60%' },

  advisoryCard: { padding: 18, borderRadius: 24, borderWidth: 1, gap: 6, overflow: 'hidden' },
  advisoryHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  advisoryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  advisoryAction: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden' },

  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  chartAction: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, paddingHorizontal: 4, marginTop: 16 },
  chartColumn: { alignItems: 'center', flex: 1, gap: 8 },
  tooltip: { position: 'absolute', top: -28, zIndex: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tooltipText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  barTrack: { width: 22, height: 100, borderRadius: 11, justifyContent: 'flex-end', overflow: 'hidden' },

  mandiHead: { gap: 8, marginTop: 16 },
  mandiHeadTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  mandiListContainer: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginTop: 12 },
  mandiDivider: { height: 1 },
  mandiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  mandiLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  mandiIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  mandiRight: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});
