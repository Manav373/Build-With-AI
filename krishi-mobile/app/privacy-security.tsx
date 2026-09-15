import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, SectionTitle, GlassCard, ListRow } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { Switch } from '@/components/ui/FormPrimitives';
import { Feather } from '@expo/vector-icons';

export default function PrivacySecurityScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  const [biometrics, setBiometrics] = useState(true);
  const [pinLock, setPinLock] = useState(false);

  const handleToggleBiometrics = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setBiometrics(val);
  };

  const handleTogglePin = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPinLock(val);
    if (val) {
      Alert.alert('PIN Code Setup', 'Setup App PIN form triggered.');
    }
  };

  const handleExportData = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Export Started', 'All farm records and scans are compiling into a ZIP archive.');
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      'Caution',
      'Are you sure you want to permanently delete your KrishiAI account? This deletes all farm telemetry and is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Deleted', 'Account deleted.') },
      ]
    );
  };

  return (
    <Screen title="Privacy & Safety" emoji="🔒" subtitle="Security Gates & Data Controls" back>
      <SectionTitle>Access Gates</SectionTitle>
      <FadeInUp index={0}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            <ListRow icon="lock" iconColor={colors.accent} label="Biometric Fingerprint Lock" subtitle="Protect entry with device fingerprint scanner" trailing={<Switch value={biometrics} onValueChange={handleToggleBiometrics} />} divider />
            <ListRow icon="shield" iconColor="#64748b" label="Custom 4-Digit App PIN" subtitle="Lock application behind numeric passcode" trailing={<Switch value={pinLock} onValueChange={handleTogglePin} />} />
          </View>
        </GlassCard>
      </FadeInUp>

      <SectionTitle>Active Signed-in Devices</SectionTitle>
      <FadeInUp index={1}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            <ListRow icon="smartphone" iconColor={colors.accent} label="Realme 9 Pro Max (This Phone)" subtitle="Karnal, Haryana • Active now" divider />
            <ListRow icon="tablet" iconColor={colors.textMuted} label="KVK Shared Farmer Tablet" subtitle="Rampur Agri Hub • Logged out June 10" />
          </View>
        </GlassCard>
      </FadeInUp>

      <SectionTitle>Data Archiving Controls</SectionTitle>
      <FadeInUp index={2}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            <ListRow icon="download" iconColor="#3b82f6" label="Export All Farming Records" onPress={handleExportData} divider />
            <ListRow icon="trash-2" iconColor={colors.danger} label="Delete KrishiAI Account" danger onPress={handleDeleteAccount} />
          </View>
        </GlassCard>
      </FadeInUp>
    </Screen>
  );
}
