import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Screen, GlassCard } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';

export default function SearchScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Wheat harvest weather',
    'Cotton disease scan',
    'PM Kisan subsidy',
  ]);

  const trendingTags = [
    'Wheat seed price',
    'Yellow rust prevention',
    'Drip irrigation setup',
    'Organic compost',
    'Karnal weather',
    'Live Mandi rate today',
  ];

  const handleSearchSubmit = (searchVal: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (searchVal.trim() === '') return;
    setQuery(searchVal);
    if (!recentSearches.includes(searchVal)) {
      setRecentSearches(prev => [searchVal, ...prev].slice(0, 5));
    }
  };

  const handleClearHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRecentSearches([]);
  };

  // Mock Search Result filter
  const searchResults = [
    { title: '🌾 Wheat Maturation Guidelines', desc: 'Cultivation guide for harvesting mature grains.', route: '/(tabs)/crops' },
    { title: '📜 PM-KISAN Agriculture Scheme', desc: 'Eligible checks & registration portal links.', route: '/schemes' },
    { title: '⛅ Weather Forecast (Karnal)', desc: '7-day local rain and temperature analysis.', route: '/weather' },
  ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.desc.toLowerCase().includes(query.toLowerCase()));

  return (
    <Screen
      title="Search"
      subtitle="Explore crops, schemes & prices"
      scroll={false}
      back
      onBack={() => router.back()}
    >
      {/* Search Input */}
      <FadeInUp index={0} distance={16}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16, marginBottom: 16 }}>
          <View style={[{ flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, gap: 8 }]}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor={colors.textMuted}
              style={[t.body, { flex: 1, color: colors.text, fontWeight: '600' }]}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleSearchSubmit(query)}
              autoFocus
            />
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                router.push('/voice-assistant' as any);
              }}
              haptic="light"
            >
              <Feather name="mic" size={16} color={colors.accent} />
            </PressableScale>
          </View>
        </View>
      </FadeInUp>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {query === '' ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <FadeInUp index={1} distance={16}>
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
                    <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>Recent</Text>
                    <PressableScale onPress={handleClearHistory} haptic="light">
                      <Text style={[t.label, { color: colors.danger, fontWeight: '700', fontSize: 12 }]}>Clear</Text>
                    </PressableScale>
                  </View>

                  {recentSearches.map((s, idx) => (
                    <PressableScale key={s} onPress={() => handleSearchSubmit(s)} haptic="light">
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border }}>
                        <Feather name="clock" size={14} color={colors.textMuted} />
                        <Text style={[t.body, { color: colors.textSecondary, flex: 1, fontWeight: '500' }]}>{s}</Text>
                        <Feather name="arrow-up-left" size={12} color={colors.textMuted} />
                      </View>
                    </PressableScale>
                  ))}
                </View>
              </FadeInUp>
            )}

            {/* Trending tags */}
            <FadeInUp index={2} distance={16}>
              <View style={{ gap: 10 }}>
                <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>Trending</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {trendingTags.map(tag => (
                    <PressableScale key={tag} onPress={() => handleSearchSubmit(tag)} haptic="light">
                      <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Feather name="trending-up" size={12} color={colors.accent} />
                        <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '600' }]}>{tag}</Text>
                      </View>
                    </PressableScale>
                  ))}
                </View>
              </View>
            </FadeInUp>
          </>
        ) : (
          /* Search Results list */
          <FadeInUp index={1} distance={16}>
            <View style={{ gap: 10 }}>
              <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>Results</Text>
              {searchResults.length === 0 ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 }}>
                  <Feather name="search" size={40} color={colors.textMuted} />
                  <Text style={[t.title, { color: colors.text, fontWeight: '700' }]}>No results</Text>
                  <Text style={[t.body, { color: colors.textSecondary, textAlign: 'center' }]}>Try different keywords</Text>
                </View>
              ) : (
                searchResults.map((item, idx) => (
                  <PressableScale
                    key={item.title}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      router.push(item.route as any);
                    }}
                    haptic="light"
                  >
                    <GlassCard padding={14}>
                      <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>{item.title}</Text>
                      <Text style={[t.body, { color: colors.textSecondary, lineHeight: 20 }]}>{item.desc}</Text>
                    </GlassCard>
                  </PressableScale>
                ))
              )}
            </View>
          </FadeInUp>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({});
