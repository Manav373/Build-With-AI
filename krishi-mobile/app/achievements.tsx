import React from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, GlassCard } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';

interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  color: string;
}

export default function AchievementsScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  const badgesList: Badge[] = [
    { id: 'b1', title: 'First Scan', desc: 'Diagnosed a leaf disease in Plot A', icon: 'camera', unlocked: true, color: '#3b82f6' },
    { id: 'b2', title: 'Water Saver', desc: 'Saved 4,000L with automatic overrides', icon: 'droplet', unlocked: true, color: colors.accent },
    { id: 'b3', title: 'Community Helper', desc: 'Had a reply marked helpful by experts', icon: 'users', unlocked: true, color: '#f59e0b' },
    { id: 'b4', title: 'Crop Expert', desc: 'Scan and log 5 distinct crops', icon: 'award', unlocked: false, color: '#9333ea' },
  ];

  const handleClaimReward = (title: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Reward Claimed', `You have unlocked the gift voucher for the achievement: ${title}!`);
  };

  return (
    <Screen
      title="Farmer Badges"
      emoji="🏆"
      subtitle="Gamification & Level Progress"
      back
      onBack={() => router.back()}
    >
      {/* Level Progression */}
      <FadeInUp index={0} distance={16}>
        <GlassCard padding={16}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[t.caption, { color: colors.textMuted, textTransform: 'uppercase', fontWeight: '800', letterSpacing: 0.5 }]}>Current Status</Text>
              <Text style={[t.displayMedium, { color: colors.text, marginTop: 4 }]}>Level 3 Smart Farmer</Text>
            </View>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '900' }}>Lvl 3</Text>
            </View>
          </View>

          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceElevated, overflow: 'hidden', marginBottom: 10 }}>
            <View style={{ height: '100%', width: '48%', borderRadius: 4, backgroundColor: colors.accent }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={[t.caption, { color: colors.textSecondary, flexShrink: 1 }]}>480 / 1000 XP to Lvl 4</Text>
            <Text style={[t.caption, { color: colors.accent, fontWeight: '800' }]}>+520 XP needed</Text>
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Streak log */}
      <FadeInUp index={1} distance={16}>
        <GlassCard padding={16}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <MaterialCommunityIcons name="fire" size={28} color="#f97316" />
            <View style={{ flex: 1 }}>
              <Text style={[t.bodyStrong, { color: colors.text }]}>7-Day Active Streak</Text>
              <Text style={[t.caption, { color: colors.textSecondary, marginTop: 2 }]}>Daily log-ins, scans, or chats</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <View key={idx} style={{ alignItems: 'center', gap: 6 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: idx < 6 ? '#f97316' : colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
                  {idx < 6 && <Feather name="check" size={12} color="#ffffff" strokeWidth={3} />}
                </View>
                <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '800' }]}>{day}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Badges Grid - 3 cols */}
      <View style={{ marginTop: 4 }}>
        <Text style={[t.overline, { color: colors.textMuted, paddingHorizontal: 4 }]}>UNLOCKED MEDALS</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
        {badgesList.map((badge, idx) => (
          <FadeInUp key={badge.id} index={idx + 2} distance={16}>
            <View style={{ width: '48%' }}>
              <GlassCard
                padding={14}
                style={{
                  alignItems: 'center',
                  gap: 8,
                  opacity: badge.unlocked ? 1 : 0.4,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${badge.color}1c`, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={badge.icon as any} size={22} color={badge.color} />
                </View>
                <Text style={[t.bodyStrong, { color: colors.text, textAlign: 'center' }]} numberOfLines={1}>{badge.title}</Text>
                <Text style={[t.caption, { color: colors.textSecondary, textAlign: 'center', lineHeight: 15 }]}>{badge.desc}</Text>

                {badge.unlocked && badge.id === 'b2' && (
                  <PressableScale onPress={() => handleClaimReward(badge.title)} haptic="medium" style={{ marginTop: 4, width: '100%' }}>
                    <View style={{ backgroundColor: colors.accent, paddingVertical: 6, borderRadius: 8, alignItems: 'center' }}>
                      <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800' }}>Claim Reward</Text>
                    </View>
                  </PressableScale>
                )}
              </GlassCard>
            </View>
          </FadeInUp>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({});
