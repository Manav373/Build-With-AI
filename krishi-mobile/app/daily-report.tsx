import React from 'react';
import { View, Text, StyleSheet, Share, Alert, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 44) / 2;

export default function DailyReportScreen() {
  const colors = useThemeColors();
  const t = useType();
  const scheme = useColorScheme();

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await Share.share({
        message: 'KrishiAI Daily Farm Report (June 22, 2026): Farm health is Optimal (92%). Weather: clear skies. View details in KrishiAI App.',
      });
    } catch {
      Alert.alert('Error', 'Could not open sharing drawer.');
    }
  };

  const handleDownload = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Success', 'PDF Farm Report downloaded successfully to your downloads folder!');
  };

  const metrics = [
    { label: 'Farm Health', val: '92% (Optimal)', icon: 'activity', color: colors.accent },
    { label: 'Disease Risk', val: 'Low (12%)', icon: 'shield', color: colors.green },
    { label: 'Rain Prediction', val: 'No rain expected', icon: 'cloud-sun', color: '#f59e0b' },
    { label: 'Expected Irrigation', val: 'Delay irrigation', icon: 'droplet', color: '#3b82f6' },
  ];

  return (
    <Screen
      back
      title="Daily Report"
      emoji="📋"
      subtitle="Farm Metrics + Share/Export"
      right={<HeaderIconButton icon="share-2" onPress={handleShare} label="Share report" />}
    >
      {/* Hero Card */}
      <FadeInUp index={0} distance={16}>
        <GlassCard
          style={{
            backgroundColor: scheme === 'dark' ? '#0e2a14' : '#f0fdf4',
          }}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <Text style={[t.caption, { color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                Overall Status
              </Text>
              <Text style={[t.displayMedium, { color: colors.accent, marginTop: 2, flexShrink: 1 }]}>
                Healthy & Growing
              </Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: colors.accent }]}>
              <Text style={[t.label, { color: '#ffffff' }]}>Optimal</Text>
            </View>
          </View>
          <Text style={[t.body, { color: colors.textSecondary, marginTop: 8 }]}>
            All crops show normal growth rates. High NDVI values indicate excellent chlorophyll health. Soil moisture levels are steady.
          </Text>
        </GlassCard>
      </FadeInUp>

      {/* Metrics Grid */}
      <FadeInUp index={1} distance={16}>
        <View style={styles.metricsGrid}>
          {metrics.map((m, idx) => (
            <GlassCard
              key={m.label}
              style={{
                width: GRID_CARD_WIDTH,
                backgroundColor: colors.card,
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: `${m.color}1c` }]}>
                <Feather name={m.icon as any} size={18} color={m.color} />
              </View>
              <Text style={[t.bodyStrong, { color: colors.text, marginTop: 8 }]}>
                {m.val}
              </Text>
              <Text style={[t.caption, { color: colors.textSecondary }]}>
                {m.label}
              </Text>
            </GlassCard>
          ))}
        </View>
      </FadeInUp>

      {/* AI Recommendations card */}
      <FadeInUp index={2} distance={16}>
        <GlassCard>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="brain" size={18} color={colors.accent} />
            <Text style={[t.bodyStrong, { color: colors.text, flex: 1 }]} numberOfLines={1}>AI Cultivation Advisor</Text>
          </View>
          <Text style={[t.body, { color: colors.textSecondary, lineHeight: 20, marginTop: 8 }]}>
            1. <Text style={{ fontWeight: '700' }}>Wheat Plots</Text>: Maintain present irrigation cycles. Warm temperatures tomorrow will promote wheat head maturation. Prepare harvest machinery.{"\n\n"}
            2. <Text style={{ fontWeight: '700' }}>Cotton Plots</Text>: Flowering has begun. Monitor borders for aphids or whiteflies. Visual leaf coloration is excellent.{"\n\n"}
            3. <Text style={{ fontWeight: '700' }}>Mandi Opportunity</Text>: Haryana market prices for wheat have increased by +4% this week. Selling options are highly profitable.
          </Text>
        </GlassCard>
      </FadeInUp>

      {/* Download Section */}
      <FadeInUp index={3} distance={16}>
        <PressableScale
          onPress={handleDownload}
          haptic="medium"
          style={styles.downloadBtn}
        >
          <View
            style={[
              styles.downloadGradient,
              {
                backgroundColor: colors.accent,
              },
            ]}
          >
            <Feather name="download" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={[t.bodyStrong, { color: '#ffffff' }]}>Download PDF Report</Text>
          </View>
        </PressableScale>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroLeft: { flex: 1 },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  downloadBtn: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 8,
  },
  downloadGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
