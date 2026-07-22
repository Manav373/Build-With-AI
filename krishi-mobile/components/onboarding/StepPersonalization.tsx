import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations } from '@/constants/Translations';
import * as Haptics from 'expo-haptics';

interface StepPersonalizationProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  selectedCrops: string[];
  selectedGoals: string[];
  onChangeCrops: (crop: string) => void;
  onChangeGoals: (goal: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function StepPersonalization({
  language,
  scheme,
  selectedCrops,
  selectedGoals,
  onChangeCrops,
  onChangeGoals,
  onNext,
  onPrev,
}: StepPersonalizationProps) {
  const colors = Colors[scheme];
  const t = Translations[language];

  const { width } = useWindowDimensions();
  const effectiveWidth = Math.min(width, 480);
  const gridItemWidth = (effectiveWidth - 60) / 2;

  const handleSelectCrop = (cropName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onChangeCrops(cropName);
  };

  const handleSelectGoal = (goalName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onChangeGoals(goalName);
  };

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    callback();
  };

  const crops = [
    { name: 'Rice', emoji: '🌾', labelEn: 'Rice', labelHi: 'चावल' },
    { name: 'Cotton', emoji: '☁️', labelEn: 'Cotton', labelHi: 'कपास' },
    { name: 'Wheat', emoji: '🌾', labelEn: 'Wheat', labelHi: 'गेहूं' },
    { name: 'Groundnut', emoji: '🥜', labelEn: 'Groundnut', labelHi: 'मूंगफली' },
    { name: 'Sugarcane', emoji: '🎋', labelEn: 'Sugarcane', labelHi: 'गन्ना' },
    { name: 'Vegetables', emoji: '🥕', labelEn: 'Vegetables', labelHi: 'सब्जियां' },
    { name: 'Fruits', emoji: '🍎', labelEn: 'Fruits', labelHi: 'फल' },
    { name: 'Millets', emoji: '🌾', labelEn: 'Millets', labelHi: 'बाजरा/ज्वार' },
  ];

  const goals = [
    { name: 'Increase Yield', emoji: '📈', labelEn: 'Increase Yield', labelHi: 'पैदावार बढ़ाएं' },
    { name: 'Reduce Water', emoji: '💧', labelEn: 'Reduce Water', labelHi: 'पानी बचाएं' },
    { name: 'Increase Profit', emoji: '💰', labelEn: 'Increase Profit', labelHi: 'मुनाफा बढ़ाएं' },
    { name: 'Disease Prevention', emoji: '🛡️', labelEn: 'Disease Alert', labelHi: 'रोगों से बचाव' },
    { name: 'Save Money', emoji: '💵', labelEn: 'Save Costs', labelHi: 'लागत कम करें' },
    { name: 'Organic Farming', emoji: '🌱', labelEn: 'Organic Farming', labelHi: 'जैविक खेती' },
  ];

  const isFormValid = selectedCrops.length > 0 && selectedGoals.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => handlePress(onPrev)}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.titleText, { color: colors.text }]}>{t.personalization_title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
        {t.personalization_subtitle}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Crops Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t.crops_label}
          </Text>
          <View style={styles.grid}>
            {crops.map(item => {
              const isSelected = selectedCrops.includes(item.name);
              const label = language === 'hi' ? item.labelHi : item.labelEn;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.chip,
                    {
                      width: gridItemWidth,
                      backgroundColor: isSelected ? colors.accentSoft : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                      shadowColor: colors.text,
                    },
                  ]}
                  onPress={() => handleSelectCrop(item.name)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <Text style={[styles.chipText, { color: colors.text }]}>{label}</Text>
                  {isSelected && (
                    <Feather name="check" size={14} color={colors.accent} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Goals Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t.goals_label}
          </Text>
          <View style={styles.grid}>
            {goals.map(item => {
              const isSelected = selectedGoals.includes(item.name);
              const label = language === 'hi' ? item.labelHi : item.labelEn;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.chip,
                    {
                      width: gridItemWidth,
                      backgroundColor: isSelected ? colors.accentSoft : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                      shadowColor: colors.text,
                    },
                  ]}
                  onPress={() => handleSelectGoal(item.name)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <Text style={[styles.chipText, { color: colors.text }]}>{label}</Text>
                  {isSelected && (
                    <Feather name="check" size={14} color={colors.accent} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, { opacity: isFormValid ? 1 : 0.65 }]}
          onPress={() => handlePress(onNext)}
          disabled={!isFormValid}
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
  subtitleText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22.5,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  chip: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    position: 'relative',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  checkIcon: {
    position: 'absolute',
    right: 12,
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
