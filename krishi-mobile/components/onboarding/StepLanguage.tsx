import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations, Languages } from '@/constants/Translations';
import * as Haptics from 'expo-haptics';

interface StepLanguageProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  onChangeLanguage: (lang: LanguageKey) => void;
  onNext: () => void;
  onPrev: () => void;
  /** Language is the first interactive step — hide back so users can't return to the splash. */
  hideBack?: boolean;
}

export default function StepLanguage({
  language,
  scheme,
  onChangeLanguage,
  onNext,
  onPrev,
  hideBack,
}: StepLanguageProps) {
  const colors = Colors[scheme];
  const t = Translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const { width } = useWindowDimensions();
  // Measure the real container width — the web simulator shell is narrower
  // than the browser window, so useWindowDimensions alone overflows the grid.
  const [containerWidth, setContainerWidth] = useState(0);
  const effectiveWidth = containerWidth > 0 ? containerWidth : Math.min(width, 480);
  const cardWidth = (effectiveWidth - 60) / 2;

  const handleSelectLanguage = (code: LanguageKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onChangeLanguage(code);
  };

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    callback();
  };

  const filteredLanguages = Languages.filter(
    lang =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentlyUsed: LanguageKey[] = ['en', 'hi', 'gu'];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      onLayout={(e: any) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Top navigation */}
      <View style={styles.topBar}>
        {hideBack ? (
          <View style={{ width: 40 }} />
        ) : (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handlePress(onPrev)}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={16} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.titleText, { color: colors.text }]}>{t.language_title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
        <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder={t.language_search}
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Recently Used Languages */}
        {searchQuery === '' && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t.recently_used}
            </Text>
            <View style={styles.recentRow}>
              {recentlyUsed.map(code => {
                const lang = Languages.find(l => l.code === code);
                if (!lang) return null;
                const isSelected = language === code;
                return (
                  <TouchableOpacity
                    key={code}
                    style={[
                      styles.recentChip,
                      {
                        backgroundColor: isSelected ? colors.accentSoft : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectLanguage(code)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.recentChipText,
                        { color: isSelected ? colors.accent : colors.text, fontWeight: '700' },
                      ]}
                    >
                      {lang.nativeName}
                    </Text>
                    {isSelected && <Feather name="check" size={12} color={colors.accent} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* All Languages Grid */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            All Languages / सभी भाषाएं
          </Text>
          <View style={styles.gridContainer}>
            {filteredLanguages.map(lang => {
              const isSelected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langCard,
                    {
                      width: cardWidth,
                      backgroundColor: isSelected ? colors.accentSoft : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                      shadowColor: colors.text,
                    },
                  ]}
                  onPress={() => handleSelectLanguage(lang.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.langCardHeader}>
                    <Text style={[styles.langNativeName, { color: isSelected ? colors.accent : colors.text }]}>
                      {lang.nativeName}
                    </Text>
                    {isSelected ? (
                      <Feather name="check-circle" size={18} color={colors.accent} />
                    ) : (
                      <View style={[styles.unselectedIndicator, { borderColor: colors.borderStrong }]} />
                    )}
                  </View>
                  <Text style={[styles.langEnglishName, { color: colors.textMuted }]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => handlePress(onNext)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueBtnText}>{t.continue_btn}</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 12,
  },
  sectionContainer: {
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  recentChipText: {
    fontSize: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  langCard: {
    height: 86,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  langCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  langNativeName: {
    fontSize: 16,
    fontWeight: '800',
  },
  langEnglishName: {
    fontSize: 12,
    fontWeight: '600',
  },
  unselectedIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  footer: {
    width: '100%',
    paddingTop: 8,
  },
  continueBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  continueGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
