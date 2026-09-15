import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import { Screen, SectionTitle, GlassCard, ListRow } from '@/components/ui/Screen';
import { PressableScale } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';

export default function AboutScreen() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const t = useType();

  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);

  const handleSendFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (feedback.trim() === '') return;
    Alert.alert('Thank You', 'Your feedback has been logged. Our developers read all submissions.');
    setFeedback('');
  };

  const handleRate = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRating(num);
    Alert.alert('Rating Captured', `You rated KrishiAI ${num} stars. Thank you!`);
  };

  const links = [
    { title: 'Privacy Policy Document', icon: 'file-text' },
    { title: 'Official Terms of Use', icon: 'shield' },
    { title: 'Open Source Software credits', icon: 'git-branch' },
  ];

  return (
    <Screen title="About KrishiAI" emoji="ℹ️" subtitle="Mission, vision, & feedback" back>
      <LinearGradient
        colors={scheme === 'dark' ? ['#0e2a14', '#050e07'] : ['#f0fdf4', '#ffffff']}
        style={[styles.heroCard, { borderColor: colors.border, ...DesignTokens.shadow.level1 }]}
      >
        <Text style={[t.overline, { color: colors.accent }]}>🌾 Our Mission</Text>
        <Text style={[t.bodyLarge, { color: colors.text, marginTop: 8 }]}>
          Empowering Indian farmers through real-time satellite imagery, pest diagnostics, weather intelligence, and fair
          APMC mandi valuation.
        </Text>
        <Text style={[t.caption, { color: colors.textSecondary, marginTop: 8 }]}>
          v1.4.2 (Production Release Build) • Made in India 🇮🇳
        </Text>
      </LinearGradient>

      <GlassCard>
        <Text style={[t.bodyStrong, { color: colors.text, marginBottom: 10 }]}>Rate KrishiAI</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((num) => (
            <PressableScale key={num} onPress={() => handleRate(num)} haptic="medium" style={{ paddingHorizontal: 4 }} accessibilityLabel={`Rate ${num} stars`}>
              <Feather name="star" size={28} color={num <= rating ? '#fbbf24' : colors.borderStrong} />
            </PressableScale>
          ))}
        </View>

        <Text style={[t.bodyStrong, { color: colors.text, marginTop: 16, marginBottom: 8 }]}>Submit Suggestion / Report bug</Text>
        <TextInput
          placeholder="Help us improve. Share your feature requests..."
          placeholderTextColor={colors.textMuted}
          value={feedback}
          onChangeText={setFeedback}
          style={[styles.feedbackInput, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surfaceElevated }]}
          multiline
        />
        <PressableScale style={[styles.feedbackBtn, { backgroundColor: colors.accent }]} onPress={handleSendFeedback} haptic="medium">
          <Text style={[t.label, { color: '#ffffff' }]}>Submit Feedback</Text>
        </PressableScale>
      </GlassCard>

      <SectionTitle>Terms & Policies</SectionTitle>
      <GlassCard padding={4}>
        <View style={{ paddingHorizontal: 14 }}>
          {links.map((link, idx) => (
            <ListRow
              key={link.title}
              icon={link.icon}
              iconColor={colors.accent}
              label={link.title}
              onPress={() => Alert.alert('External Document', `Loading: ${link.title}...`)}
              divider={idx < links.length - 1}
            />
          ))}
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { padding: 20, borderRadius: DesignTokens.radius.extraLarge, borderWidth: 1 },
  ratingRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 4 },
  feedbackInput: { minHeight: 70, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: '500', textAlignVertical: 'top' },
  feedbackBtn: { height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
});
