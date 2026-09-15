import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations } from '@/constants/Translations';

interface StepSplashProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  onNext: () => void;
}

export default function StepSplash({ language, scheme, onNext }: StepSplashProps) {
  const colors = Colors[scheme];
  const t = Translations[language];

  const { width } = useWindowDimensions();
  const effectiveWidth = Math.min(width, 480);

  // Animation values
  const leafScale = useRef(new Animated.Value(0)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Leaf growth animation (spring scale and gentle rotation)
    Animated.parallel([
      Animated.spring(leafScale, {
        toValue: 1,
        tension: 15,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(leafRotate, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Text & logo fade in
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate after 2.8 seconds
    const timer = setTimeout(() => {
      onNext();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const rotateInterpolate = leafRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '10deg'],
  });

  const gradientColors = scheme === 'dark' 
    ? ['#0a2212', '#050e07'] as const
    : ['#e8f5e9', '#f8faf7'] as const;

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFillObject} />

      {/* Sunrise Glowing Background Effect */}
      <View style={[styles.sunriseGlow, { 
        backgroundColor: scheme === 'dark' ? 'rgba(74, 222, 128, 0.04)' : 'rgba(46, 125, 50, 0.05)',
        width: effectiveWidth * 1.5,
        height: effectiveWidth * 1.5,
        borderRadius: effectiveWidth * 0.75,
      }]} />

      <View style={styles.content}>
        {/* Animated Leaf Logo Container */}
        <View style={[styles.logoContainer, { 
          backgroundColor: scheme === 'dark' ? '#0d2212' : '#ffffff',
          borderColor: scheme === 'dark' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(46, 125, 50, 0.1)',
        }]}>
          <Animated.View style={{ transform: [{ scale: leafScale }, { rotate: rotateInterpolate }] }}>
            <Feather name="compass" size={64} color={colors.accent} />
          </Animated.View>
          
          {/* Overlay growing leaf icon */}
          <Animated.View style={[
            styles.leafOverlay, 
            { transform: [{ scale: leafScale }] }
          ]}>
            <Feather name="activity" size={24} color={colors.green} />
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentTranslateY }], alignItems: 'center' }}>
          <View style={styles.brandContainer}>
            <Text style={[styles.brandText, { color: colors.text }]}>Krishi</Text>
            <Text style={[styles.brandAccent, { color: colors.accent }]}>AI</Text>
          </View>
          
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            {t.splash_tagline}
          </Text>
        </Animated.View>
      </View>

      {/* Soft organic hills anchored to the very bottom (behind content) */}
      <View style={styles.farmlandContainer} pointerEvents="none">
        <View style={[styles.hill1, {
          backgroundColor: scheme === 'dark' ? '#07180b' : '#c8e6c9',
          opacity: 0.55,
          width: effectiveWidth * 1.6,
        }]} />
        <View style={[styles.hill2, {
          backgroundColor: scheme === 'dark' ? '#0b2612' : '#a5d6a7',
          opacity: 0.6,
          width: effectiveWidth * 1.6,
        }]} />
      </View>

      {/* Loading indicator */}
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.accent} style={styles.loader} />
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Version 1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sunriseGlow: {
    position: 'absolute',
    top: -100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 28,
    zIndex: 2,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  leafOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e8f5e9',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  brandAccent: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 240,
  },
  farmlandContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 140,
    overflow: 'hidden',
    zIndex: 0,
    alignItems: 'center',
  },
  // Two wide, very-rounded ellipses that peek up from below → soft rolling hills,
  // never a hard band across the middle of the screen.
  hill1: {
    position: 'absolute',
    bottom: -130,
    height: 220,
    borderRadius: 999,
    alignSelf: 'center',
  },
  hill2: {
    position: 'absolute',
    bottom: -160,
    height: 220,
    borderRadius: 999,
    alignSelf: 'center',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  loader: {
    transform: [{ scale: 1.1 }],
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
