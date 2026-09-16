import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/ui/Screen';
import { PressableScale } from '@/components/ui/Motion';
import { useColorScheme, useType, useThemeColors } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    sectionTag: 'SMART FARMING & WATER',
    title: 'IoT Smart Farm & Irrigation',
    subtitle: 'Live soil telemetry & automated pump control',
    liveBadge: 'LIVE RTDB',
    moisture: 'Soil Moisture',
    moistureVal: '38%',
    moistureStatus: 'Optimal',
    rain: 'Rain Sensor',
    rainVal: 'Dry / Safe',
    pump: 'Smart Pump',
    pumpVal: 'Auto Standby',
    action: 'Open IoT Dashboard & Controls',
  },
  hi: {
    sectionTag: 'स्मार्ट खेती एवं जल संरक्षण',
    title: 'IoT स्मार्ट फार्म एवं सिंचाई',
    subtitle: 'लाइव सॉइल डेटा व स्वचालित पंप नियंत्रण',
    liveBadge: 'लाइव RTDB',
    moisture: 'मिट्टी की नमी',
    moistureVal: '38%',
    moistureStatus: 'अनुकूल',
    rain: 'वर्षा सेंसर',
    rainVal: 'सुरक्षित (सूखा)',
    pump: 'स्मार्ट पंप',
    pumpVal: 'ऑटो स्टैंडबाय',
    action: 'IoT डैशबोर्ड और नियंत्रण खोलें',
  },
  gu: {
    sectionTag: 'સ્માર્ટ ખેતી અને સિંચાઈ',
    title: 'IoT સ્માર્ટ ફાર્મ અને સિંચાઈ',
    subtitle: 'લાઇવ જમીન ડેટા અને સ્વચાલિત પંપ નિયંત્રણ',
    liveBadge: 'લાઇવ RTDB',
    moisture: 'જમીનનો ભેજ',
    moistureVal: '38%',
    moistureStatus: 'યોગ્ય',
    rain: 'વરસાદ સેન્સર',
    rainVal: 'સૂકું / સુરક્ષિત',
    pump: 'સ્માર્ટ પંપ',
    pumpVal: 'ઓટો સ્ટેન્ડબાય',
    action: 'IoT ડેશબોર્ડ અને નિયંત્રણ ખોલો',
  },
  mr: {
    sectionTag: 'स्मार्ट शेती आणि पाणी',
    title: 'IoT स्मार्ट शेत आणि सिंचन',
    subtitle: 'थेट मातीचा डेटा व स्वयंचलित पंप नियंत्रण',
    liveBadge: 'थेट RTDB',
    moisture: 'मातीतील ओलावा',
    moistureVal: '38%',
    moistureStatus: 'योग्य',
    rain: 'पाऊस सेन्सर',
    rainVal: 'कोरडे / सुरक्षित',
    pump: 'स्मार्ट पंप',
    pumpVal: 'ऑटो स्टँडबाय',
    action: 'IoT डॅशबोर्ड आणि नियंत्रणे उघडा',
  },
};

export function IotHomeCard() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const t = useType();
  const s = useScreenStrings(STRINGS as any);
  const dark = scheme === 'dark';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/irrigation' as any);
  };

  return (
    <View style={styles.outerContainer}>
      <PressableScale onPress={handlePress} scaleTo={0.98} haptic="medium">
        <GlassCard liquid padding={16} style={styles.card}>
          <LinearGradient
            colors={
              dark
                ? ['rgba(6, 182, 212, 0.14)', 'rgba(16, 185, 129, 0.04)', 'transparent']
                : ['rgba(6, 182, 212, 0.10)', 'rgba(16, 185, 129, 0.03)', 'transparent']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.titleArea}>
              <View style={[styles.iconChip, { backgroundColor: dark ? 'rgba(6, 182, 212, 0.20)' : 'rgba(6, 182, 212, 0.14)' }]}>
                <Feather name="droplet" size={20} color="#06b6d4" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={styles.tagRow}>
                  <Text style={[styles.tagText, { color: '#06b6d4' }]}>{s.sectionTag}</Text>
                  <View style={styles.livePill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>{s.liveBadge}</Text>
                  </View>
                </View>
                <Text style={[t.titleSmall, { color: colors.text, fontWeight: '800' }]} numberOfLines={1}>
                  {s.title}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[t.caption, { color: colors.textMuted, marginTop: 6, marginBottom: 14 }]} numberOfLines={1}>
            {s.subtitle}
          </Text>

          {/* Metrics Grid */}
          <View style={styles.metricsRow}>
            {/* Soil Moisture */}
            <View style={[styles.metricBox, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
              <View style={styles.metricLabelRow}>
                <Feather name="activity" size={12} color="#06b6d4" />
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{s.moisture}</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>{s.moistureVal}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{s.moistureStatus}</Text>
              </View>
            </View>

            {/* Rain Sensor */}
            <View style={[styles.metricBox, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
              <View style={styles.metricLabelRow}>
                <Feather name="cloud-rain" size={12} color="#3b82f6" />
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{s.rain}</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>{s.rainVal}</Text>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <Text style={[styles.statusText, { color: '#3b82f6' }]}>FC-37 OK</Text>
              </View>
            </View>

            {/* Pump State */}
            <View style={[styles.metricBox, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
              <View style={styles.metricLabelRow}>
                <Feather name="cpu" size={12} color="#10b981" />
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{s.pump}</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>{s.pumpVal}</Text>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Text style={[styles.statusText, { color: '#10b981' }]}>Relay OFF</Text>
              </View>
            </View>
          </View>

          {/* Bottom Action Bar */}
          <View style={[styles.actionBanner, { backgroundColor: dark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.08)', borderColor: dark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)' }]}>
            <Text style={[styles.actionText, { color: dark ? '#38bdf8' : '#0284c7' }]}>
              {s.action}
            </Text>
            <Feather name="arrow-right" size={16} color={dark ? '#38bdf8' : '#0284c7'} />
          </View>
        </GlassCard>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#22c55e',
    letterSpacing: 0.4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    marginTop: 2,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#06b6d4',
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
