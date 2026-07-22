import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations } from '@/constants/Translations';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface StepSuccessProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  onFinish: () => void;
}

export default function StepSuccess({ language, scheme, onFinish }: StepSuccessProps) {
  const colors = Colors[scheme];
  const t = Translations[language];

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play sound or success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    callback();
  };

  // Mock confetti coordinates
  const confettiPieces = [
    { left: '10%', top: '25%', size: 8, color: '#ffb74d', rotate: '15deg' },
    { left: '25%', top: '15%', size: 10, color: '#81c784', rotate: '45deg' },
    { left: '40%', top: '20%', size: 6, color: '#64b5f6', rotate: '-30deg' },
    { left: '75%', top: '18%', size: 12, color: '#e57373', rotate: '60deg' },
    { left: '85%', top: '28%', size: 8, color: '#ffd54f', rotate: '-15deg' },
    { left: '15%', top: '45%', size: 9, color: '#a1887f', rotate: '25deg' },
    { left: '80%', top: '50%', size: 7, color: '#4db6ac', rotate: '40deg' },
    { left: '20%', top: '70%', size: 11, color: '#ffd54f', rotate: '-45deg' },
    { left: '70%', top: '72%', size: 8, color: '#81c784', rotate: '30deg' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sunrise Gradient Backdrop */}
      <LinearGradient
        colors={scheme === 'dark' ? ['#0e2a14', '#050e07'] : ['#e8f5e9', '#f8faf7']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Confetti Animation Layer */}
      {confettiPieces.map((p, idx) => {
        const translateY = confettiAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, height * 0.15 + (idx * 10)],
        });
        const opacity = confettiAnim.interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 0.8, 0],
        });

        return (
          <Animated.View
            key={idx}
            style={[
              styles.confetti,
              {
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size * 1.5,
                backgroundColor: p.color,
                opacity: opacity,
                transform: [{ translateY }, { rotate: p.rotate }],
              },
            ]}
          />
        );
      })}

      <View style={styles.content}>
        {/* Animated Checkmark Crest */}
        <Animated.View
          style={[
            styles.crestContainer,
            {
              backgroundColor: colors.surface,
              borderColor: `${colors.accent}20`,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Inner ring */}
          <View style={[styles.crestRing, { borderColor: `${colors.accent}40` }]}>
            <LinearGradient
              colors={colors.gradient.primary}
              style={styles.crestCircle}
            >
              <Feather name="check" size={56} color="#ffffff" />
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Success Typography */}
        <Animated.View style={[styles.textSection, { opacity: fadeAnim }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t.success_title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t.success_subtitle}
          </Text>
        </Animated.View>
      </View>

      {/* Footer CTA */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => handlePress(onFinish)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.exploreGradient}
          >
            <Text style={styles.exploreText}>{t.get_started}</Text>
            <Feather name="chevron-right" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
  confetti: {
    position: 'absolute',
    borderRadius: 2,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    zIndex: 2,
  },
  crestContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  crestRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  crestCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    width: '100%',
    zIndex: 2,
  },
  exploreBtn: {
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
  exploreGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exploreText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
