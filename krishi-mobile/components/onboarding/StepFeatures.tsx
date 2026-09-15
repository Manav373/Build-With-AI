import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, useWindowDimensions, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations } from '@/constants/Translations';
import * as Haptics from 'expo-haptics';

interface StepFeaturesProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  onNext: () => void;
  onPrev: () => void;
}

export default function StepFeatures({ language, scheme, onNext, onPrev }: StepFeaturesProps) {
  const colors = Colors[scheme];
  const t = Translations[language];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<any>(null);

  const { width } = useWindowDimensions();
  // Measure the REAL container width (the web simulator shell is narrower than
  // the browser window, so useWindowDimensions alone overflows the card).
  const [containerWidth, setContainerWidth] = useState(0);
  const effectiveWidth = containerWidth > 0 ? containerWidth : Math.min(width, 480);
  const carouselWidth = effectiveWidth - 48;

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / carouselWidth);
    if (index !== activeIndex && index >= 0 && index < 6) {
      setActiveIndex(index);
    }
  };

  const handleDotPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    scrollViewRef.current?.scrollTo({ x: index * carouselWidth, animated: true });
    setActiveIndex(index);
  };

  const goToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * carouselWidth, animated: true });
    setActiveIndex(index);
  };

  // Continue = advance through the carousel first, then move to the next step.
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (activeIndex < 5) {
      goToIndex(activeIndex + 1);
    } else {
      onNext();
    }
  };

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    callback();
  };

  // Define details for the 6 cards
  const featureCards = [
    {
      id: 'doctor',
      title: t.features.crop_doctor.title,
      desc: t.features.crop_doctor.desc,
      iconType: 'feather' as const,
      iconName: 'activity',
      iconColor: colors.danger,
      bgColor: scheme === 'dark' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.05)',
      gradient: ['#ef4444', '#b91c1c'] as const,
    },
    {
      id: 'satellite',
      title: t.features.satellite.title,
      desc: t.features.satellite.desc,
      iconType: 'mcom' as const,
      iconName: 'satellite-variant',
      iconColor: colors.info,
      bgColor: scheme === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)',
      gradient: ['#3b82f6', '#1d4ed8'] as const,
    },
    {
      id: 'weather',
      title: t.features.weather.title,
      desc: t.features.weather.desc,
      iconType: 'feather' as const,
      iconName: 'sun',
      iconColor: colors.warning,
      bgColor: scheme === 'dark' ? 'rgba(250, 204, 21, 0.08)' : 'rgba(250, 204, 21, 0.05)',
      gradient: ['#fbbf24', '#d97706'] as const,
    },
    {
      id: 'voice',
      title: t.features.voice.title,
      desc: t.features.voice.desc,
      iconType: 'feather' as const,
      iconName: 'mic',
      iconColor: colors.accent,
      bgColor: scheme === 'dark' ? 'rgba(74, 222, 128, 0.08)' : 'rgba(16, 185, 129, 0.05)',
      gradient: ['#10b981', '#047857'] as const,
    },
    {
      id: 'market',
      title: t.features.market.title,
      desc: t.features.market.desc,
      iconType: 'feather' as const,
      iconName: 'trending-up',
      iconColor: colors.text,
      bgColor: scheme === 'dark' ? 'rgba(134, 239, 172, 0.08)' : 'rgba(22, 101, 52, 0.05)',
      gradient: ['#166534', '#14532d'] as const,
    },
    {
      id: 'schemes',
      title: t.features.schemes.title,
      desc: t.features.schemes.desc,
      iconType: 'mcom' as const,
      iconName: 'file-document-outline',
      iconColor: '#e91e63',
      bgColor: scheme === 'dark' ? 'rgba(233, 30, 99, 0.08)' : 'rgba(233, 30, 99, 0.05)',
      gradient: ['#ec4899', '#be185d'] as const,
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      onLayout={(e: any) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Top navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => handlePress(onPrev)}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.titleText, { color: colors.text }]}>{t.features_title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
        {t.features_subtitle}
      </Text>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          snapToInterval={carouselWidth}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          style={{ width: carouselWidth, alignSelf: 'center', flexGrow: 0 }}
        >
          {featureCards.map((card, idx) => (
            <View 
              key={card.id} 
              style={[
                styles.carouselCard, 
                { 
                  width: carouselWidth,
                  backgroundColor: colors.surface, 
                  borderColor: idx === activeIndex ? colors.accent : colors.border,
                  shadowColor: colors.text,
                }
              ]}
            >
              {/* Glassmorphic/Glowing backdrop circle inside the card */}
              <View style={[styles.glowCircle, { backgroundColor: card.bgColor }]} />

              {/* Icon */}
              <LinearGradient
                colors={card.gradient}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {card.iconType === 'feather' ? (
                  <Feather name={card.iconName as any} size={28} color="#ffffff" />
                ) : (
                  <MaterialCommunityIcons name={card.iconName as any} size={30} color="#ffffff" />
                )}
              </LinearGradient>

              {/* Feature Title */}
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {card.title}
              </Text>

              {/* Feature Description */}
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                {card.desc}
              </Text>

              {/* Mini tag indicator */}
              <View style={[styles.tag, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Feather name="check-circle" size={12} color={colors.accent} />
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                  Platform Standard
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Carousel Dot Indicators */}
      <View style={styles.dotsContainer}>
        {featureCards.map((_, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor: idx === activeIndex ? colors.accent : colors.borderStrong,
                width: idx === activeIndex ? 24 : 8,
              },
            ]}
            onPress={() => handleDotPress(idx)}
            activeOpacity={0.8}
          />
        ))}
      </View>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
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
  carouselContainer: {
    height: 310,
    marginTop: 16,
  },
  scrollContent: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  carouselCard: {
    height: 290,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  glowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -30,
    right: -30,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    height: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 20,
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
