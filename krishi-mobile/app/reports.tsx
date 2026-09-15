import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Screen, SectionTitle, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';

export default function ReportsScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('7days');

  const reportCategories = [
    { id: 'disease', label: 'AI Disease Scans', count: '12 scans', icon: 'camera', color: colors.danger },
    { id: 'weather', label: 'Meteorology Forecasts', count: '7 days summary', icon: 'cloud-sun', color: '#f59e0b' },
    { id: 'market', label: 'APMC Market Trends', count: '3 commodities', icon: 'trending-up', color: '#3b82f6' },
    { id: 'irrigation', label: 'Irrigation & Pump logs', count: '4 cycles recorded', icon: 'droplet', color: colors.accent },
  ];

  const handleExport = (format: 'PDF' | 'Excel') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert(
      'Export Successful',
      `Your agriculture data has been compiled into a ${format} file and saved to your device Downloads folder.`
    );
  };

  const handleSyncBackup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert('Backup Synced', 'All local reports are securely backed up to your KrishiAI cloud drive.');
  };

  return (
    <Screen
      title="Reports Center"
      emoji="📊"
      subtitle="Export & Compile Farm Logs"
      back
      onBack={() => router.back()}
      right={<HeaderIconButton icon="download" label="Export" />}
    >
      {/* Cloud Backup Card */}
      <FadeInUp index={0} distance={16}>
        <GlassCard padding={16}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accent + '15', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="cloud" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>Cloud Backup</Text>
                <Text style={[t.caption, { color: colors.textSecondary, marginTop: 1 }]}>Synced at 2:30 PM</Text>
              </View>
            </View>
            <PressableScale onPress={handleSyncBackup} haptic="light" style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.accent + '12', borderWidth: 1, borderColor: colors.accent + '30', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="refresh-cw" size={14} color={colors.accent} />
            </PressableScale>
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Date Range Filter */}
      <FadeInUp index={1} distance={16}>
        <GlassCard padding={20}>
          <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700', marginBottom: 12 }]}>Select Date Range</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PressableScale onPress={() => setDateRange('7days')} haptic="light" style={{ flex: 1 }}>
              <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: dateRange === '7days' ? colors.accent : colors.surfaceElevated, borderWidth: 1, borderColor: dateRange === '7days' ? 'transparent' : colors.border, alignItems: 'center' }}>
                <Text style={[t.label, { color: dateRange === '7days' ? '#ffffff' : colors.text, fontWeight: '700', fontSize: 12 }]} numberOfLines={1}>7 Days</Text>
              </View>
            </PressableScale>

            <PressableScale onPress={() => setDateRange('30days')} haptic="light" style={{ flex: 1 }}>
              <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: dateRange === '30days' ? colors.accent : colors.surfaceElevated, borderWidth: 1, borderColor: dateRange === '30days' ? 'transparent' : colors.border, alignItems: 'center' }}>
                <Text style={[t.label, { color: dateRange === '30days' ? '#ffffff' : colors.text, fontWeight: '700', fontSize: 12 }]} numberOfLines={1}>30 Days</Text>
              </View>
            </PressableScale>

            <PressableScale onPress={() => setDateRange('all')} haptic="light" style={{ flex: 1 }}>
              <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: dateRange === 'all' ? colors.accent : colors.surfaceElevated, borderWidth: 1, borderColor: dateRange === 'all' ? 'transparent' : colors.border, alignItems: 'center' }}>
                <Text style={[t.label, { color: dateRange === 'all' ? '#ffffff' : colors.text, fontWeight: '700', fontSize: 12 }]} numberOfLines={1}>All</Text>
              </View>
            </PressableScale>
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Report Categories */}
      <FadeInUp index={2} distance={16}>
        <View>
          <SectionTitle>Report Types</SectionTitle>
        </View>
      </FadeInUp>

      {reportCategories.map((cat, idx) => (
        <FadeInUp key={cat.id} index={idx + 3} distance={16}>
          <GlassCard padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${cat.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={cat.icon as any} size={18} color={cat.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>{cat.label}</Text>
                  <Text style={[t.caption, { color: colors.textSecondary, marginTop: 1 }]}>{cat.count}</Text>
                </View>
              </View>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.accent }}>
                <Feather name="check" size={12} color="#ffffff" />
              </View>
            </View>
          </GlassCard>
        </FadeInUp>
      ))}

      {/* Export Actions */}
      <FadeInUp index={7} distance={16}>
        <View style={{ gap: 12, marginTop: 8 }}>
          <PressableScale onPress={() => handleExport('PDF')} haptic="light">
            <LinearGradient colors={colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
              <Feather name="file-text" size={16} color="#ffffff" />
              <Text style={[t.label, { color: '#ffffff', fontWeight: '700', fontSize: 14 }]}>PDF Report</Text>
            </LinearGradient>
          </PressableScale>

          <PressableScale onPress={() => handleExport('Excel')} haptic="light">
            <View style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: colors.surfaceElevated, borderWidth: 1.5, borderColor: colors.border }}>
              <MaterialCommunityIcons name="table" size={16} color={colors.text} />
              <Text style={[t.label, { color: colors.text, fontWeight: '700', fontSize: 14 }]}>Excel Export</Text>
            </View>
          </PressableScale>
        </View>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({});
