import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, useWindowDimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations } from '@/constants/Translations';
import * as Haptics from 'expo-haptics';
import { sendOTP } from '@/utils/api';

interface StepAuthProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  mode: 'signup' | 'login';
  phoneNumber: string;
  onChangePhoneNumber: (num: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onGoogleAuth: () => void;
  onContinueAsGuest: () => void;
}

export default function StepAuth({
  language,
  scheme,
  mode,
  phoneNumber,
  onChangePhoneNumber,
  onNext,
  onPrev,
  onGoogleAuth,
  onContinueAsGuest,
}: StepAuthProps) {
  const colors = Colors[scheme];
  const t = Translations[language];
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { width } = useWindowDimensions();
  const effectiveWidth = Math.min(width, 480);
  const illustrationWidth = effectiveWidth - 80;

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    callback();
  };

  const handleSendOTP = async () => {
    if (!isPhoneValid) return;

    setIsLoading(true);
    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        handlePress(onNext);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    // Keep only numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    if (cleanText.length <= 10) {
      onChangePhoneNumber(cleanText);
    }
  };

  const isPhoneValid = phoneNumber.length === 10;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.inner}>
        {/* Top navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handlePress(onPrev)}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.titleText, { color: colors.text }]}>{mode === 'login' ? t.login : t.sign_up}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Minimal sunset illustration */}
        <View style={styles.illustrationContainer}>
          <LinearGradient
            colors={scheme === 'dark' ? ['#0e2a14', '#050e07'] : ['#e8f5e9', '#f8faf7']}
            style={[styles.sunIllustration, { width: illustrationWidth }]}
          >
            <View style={[styles.sunCircle, { backgroundColor: scheme === 'dark' ? '#fbbf24' : '#ffb74d' }]} />
            <View style={[styles.cloud, { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)', top: 40, left: 60 }]} />
            <View style={[styles.cloud, { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)', top: 60, right: 50, width: 90, height: 26 }]} />
            <Feather name="shield" size={48} color={colors.accent} style={styles.shieldIcon} />
          </LinearGradient>
        </View>

        {/* Form Container */}
        <View style={styles.formSection}>
          <Text style={[styles.welcomeSubText, { color: colors.textSecondary }]}>
            {t.auth_desc}
          </Text>

          {/* Phone Input Box */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t.phone_label}</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderColor: isFocused ? colors.accent : colors.borderStrong,
                  shadowColor: colors.accent,
                  shadowOpacity: isFocused ? 0.08 : 0,
                },
              ]}
            >
              <Text style={[styles.countryCode, { color: colors.textMuted }]}>+91</Text>
              <View style={[styles.separator, { backgroundColor: colors.borderStrong }]} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t.phone_placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={10}
              />
              {isPhoneValid && (
                <Feather name="check-circle" size={18} color={colors.accent} style={styles.validCheck} />
              )}
            </View>
          </View>

          {/* Send OTP button */}
          <TouchableOpacity
            style={[styles.sendOtpBtn, { opacity: (isPhoneValid && !isLoading) ? 1 : 0.65 }]}
            onPress={handleSendOTP}
            disabled={!isPhoneValid || isLoading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={colors.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.sendOtpText}>{t.send_otp}</Text>
                  <Feather name="arrow-right" size={18} color="#ffffff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: colors.borderStrong }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
          <View style={[styles.line, { backgroundColor: colors.borderStrong }]} />
        </View>

        {/* Social / Guest buttons */}
        <View style={styles.socialSection}>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}
            onPress={() => handlePress(onGoogleAuth)}
            activeOpacity={0.8}
          >
            <FontAwesome name="google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
            <Text style={[styles.socialBtnText, { color: colors.text }]}>{t.google_btn}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestLink}
            onPress={() => handlePress(onContinueAsGuest)}
            activeOpacity={0.7}
          >
            <Text style={[styles.guestLinkText, { color: colors.textMuted }]}>{t.guest_mode}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
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
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  sunIllustration: {
    height: 140,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCircle: {
    position: 'absolute',
    bottom: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cloud: {
    position: 'absolute',
    width: 70,
    height: 22,
    borderRadius: 11,
  },
  shieldIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  formSection: {
    gap: 20,
  },
  welcomeSubText: {
    fontSize: 14.5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '800',
  },
  separator: {
    width: 1.5,
    height: 20,
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  validCheck: {
    marginLeft: 8,
  },
  sendOtpBtn: {
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
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendOtpText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '700',
  },
  socialSection: {
    gap: 16,
    alignItems: 'center',
  },
  socialBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  guestLink: {
    paddingVertical: 4,
  },
  guestLinkText: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
