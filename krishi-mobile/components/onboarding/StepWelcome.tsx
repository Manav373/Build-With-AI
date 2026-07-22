import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations, Languages } from '@/constants/Translations';
import * as Haptics from 'expo-haptics';

import { PressableScale } from '@/components/ui/Motion';

interface StepWelcomeProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignUp: () => void;
  onLogin: () => void;
  onGoToStep: (step: number) => void;
  onContinueAsGuest: () => void;
}

export default function StepWelcome({
  language,
  scheme,
  onToggleTheme,
  onSignUp,
  onLogin,
  onGoToStep,
  onContinueAsGuest,
}: StepWelcomeProps) {
  const colors = Colors[scheme];
  const t = Translations[language];
  const currentLang = Languages.find(l => l.code === language) || Languages[0];

  const { width } = useWindowDimensions();
  const effectiveWidth = Math.min(width, 480);
  const illustrationWidth = effectiveWidth - 80;
  const illustrationHeight = Math.min(effectiveWidth - 100, 260);

  const handlePress = (callback: () => void) => {
    callback();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header Utilities */}
      <View style={styles.topBar}>
        {/* Language button */}
        <PressableScale
          style={[styles.utilityButton, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }]}
          onPress={() => handlePress(() => onGoToStep(2))}
          haptic="light"
        >
          <Feather name="globe" size={16} color={colors.textSecondary} />
          <Text style={[styles.utilityText, { color: colors.text }]}>
            {currentLang.nativeName}
          </Text>
          <Feather name="chevron-down" size={14} color={colors.textMuted} />
        </PressableScale>

        {/* Theme mode toggle */}
        <PressableScale
          style={[styles.utilityButton, { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            width: 44,
            justifyContent: 'center',
            paddingHorizontal: 0,
          }]}
          onPress={() => handlePress(onToggleTheme)}
          haptic="light"
        >
          <Feather 
            name={scheme === 'dark' ? 'sun' : 'moon'} 
            size={18} 
            color={colors.accent} 
          />
        </PressableScale>
      </View>

      {/* Hero Farming & AI Illustration */}
      <View style={styles.illustrationWrapper}>
        <LinearGradient
          colors={scheme === 'dark' ? ['#0a180e', '#040906'] : ['#e8f5ec', '#ffffff']}
          style={[styles.illustrationBg, { width: illustrationWidth, height: illustrationHeight, borderColor: colors.border, borderWidth: 1.5 }]}
        >
          {/* Concentric Circles to mimic radar/satellite signals */}
          <View style={[styles.radarCircle, { width: 220, height: 220, borderColor: `${colors.accent}15` }]} />
          <View style={[styles.radarCircle, { width: 140, height: 140, borderColor: `${colors.accent}25` }]} />

          {/* Satellite */}
          <View style={[styles.floatIcon, styles.iconSat, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
            <MaterialCommunityIcons name="satellite-variant" size={20} color={colors.info} />
          </View>

          {/* Drone */}
          <View style={[styles.floatIcon, styles.iconDrone, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
            <MaterialCommunityIcons name="drone" size={20} color={colors.accent} />
          </View>

          {/* AI Helper Node */}
          <View style={[styles.floatIcon, styles.iconAI, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
            <Feather name="cpu" size={20} color={colors.warning} />
          </View>

          {/* Smart Crops */}
          <View style={[styles.floatIcon, styles.iconPlant, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
            <Feather name="crop" size={20} color={colors.green} />
          </View>

          {/* Center Graphic: Smartphone using farmer */}
          <View style={[styles.centerGraphic, { backgroundColor: colors.green, borderColor: colors.accentSoft }]}>
            <Feather name="user" size={48} color="#e2f0e4" />
            <View style={[styles.phoneOverlay, { backgroundColor: colors.accent }]}>
              <Feather name="smartphone" size={14} color="#ffffff" />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Hero Typography */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t.welcome_headline}
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          {t.welcome_desc}
        </Text>
      </View>

      {/* Primary Action Buttons */}
      <View style={styles.actionContainer}>
        {/* Sign Up button — new users go through the full setup flow */}
        <PressableScale
          style={styles.primaryBtn}
          onPress={() => handlePress(onSignUp)}
          haptic="medium"
        >
          <LinearGradient
            colors={colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryBtnText}>{t.sign_up}</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </LinearGradient>
        </PressableScale>

        {/* Login button — returning users jump straight to auth */}
        <PressableScale
          style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1 }]}
          onPress={() => handlePress(onLogin)}
          haptic="light"
        >
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
            {t.login}
          </Text>
        </PressableScale>

        {/* Guest mode */}
        <PressableScale
          style={styles.textBtn}
          onPress={() => handlePress(onContinueAsGuest)}
          haptic="light"
        >
          <Text style={[styles.textBtnText, { color: colors.textMuted }]}>
            {t.guest_mode}
          </Text>
        </PressableScale>
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
  utilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  utilityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  illustrationBg: {
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  radarCircle: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 999,
    borderStyle: 'dashed',
  },
  centerGraphic: {
    width: 100,
    height: 100,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    position: 'relative',
  },
  phoneOverlay: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  floatIcon: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  iconSat: {
    top: 36,
    left: 40,
  },
  iconDrone: {
    top: 48,
    right: 42,
  },
  iconAI: {
    bottom: 40,
    left: 48,
  },
  iconPlant: {
    bottom: 36,
    right: 48,
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  desc: {
    fontSize: 14.5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22.5,
    paddingHorizontal: 8,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
    marginTop: 'auto',
  },
  primaryBtn: {
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
  primaryGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  textBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  textBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
