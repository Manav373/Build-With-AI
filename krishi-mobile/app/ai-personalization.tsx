import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, SectionTitle, GlassCard } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { Segmented } from '@/components/ui/FormPrimitives';

export default function AIPersonalizationScreen() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  // Settings states
  const [aiTone, setAiTone] = useState<'friendly' | 'professional'>('friendly');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [briefingTime, setBriefingTime] = useState('07:00 AM');
  const [activeGoal, setActiveGoal] = useState<'yield' | 'organic' | 'water'>('yield');

  const goals = [
    { id: 'yield', label: 'Maximize Yield Output', icon: 'trending-up' },
    { id: 'organic', label: 'Organic Conversion', icon: 'feather' },
    { id: 'water', label: 'Water Resource Savings', icon: 'droplet' },
  ] as const;

  const briefingTimes = ['06:00 AM', '07:00 AM', '08:00 AM'] as const;

  const handleGoalSelect = (g: typeof goals[number]['id']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveGoal(g);
  };

  const handleSaveSettings = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Settings Saved', 'AI Advisor personalization attributes updated successfully.');
  };

  const getAIPreviewText = () => {
    const toneText = aiTone === 'friendly'
      ? 'Namaste Manav! Let us review Plot A. The weather is warm today—ideal for crop growth. What can I check next?'
      : 'Crop Briefing: Rampur Plot A shows optimal NDVI index. Weather remains dry. Recommend delaying irrigation.';
    const voiceText = voiceGender === 'female' ? 'Voice: Indian Female (Kiran)' : 'Voice: Indian Male (Aarav)';
    return `"${toneText}"\n\n(${voiceText})`;
  };

  return (
    <Screen title="Customize AI" emoji="🤖" subtitle="Configure Voice & Advisory Tone" back>
      {/* Interactive preview card */}
      <FadeInUp index={0}>
        <LinearGradient
          colors={scheme === 'dark' ? ['#0e2a14', '#050e07'] : ['#f0fdf4', '#f8faf7']}
          style={[styles.previewCard, { borderColor: colors.border }]}
        >
          <View style={styles.previewHeader}>
            <Feather name="cpu" size={18} color={colors.accent} />
            <Text style={[styles.previewTitle, { color: colors.text }]}>Advisory Audio Preview</Text>
          </View>
          <Text style={[styles.previewText, { color: colors.textSecondary }]}>{getAIPreviewText()}</Text>
        </LinearGradient>
      </FadeInUp>

      {/* Goals selection */}
      <SectionTitle>Primary Agricultural Goal</SectionTitle>
      <FadeInUp index={1}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14, gap: 10 }}>
            {goals.map(g => (
              <PressableScale key={g.id} onPress={() => handleGoalSelect(g.id)} haptic="light" accessibilityRole="radio" accessibilityState={{ selected: activeGoal === g.id }}>
                <View
                  style={[
                    styles.goalChip,
                    {
                      backgroundColor: activeGoal === g.id ? colors.accent : colors.surfaceElevated,
                      borderColor: activeGoal === g.id ? 'transparent' : colors.border,
                    },
                  ]}
                >
                  <Feather name={g.icon as any} size={14} color={activeGoal === g.id ? '#ffffff' : colors.text} />
                  <Text style={[styles.goalLabelText, { color: activeGoal === g.id ? '#ffffff' : colors.textSecondary }]}>
                    {g.label}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Tone and voice */}
      <SectionTitle>AI Character Tone</SectionTitle>
      <FadeInUp index={2}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14, gap: 12 }}>
            <View style={styles.rowGrid}>
              <PressableScale onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setAiTone('friendly'); }} haptic="light" style={{ flex: 1 }} accessibilityRole="radio" accessibilityState={{ selected: aiTone === 'friendly' }}>
                <View style={[styles.gridChip, { backgroundColor: aiTone === 'friendly' ? colors.accent : colors.surfaceElevated, borderColor: aiTone === 'friendly' ? 'transparent' : colors.border }]}>
                  <Text style={[styles.gridChipText, { color: aiTone === 'friendly' ? '#ffffff' : colors.text }]}>Warm & Friendly</Text>
                </View>
              </PressableScale>

              <PressableScale onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setAiTone('professional'); }} haptic="light" style={{ flex: 1 }} accessibilityRole="radio" accessibilityState={{ selected: aiTone === 'professional' }}>
                <View style={[styles.gridChip, { backgroundColor: aiTone === 'professional' ? colors.accent : colors.surfaceElevated, borderColor: aiTone === 'professional' ? 'transparent' : colors.border }]}>
                  <Text style={[styles.gridChipText, { color: aiTone === 'professional' ? '#ffffff' : colors.text }]}>Concise & Expert</Text>
                </View>
              </PressableScale>
            </View>

            <View style={styles.rowGrid}>
              <PressableScale onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setVoiceGender('female'); }} haptic="light" style={{ flex: 1 }} accessibilityRole="radio" accessibilityState={{ selected: voiceGender === 'female' }}>
                <View style={[styles.gridChip, { backgroundColor: voiceGender === 'female' ? colors.accent : colors.surfaceElevated, borderColor: voiceGender === 'female' ? 'transparent' : colors.border }]}>
                  <Text style={[styles.gridChipText, { color: voiceGender === 'female' ? '#ffffff' : colors.text }]}>Female (Kiran)</Text>
                </View>
              </PressableScale>

              <PressableScale onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setVoiceGender('male'); }} haptic="light" style={{ flex: 1 }} accessibilityRole="radio" accessibilityState={{ selected: voiceGender === 'male' }}>
                <View style={[styles.gridChip, { backgroundColor: voiceGender === 'male' ? colors.accent : colors.surfaceElevated, borderColor: voiceGender === 'male' ? 'transparent' : colors.border }]}>
                  <Text style={[styles.gridChipText, { color: voiceGender === 'male' ? '#ffffff' : colors.text }]}>Male (Aarav)</Text>
                </View>
              </PressableScale>
            </View>
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Daily briefing time */}
      <SectionTitle>Daily Mandi & Weather Briefing</SectionTitle>
      <FadeInUp index={3}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            <View style={styles.rowGrid}>
              {briefingTimes.map(time => (
                <PressableScale key={time} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setBriefingTime(time); }} haptic="light" style={{ flex: 1 }} accessibilityRole="radio" accessibilityState={{ selected: briefingTime === time }}>
                  <View style={[styles.gridChipThree, { backgroundColor: briefingTime === time ? colors.accent : colors.surfaceElevated, borderColor: briefingTime === time ? 'transparent' : colors.border }]}>
                    <Text style={[styles.gridChipText, { color: briefingTime === time ? '#ffffff' : colors.text }]}>{time}</Text>
                  </View>
                </PressableScale>
              ))}
            </View>
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Save button */}
      <FadeInUp index={4}>
        <PressableScale onPress={handleSaveSettings} haptic="medium" style={{ marginTop: 8 }}>
          <LinearGradient colors={colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGradient}>
            <Feather name="check" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.saveText}>Save Preferences</Text>
          </LinearGradient>
        </PressableScale>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  previewCard: { padding: 16, borderRadius: 24, borderWidth: 1.5, gap: 8 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  previewText: { fontSize: 13.5, fontWeight: '600', fontStyle: 'italic', lineHeight: 20 },
  goalChip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  goalLabelText: { fontSize: 13, fontWeight: '700' },
  rowGrid: { flexDirection: 'row', gap: 10 },
  gridChip: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  gridChipThree: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  gridChipText: { fontSize: 12.5, fontWeight: '700' },
  saveGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 24 },
  saveText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
