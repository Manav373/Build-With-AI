import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, SectionTitle, GlassCard, ListRow } from '@/components/ui/Screen';
import { PressableScale, FadeInUp, Pulse, Counter } from '@/components/ui/Motion';

export default function OfflineScreen() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [pendingItems, setPendingItems] = useState(3);

  const handleSync = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsSyncing(true);
    setSyncDone(false);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      setPendingItems(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Sync Complete', 'All offline scans and tasks successfully updated to KrishiAI cloud.');
    }, 1800);
  };

  const offlineReports = [
    { title: 'Farm Health Report - June 22', date: 'Downloaded today', size: '1.2 MB' },
    { title: 'Wheat APMC Trends (Karnal)', date: 'Downloaded June 20', size: '840 KB' },
    { title: 'Farming Pesticide Manual', date: 'Downloaded June 15', size: '3.4 MB' },
  ];

  return (
    <Screen title="Offline Hub" emoji="🔌" subtitle="Offline database & cache" back>
      {/* Connection status */}
      <FadeInUp index={0}>
        <LinearGradient
          colors={scheme === 'dark' ? ['#27272a', '#09090b'] : ['#f4f4f5', '#e4e4e7']}
          style={[styles.statusStrip, { borderColor: colors.border }]}
        >
          <View style={styles.statusDotRow}>
            <Pulse active style={{ marginRight: 4 }}>
              <View style={[styles.statusDot, { backgroundColor: colors.danger }]} />
            </Pulse>
            <Text style={[t.bodyStrong, { color: colors.text }]}>No Internet Connection</Text>
          </View>
          <Text style={[t.caption, { color: colors.textSecondary, paddingLeft: 16, marginTop: 2 }]}>Running in Offline Local Mode</Text>
        </LinearGradient>
      </FadeInUp>

      {/* Sync queue card */}
      <SectionTitle>Data Synchronization</SectionTitle>
      <FadeInUp index={1}>
        <GlassCard>
          <View style={styles.syncHeader}>
            <Feather name="refresh-cw" size={22} color={colors.accent} />
            <View style={styles.syncHeaderText}>
              <Text style={[t.bodyStrong, { color: colors.text }]}>Pending Backup</Text>
              <Text style={[t.caption, { color: colors.textSecondary, marginTop: 1 }]}>
                {pendingItems > 0 ? (
                  <>
                    <Counter value={pendingItems} /> items pending
                  </>
                ) : (
                  'All synced'
                )}
              </Text>
            </View>
          </View>

          {pendingItems > 0 && (
            <View style={styles.pendingList}>
              <View style={styles.pendingRow}>
                <Feather name="camera" size={13} color={colors.textMuted} />
                <Text style={[t.caption, { color: colors.textSecondary }]}>2 Disease Scans (Offline Diagnose pending)</Text>
              </View>
              <View style={styles.pendingRow}>
                <Feather name="check-circle" size={13} color={colors.textMuted} />
                <Text style={[t.caption, { color: colors.textSecondary }]}>1 Daily Task complete mark</Text>
              </View>
            </View>
          )}

          <PressableScale
            onPress={handleSync}
            disabled={pendingItems === 0 || isSyncing}
            haptic="medium"
            style={[styles.syncBtn, { opacity: pendingItems === 0 || isSyncing ? 0.65 : 1 }]}
          >
            <LinearGradient colors={colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.syncGradient}>
              {isSyncing ? (
                <>
                  <Feather name="upload" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.syncBtnText}>Uploading Scans...</Text>
                </>
              ) : (
                <>
                  <Feather name="upload" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.syncBtnText}>Sync Cloud Data</Text>
                </>
              )}
            </LinearGradient>
          </PressableScale>
        </GlassCard>
      </FadeInUp>

      {/* Storage stats */}
      <SectionTitle>Local Device Storage</SectionTitle>
      <FadeInUp index={2}>
        <GlassCard>
          <View style={styles.storageBarRow}>
            <View style={[styles.storageBarTrack, { backgroundColor: colors.surfaceElevated }]}>
              <View style={[styles.storageBarFill, { backgroundColor: colors.accent }]} />
            </View>
            <Text style={[t.caption, { color: colors.textSecondary }]}>5.4 MB / 50.0 MB</Text>
          </View>
          <Text style={[t.caption, { color: colors.textMuted, marginTop: 8, lineHeight: 16 }]}>
            Storage resets every 30 days automatically.
          </Text>
        </GlassCard>
      </FadeInUp>

      {/* Offline Reports list */}
      <SectionTitle>Downloaded Reports</SectionTitle>
      <FadeInUp index={3}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            {offlineReports.map((rep, idx) => (
              <ListRow key={rep.title} icon="file-text" iconColor={colors.accent} label={rep.title} subtitle={`${rep.date} • ${rep.size}`} trailing={<PressableScale onPress={() => Alert.alert('Delete', `Remove ${rep.title}?`)} haptic="light"><Feather name="trash-2" size={16} color={colors.danger} /></PressableScale>} divider={idx < offlineReports.length - 1} />
            ))}
          </View>
        </GlassCard>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusStrip: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statusDotRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  syncHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  syncHeaderText: { gap: 2, flex: 1 },
  pendingList: { gap: 8, paddingHorizontal: 4, paddingVertical: 8 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  syncBtn: { height: 48, borderRadius: 24, overflow: 'hidden', marginTop: 8 },
  syncGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  syncBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  storageBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storageBarTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  storageBarFill: { height: '100%', width: '12%', borderRadius: 4 },
});
