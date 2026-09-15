import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations } from '@/constants/Translations';
import * as Haptics from 'expo-haptics';
import { verifyOTP } from '@/utils/api';

interface StepOTPProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  phoneNumber: string;
  onNext: () => void;
  onPrev: () => void;
  onGoToStep: (step: number) => void;
}

export default function StepOTP({
  language,
  scheme,
  phoneNumber,
  onNext,
  onPrev,
  onGoToStep,
}: StepOTPProps) {
  const colors = Colors[scheme];
  const t = Translations[language];
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<any>(null);

  // Countdown timer effect
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Autofocus input
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const handleOtpChange = async (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    if (cleanText.length <= 6) {
      setOtp(cleanText);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      // If full 6 digits are entered, verify via backend
      if (cleanText.length === 6) {
        Keyboard.dismiss();
        setVerifying(true);

        try {
          const result = await verifyOTP(phoneNumber, cleanText);
          if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            setTimeout(() => {
              setVerifying(false);
              onNext();
            }, 500);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            setVerifying(false);
            Alert.alert('Invalid OTP', result.message);
            setOtp('');
          }
        } catch (error) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          setVerifying(false);
          Alert.alert('Verification Error', error instanceof Error ? error.message : 'Failed to verify OTP');
          setOtp('');
        }
      }
    }
  };

  const handleResend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setOtp('');
    setTimer(30);
    inputRef.current?.focus();
  };

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    callback();
  };

  const maskedNumber = `+91 ${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5)}`;

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
        <Text style={[styles.titleText, { color: colors.text }]}>{t.otp_title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Info card */}
        <View style={styles.headerSection}>
          <View style={[styles.phoneBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Feather name="message-square" size={16} color={colors.accent} />
            <Text style={[styles.phoneBadgeText, { color: colors.textSecondary }]}>{maskedNumber}</Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t.otp_desc} <Text style={{ color: colors.text, fontWeight: '700' }}>{maskedNumber}</Text>
          </Text>
        </View>

        {/* OTP Input Grid */}
        <View style={styles.otpGridWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            value={otp}
            onChangeText={handleOtpChange}
            maxLength={6}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            editable={!verifying}
          />
          <TouchableOpacity 
            style={styles.otpBoxesContainer} 
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
          >
            {[0, 1, 2, 3, 4, 5].map(index => {
              const char = otp[index] || '';
              const isCurrent = index === otp.length;
              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isCurrent ? colors.accent : colors.borderStrong,
                      shadowColor: colors.accent,
                      shadowOpacity: isCurrent ? 0.08 : 0,
                    },
                  ]}
                >
                  {verifying ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <Text style={[styles.otpChar, { color: colors.text }]}>{char}</Text>
                  )}
                  {isCurrent && !verifying && (
                    <View style={[styles.cursor, { backgroundColor: colors.accent }]} />
                  )}
                </View>
              );
            })}
          </TouchableOpacity>
        </View>

        {/* Verification Loader Overlay */}
        {verifying && (
          <View style={styles.verifyingIndicator}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.verifyingText, { color: colors.textSecondary }]}>
              Securing connections...
            </Text>
          </View>
        )}
      </View>

      {/* Footer controls */}
      <View style={styles.footer}>
        <View style={styles.controlsRow}>
          {timer > 0 ? (
            <Text style={[styles.timerText, { color: colors.textMuted }]}>
              Resend OTP in <Text style={{ color: colors.text, fontWeight: '700' }}>{timer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity 
              style={[styles.resendBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} 
              onPress={handleResend}
              activeOpacity={0.8}
            >
              <Feather name="refresh-cw" size={14} color={colors.accent} />
              <Text style={[styles.resendBtnText, { color: colors.accent }]}>
                {t.resend_btn}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => handlePress(() => onGoToStep(6))}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={12} color={colors.textSecondary} />
            <Text style={[styles.editBtnText, { color: colors.textSecondary }]}>
              {t.edit_num}
            </Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 36,
  },
  headerSection: {
    alignItems: 'center',
    gap: 12,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  phoneBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    fontSize: 14.5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  otpGridWrapper: {
    position: 'relative',
    height: 64,
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 2,
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 1,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  otpChar: {
    fontSize: 20,
    fontWeight: '800',
  },
  cursor: {
    position: 'absolute',
    bottom: 12,
    width: 14,
    height: 2.5,
    borderRadius: 1,
  },
  verifyingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  verifyingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  timerText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
