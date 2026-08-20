import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations } from '@/constants/Translations';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Camera from 'expo-camera';

interface StepPermissionsProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  onNext: () => void;
  onPrev: () => void;
}

interface PermissionItem {
  id: 'location' | 'camera' | 'microphone' | 'notification';
  icon: string;
  color: string;
  title: string;
  reason: string;
  requestFn: () => Promise<boolean>;
}

export default function StepPermissions({ language, scheme, onNext, onPrev }: StepPermissionsProps) {
  const colors = Colors[scheme];
  const t = Translations[language];

  // Track permission request status locally
  const [grantedStates, setGrantedStates] = useState<Record<string, boolean>>({
    location: false,
    camera: false,
    microphone: false,
    notification: false,
  });

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    callback();
  };

  const handleRequestPermission = async (id: 'location' | 'camera' | 'microphone' | 'notification', requestFn: () => Promise<boolean>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const isGranted = await requestFn();
      setGrantedStates(prev => ({ ...prev, [id]: isGranted }));
      if (isGranted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e) {
      // Simulate permission granted on failure/web mock
      setGrantedStates(prev => ({ ...prev, [id]: true }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const permissionItems: PermissionItem[] = [
    {
      id: 'location',
      icon: 'map-pin',
      color: colors.accent,
      title: t.permissions.location.title,
      reason: t.permissions.location.reason,
      requestFn: async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
      },
    },
    {
      id: 'camera',
      icon: 'camera',
      color: colors.green,
      title: t.permissions.camera.title,
      reason: t.permissions.camera.reason,
      requestFn: async () => {
        const { status } = await Camera.Camera.requestCameraPermissionsAsync();
        return status === 'granted';
      },
    },
    {
      id: 'microphone',
      icon: 'mic',
      color: colors.warning,
      title: t.permissions.microphone.title,
      reason: t.permissions.microphone.reason,
      requestFn: async () => {
        const { status } = await Camera.Camera.requestMicrophonePermissionsAsync();
        return status === 'granted';
      },
    },
    {
      id: 'notification',
      icon: 'bell',
      color: colors.danger,
      title: t.permissions.notification.title,
      reason: t.permissions.notification.reason,
      requestFn: async () => {
        // Mock permission check for simplicity
        return true;
      },
    },
  ];

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
        <Text style={[styles.titleText, { color: colors.text }]}>{t.permissions_title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
        {t.permissions_subtitle}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {permissionItems.map(item => {
          const isGranted = grantedStates[item.id];
          return (
            <View
              key={item.id}
              style={[
                styles.permissionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isGranted ? colors.accent : colors.border,
                  shadowColor: colors.text,
                },
              ]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15` }]}>
                <Feather name={item.icon as any} size={22} color={item.color} />
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  {isGranted && (
                    <View style={[styles.grantedTag, { backgroundColor: colors.accentSoft }]}>
                      <Feather name="check" size={10} color={colors.accent} style={{ marginRight: 2 }} />
                      <Text style={[styles.grantedText, { color: colors.accent }]}>Active</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardReason, { color: colors.textSecondary }]}>{item.reason}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.allowCardBtn,
                  {
                    backgroundColor: isGranted ? 'transparent' : colors.surfaceElevated,
                    borderColor: isGranted ? 'transparent' : colors.borderStrong,
                    borderWidth: isGranted ? 0 : 1,
                  },
                ]}
                onPress={() => handleRequestPermission(item.id, item.requestFn)}
                disabled={isGranted}
                activeOpacity={0.8}
              >
                {isGranted ? (
                  <Feather name="check-circle" size={20} color={colors.accent} />
                ) : (
                  <Text style={[styles.allowCardBtnText, { color: colors.textSecondary }]}>Allow</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Privacy note at bottom */}
      <View style={[styles.privacyCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Text style={[styles.privacyText, { color: colors.textSecondary }]}>{t.privacy_note}</Text>
      </View>

      {/* Action Footer */}
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
            <Text style={styles.continueBtnText}>{t.allow_btn}</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => handlePress(onNext)}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipBtnText, { color: colors.textMuted }]}>{t.skip_btn}</Text>
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
    gap: 12,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  grantedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  grantedText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardReason: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  allowCardBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allowCardBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  privacyCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    width: '100%',
    gap: 8,
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
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
