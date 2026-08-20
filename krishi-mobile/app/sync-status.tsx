import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, SectionTitle, GlassCard, ListRow } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';

export default function SyncStatusScreen() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  const [syncing, setSyncing] = useState(false);

  const linkedDevices = [
    { name: 'Realme 9 Pro Max (Phone)', status: 'Active Now', date: 'Online', icon: 'smartphone', active: true },
    { name: 'KrishiAI Web Dashboard (Laptop)', status: 'Connected', date: 'Synced 1 hour ago', icon: 'monitor', active: false },
    { name: 'KVK Shared Tablet', status: 'Standby', date: 'Synced June 10', icon: 'tablet', active: false },
  ];

  const handleForceSync = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setSyncing(true);

    setTimeout(() => {
      setSyncing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Backup Successful', 'Local databases and scans successfully synced to KrishiAI Cloud.');
    }, 1800);
  };

  return (
    <Screen title="Device Sync" emoji="🔄" subtitle="Cloud Backup & Conflict checks" back>
      {/* Sync Hero Card */}
      <FadeInUp index={0}>
        <LinearGradient
          colors={scheme === 'dark' ? ['#0e2a14', '#050e07'] : ['#f0fdf4', '#ffffff']}
          style={[styles.heroCard, { borderColor: colors.border }]}
        >
          <View style={styles.heroRow}>
            <View>
              <Text style={[t.overline, { color: colors.textSecondary }]}>SYNC STATUS</Text>
              <Text style={[t.displayMedium, { color: colors.text, marginTop: 2 }]}>Database Fully Synced</Text>
            </View>
            <Feather name="cloud-lightning" size={28} color={colors.accent} />
          </View>
          <Text style={[t.bodySmall, { color: colors.textSecondary, marginTop: 8, lineHeight: 18 }]}>
            All disease diagnoses, mandi prices, and soil boundaries are stored in local offline DB and encrypted in cloud backup.
          </Text>
        </LinearGradient>
      </FadeInUp>

      {/* Sync Trigger button */}
      <FadeInUp index={1}>
        <PressableScale onPress={handleForceSync} disabled={syncing} haptic="medium">
          <LinearGradient colors={colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.syncBtn}>
            {syncing ? (
              <>
                <Feather name="refresh-cw" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.syncBtnText}>Syncing...</Text>
              </>
            ) : (
              <>
                <Feather name="refresh-cw" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.syncBtnText}>Sync Cloud Data Now</Text>
              </>
            )}
          </LinearGradient>
        </PressableScale>
      </FadeInUp>

      {/* Linked Devices list */}
      <SectionTitle>Linked Device Session Logs</SectionTitle>
      <FadeInUp index={2}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            {linkedDevices.map((device, idx) => (
              <ListRow key={device.name} icon={device.icon as any} iconColor={device.active ? colors.accent : colors.textMuted} label={device.name} subtitle={`${device.status} • ${device.date}`} trailing={device.active ? <View style={[styles.activeDot, { backgroundColor: colors.accent }]} /> : undefined} divider={idx < linkedDevices.length - 1} />
            ))}
          </View>
        </GlassCard>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { padding: 20, borderRadius: 22, borderWidth: 1.5 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  syncBtn: { height: 48, borderRadius: 24, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  syncBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
});
