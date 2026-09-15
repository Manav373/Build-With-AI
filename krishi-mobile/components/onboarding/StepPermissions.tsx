import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, Modal, Animated } from 'react-native';
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

type PermissionStatus = 'granted' | 'denied' | 'prompt';

interface PermissionItem {
  id: 'location' | 'camera' | 'microphone' | 'notification';
  icon: string;
  color: string;
  title: string;
  reason: string;
  checkFn: () => Promise<PermissionStatus>;
  requestFn: () => Promise<PermissionStatus>;
}

interface NotificationAlert {
  id: number;
  title: string;
  body: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  permissionId?: string;
}

export default function StepPermissions({ language, scheme, onNext, onPrev }: StepPermissionsProps) {
  const colors = Colors[scheme];
  const t = Translations[language];

  // Real permission statuses: 'granted' | 'denied' | 'prompt'
  const [permissionStates, setPermissionStates] = useState<Record<string, PermissionStatus>>({
    location: 'prompt',
    camera: 'prompt',
    microphone: 'prompt',
    notification: 'prompt',
  });

  // In-app floating real notification banner
  const [activeNotification, setActiveNotification] = useState<NotificationAlert | null>(null);
  const notificationAnim = useRef(new Animated.Value(-140)).current;
  const timerRef = useRef<any>(null);

  // Settings help modal
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [selectedDeniedPermission, setSelectedDeniedPermission] = useState<string | null>(null);

  // Play audio chime for notifications (web-safe)
  const playAlertSound = (type: 'danger' | 'warning' | 'success' | 'info') => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          if (type === 'danger' || type === 'warning') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.28);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
          } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          }

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (e) {
        // AudioContext autoplay restrictions or unsupported
      }
    }
  };

  // Trigger both a real native notification (if supported) & floating banner
  const triggerNotification = (
    title: string,
    body: string,
    type: 'danger' | 'warning' | 'success' | 'info',
    permissionId?: string
  ) => {
    // 1. Play feedback sound & haptic
    playAlertSound(type);
    if (type === 'danger' || type === 'warning') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    // 2. Trigger real OS/Browser Notification if permitted
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.Notification.permission === 'granted'
    ) {
      try {
        new window.Notification(title, {
          body,
          icon: '/favicon.png',
        });
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }

    // 3. Show prominent in-app real notification alert banner
    setActiveNotification({
      id: Date.now(),
      title,
      body,
      type,
      permissionId,
    });

    // Slide banner in
    Animated.spring(notificationAnim, {
      toValue: 12,
      tension: 70,
      friction: 9,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // Auto-dismiss after 6.5 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dismissNotification();
    }, 6500);
  };

  const dismissNotification = () => {
    Animated.timing(notificationAnim, {
      toValue: -140,
      duration: 250,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setActiveNotification(null);
    });
  };

  // --- Real Permission Check Functions ---
  const checkLocationPermission = async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.permissions?.query) {
        const queryRes = await navigator.permissions.query({ name: 'geolocation' });
        return queryRes.state === 'granted' ? 'granted' : queryRes.state === 'denied' ? 'denied' : 'prompt';
      }
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'prompt';
    } catch {
      return 'prompt';
    }
  };

  const checkCameraPermission = async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.permissions?.query) {
        try {
          const queryRes = await (navigator.permissions as any).query({ name: 'camera' });
          return queryRes.state === 'granted' ? 'granted' : queryRes.state === 'denied' ? 'denied' : 'prompt';
        } catch {
          // Camera query not supported in all browsers
        }
      }
      const { status } = await Camera.Camera.getCameraPermissionsAsync();
      return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'prompt';
    } catch {
      return 'prompt';
    }
  };

  const checkMicrophonePermission = async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.permissions?.query) {
        try {
          const queryRes = await (navigator.permissions as any).query({ name: 'microphone' });
          return queryRes.state === 'granted' ? 'granted' : queryRes.state === 'denied' ? 'denied' : 'prompt';
        } catch {
          // Mic query not supported in all browsers
        }
      }
      const { status } = await Camera.Camera.getMicrophonePermissionsAsync();
      return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'prompt';
    } catch {
      return 'prompt';
    }
  };

  const checkNotificationPermission = async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
        if (window.Notification.permission === 'granted') return 'granted';
        if (window.Notification.permission === 'denied') return 'denied';
        return 'prompt';
      }
      return 'prompt';
    } catch {
      return 'prompt';
    }
  };

  // --- Real Permission Request Functions ---
  const requestLocation = async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise<PermissionStatus>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve('granted'),
            (err) => {
              // error code 1 is PERMISSION_DENIED
              resolve(err.code === 1 ? 'denied' : 'denied');
            },
            { timeout: 9000, enableHighAccuracy: true }
          );
        });
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'prompt';
    } catch {
      return 'denied';
    }
  };

  const requestCamera = async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
          return 'granted';
        } catch (err: any) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            return 'denied';
          }
          return 'denied';
        }
      }
      const { status } = await Camera.Camera.requestCameraPermissionsAsync();
      return status === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  };

  const requestMicrophone = async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          return 'granted';
        } catch (err: any) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            return 'denied';
          }
          return 'denied';
        }
      }
      const { status } = await Camera.Camera.requestMicrophonePermissionsAsync();
      return status === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  };

  const requestNotificationPermission = async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
        const result = await window.Notification.requestPermission();
        if (result === 'granted') {
          return 'granted';
        } else if (result === 'denied') {
          return 'denied';
        }
        return 'prompt';
      }
      return 'granted';
    } catch {
      return 'denied';
    }
  };

  // Check all permissions automatically
  const checkAllPermissions = async () => {
    const [loc, cam, mic, notif] = await Promise.all([
      checkLocationPermission(),
      checkCameraPermission(),
      checkMicrophonePermission(),
      checkNotificationPermission(),
    ]);

    setPermissionStates({
      location: loc,
      camera: cam,
      microphone: mic,
      notification: notif,
    });
  };

  // On mount and window focus: automatically detect permission status
  useEffect(() => {
    checkAllPermissions();

    // Re-check when window gains focus (user came back from browser/OS settings)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleFocus = () => {
        checkAllPermissions();
      };
      window.addEventListener('focus', handleFocus);

      // Listen to live permission changes if supported
      if (navigator.permissions?.query) {
        ['geolocation', 'camera', 'microphone'].forEach((name) => {
          navigator.permissions
            .query({ name: name as any })
            .then((statusObj) => {
              statusObj.onchange = () => {
                checkAllPermissions();
              };
            })
            .catch(() => {});
        });
      }

      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, []);

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    callback();
  };

  // Handle single permission card click
  const handleRequestPermission = async (
    id: 'location' | 'camera' | 'microphone' | 'notification',
    title: string,
    reason: string,
    requestFn: () => Promise<PermissionStatus>
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const status = await requestFn();
    setPermissionStates((prev) => ({ ...prev, [id]: status }));

    if (status === 'granted') {
      if (id === 'notification') {
        triggerNotification(
          '🔔 Real Notifications Activated!',
          'You will now receive instant weather alerts, mandi price dips, and crop advisories.',
          'success',
          id
        );
      } else {
        triggerNotification(`✅ ${title} Allowed`, `Successfully enabled: ${reason}`, 'success', id);
      }
    } else if (status === 'denied') {
      // Automatically detected NOT ALLOWED -> Send real notification
      triggerNotification(
        `⚠️ ${title} Not Allowed`,
        `Access was denied. Please allow ${title.toLowerCase()} in your browser/device settings to use this feature.`,
        'danger',
        id
      );
    }
  };

  // Bottom action: "Allow Access ->"
  const handleAllowAllAccess = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    // Request permissions that are not yet granted
    const results: Record<string, PermissionStatus> = { ...permissionStates };

    if (results.location !== 'granted') {
      results.location = await requestLocation();
    }
    if (results.camera !== 'granted') {
      results.camera = await requestCamera();
    }
    if (results.microphone !== 'granted') {
      results.microphone = await requestMicrophone();
    }
    if (results.notification !== 'granted') {
      results.notification = await requestNotificationPermission();
    }

    setPermissionStates(results);

    // Detect if any permission is denied (not allowed)
    const deniedItems = Object.entries(results).filter(([_, s]) => s === 'denied');

    if (deniedItems.length > 0) {
      const names = deniedItems
        .map(([key]) => {
          if (key === 'location') return 'Location';
          if (key === 'camera') return 'Camera';
          if (key === 'microphone') return 'Microphone';
          if (key === 'notification') return 'Notifications';
          return key;
        })
        .join(', ');

      triggerNotification(
        `⚠️ ${deniedItems.length} Permission(s) Not Allowed`,
        `${names} blocked. Enable in settings anytime or tap Skip to continue.`,
        'warning'
      );
    } else {
      triggerNotification(
        '🌾 All Permissions Granted!',
        'KrishiAI is fully configured for real-time agricultural intelligence.',
        'success'
      );
      setTimeout(() => {
        onNext();
      }, 1200);
    }
  };

  const permissionItems: PermissionItem[] = [
    {
      id: 'location',
      icon: 'map-pin',
      color: colors.accent,
      title: t.permissions.location.title,
      reason: t.permissions.location.reason,
      checkFn: checkLocationPermission,
      requestFn: requestLocation,
    },
    {
      id: 'camera',
      icon: 'camera',
      color: colors.green,
      title: t.permissions.camera.title,
      reason: t.permissions.camera.reason,
      checkFn: checkCameraPermission,
      requestFn: requestCamera,
    },
    {
      id: 'microphone',
      icon: 'mic',
      color: colors.warning,
      title: t.permissions.microphone.title,
      reason: t.permissions.microphone.reason,
      checkFn: checkMicrophonePermission,
      requestFn: requestMicrophone,
    },
    {
      id: 'notification',
      icon: 'bell',
      color: colors.danger,
      title: t.permissions.notification.title,
      reason: t.permissions.notification.reason,
      checkFn: checkNotificationPermission,
      requestFn: requestNotificationPermission,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Real Floating Notification Alert Banner */}
      {activeNotification && (
        <Animated.View
          style={[
            styles.notificationBanner,
            {
              transform: [{ translateY: notificationAnim }],
              backgroundColor:
                activeNotification.type === 'danger'
                  ? '#dc2626'
                  : activeNotification.type === 'warning'
                  ? '#d97706'
                  : '#16a34a',
            },
          ]}
        >
          <View style={styles.notificationHeader}>
            <View style={styles.notificationTitleRow}>
              <Feather
                name={
                  activeNotification.type === 'danger'
                    ? 'alert-circle'
                    : activeNotification.type === 'warning'
                    ? 'alert-triangle'
                    : 'check-circle'
                }
                size={18}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {activeNotification.title}
              </Text>
            </View>
            <TouchableOpacity onPress={dismissNotification} style={styles.notificationCloseBtn}>
              <Feather name="x" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.notificationBody}>{activeNotification.body}</Text>

          {activeNotification.type === 'danger' && (
            <TouchableOpacity
              style={styles.notificationActionBtn}
              onPress={() => {
                setSelectedDeniedPermission(activeNotification.title);
                setHelpModalVisible(true);
              }}
            >
              <Text style={styles.notificationActionText}>How to allow in browser settings →</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

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
        {permissionItems.map((item) => {
          const status = permissionStates[item.id];
          const isGranted = status === 'granted';
          const isDenied = status === 'denied';

          return (
            <View
              key={item.id}
              style={[
                styles.permissionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isGranted ? colors.accent : isDenied ? '#ef4444' : colors.border,
                  borderWidth: isDenied ? 2 : 1.5,
                  shadowColor: colors.text,
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrapper,
                  {
                    backgroundColor: isDenied ? '#fee2e2' : `${item.color}15`,
                  },
                ]}
              >
                <Feather
                  name={isDenied ? 'slash' : (item.icon as any)}
                  size={22}
                  color={isDenied ? '#dc2626' : item.color}
                />
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  {isGranted && (
                    <View style={[styles.statusTag, { backgroundColor: colors.accentSoft }]}>
                      <Feather name="check" size={10} color={colors.accent} style={{ marginRight: 3 }} />
                      <Text style={[styles.statusText, { color: colors.accent }]}>Active</Text>
                    </View>
                  )}
                  {isDenied && (
                    <View style={[styles.statusTag, { backgroundColor: '#fee2e2' }]}>
                      <Feather name="alert-circle" size={10} color="#dc2626" style={{ marginRight: 3 }} />
                      <Text style={[styles.statusText, { color: '#dc2626' }]}>Not Allowed</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardReason, { color: colors.textSecondary }]}>{item.reason}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.allowCardBtn,
                  {
                    backgroundColor: isGranted
                      ? 'transparent'
                      : isDenied
                      ? '#fef2f2'
                      : colors.surfaceElevated,
                    borderColor: isGranted
                      ? 'transparent'
                      : isDenied
                      ? '#f87171'
                      : colors.borderStrong,
                    borderWidth: isGranted ? 0 : 1,
                  },
                ]}
                onPress={() => {
                  if (isDenied) {
                    setSelectedDeniedPermission(item.title);
                    setHelpModalVisible(true);
                  } else {
                    handleRequestPermission(item.id, item.title, item.reason, item.requestFn);
                  }
                }}
                disabled={isGranted}
                activeOpacity={0.8}
              >
                {isGranted ? (
                  <Feather name="check-circle" size={22} color={colors.accent} />
                ) : isDenied ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Feather name="lock" size={12} color="#dc2626" />
                    <Text style={[styles.allowCardBtnText, { color: '#dc2626' }]}>Blocked</Text>
                  </View>
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
          onPress={handleAllowAllAccess}
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

      {/* Browser / Device Settings Unblock Guide Modal */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconWrapper}>
              <Feather name="shield" size={28} color="#dc2626" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Permission Blocked
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              {selectedDeniedPermission || 'Access'} was blocked by your browser or device settings.
            </Text>

            <View style={[styles.stepsBox, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[styles.stepItem, { color: colors.text }]}>
                1. Click the <Text style={{ fontWeight: '700' }}>🔒 Lock icon</Text> or tune icon on the left side of your browser address bar.
              </Text>
              <Text style={[styles.stepItem, { color: colors.text }]}>
                2. Find <Text style={{ fontWeight: '700' }}>{selectedDeniedPermission || 'Permission'}</Text> and change it to <Text style={{ fontWeight: '700', color: colors.accent }}>Allow</Text>.
              </Text>
              <Text style={[styles.stepItem, { color: colors.text }]}>
                3. Return to this tab and the app will <Text style={{ fontWeight: '700' }}>automatically detect</Text> the change!
              </Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalSecondaryBtn, { borderColor: colors.border }]}
                onPress={() => setHelpModalVisible(false)}
              >
                <Text style={[styles.modalSecondaryText, { color: colors.textSecondary }]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  setHelpModalVisible(false);
                  checkAllPermissions();
                }}
              >
                <Text style={styles.modalPrimaryText}>Check Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    position: 'relative',
  },
  notificationBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  notificationCloseBtn: {
    padding: 4,
    marginLeft: 8,
  },
  notificationBody: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    opacity: 0.95,
  },
  notificationActionBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  notificationActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
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
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
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
    minWidth: 72,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  stepsBox: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    gap: 10,
    marginBottom: 20,
  },
  stepItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalSecondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
