import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';

export default function QuickActionsScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push(route as any);
  };

  const actionItems = [
    { id: 'chat', label: 'AI Chat Advisor', desc: 'Ask agricultural questions', status: 'Online', icon: 'message-square', color: colors.accent, route: '/(tabs)/chat' },
    { id: 'scan', label: 'Crop Scan Doctor', desc: 'Scan leaf for diseases', status: 'Optimal', icon: 'camera', color: colors.danger, route: '/(tabs)/scan' },
    { id: 'weather', label: 'Hyperlocal Weather', desc: 'Rain alerts & forecast', status: 'Rain tomorrow', icon: 'cloud-drizzle', color: '#06b6d4', route: '/weather' },
    { id: 'market', label: 'Mandi Market Prices', desc: 'Live market trends', status: 'Updated today', icon: 'trending-up', color: '#f97316', route: '/(tabs)/market' },
    { id: 'schemes', label: 'Govt Schemes', desc: 'Check eligibility benefits', status: '2 schemes active', icon: 'award', color: '#ec4899', route: '/schemes' },
    { id: 'satellite', label: 'Satellite NDVI', desc: 'NDVI crop monitoring', status: 'Optimal health', icon: 'globe', color: '#8b5cf6', route: '/(tabs)/crops' },
    { id: 'irrigation', label: 'Smart Irrigation', desc: 'Watering timeline alerts', status: 'Dry soil warning', icon: 'droplet', color: '#3b82f6', route: '/predict' },
    { id: 'soil', label: 'Soil Health Card', desc: 'Nitrogen & moisture log', status: 'Good nitrogen', icon: 'activity', color: '#10b981', route: '/predict' },
    { id: 'learning', label: 'Agri Academy', desc: 'Modern cultivation guide', status: 'New courses', icon: 'book-open', color: '#f59e0b', route: '/(tabs)/more' },
    { id: 'community', label: 'Krishi Community', desc: 'Connect with expert peers', status: 'Active threads', icon: 'users', color: '#14b8a6', route: '/(tabs)/more' },
  ];

  return (
    <Screen
      title="Action Hub"
      emoji="🎛️"
      subtitle="Quick Access Platform Tools"
      back
      onBack={() => router.back()}
      right={<HeaderIconButton icon="grid" label="Grid" />}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' }}>
        {actionItems.map((item, idx) => (
          <FadeInUp key={item.id} index={idx} distance={16} style={{ width: '48%', minWidth: 160 }}>
            <PressableScale onPress={() => handlePress(item.route)} haptic="light">
              <GlassCard padding={16} style={{ height: 180, justifyContent: 'space-between' }}>
                {/* Header: Icon + Arrow */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: `${item.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Feather name="arrow-up-right" size={14} color={colors.textMuted} />
                </View>

                {/* Title & Desc */}
                <View style={{ gap: 4 }}>
                  <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700', fontSize: 13 }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={[t.caption, { color: colors.textSecondary, lineHeight: 16 }]} numberOfLines={2}>
                    {item.desc}
                  </Text>
                </View>

                {/* Status Badge */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.surfaceElevated, alignSelf: 'flex-start', maxWidth: '100%' }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.color }} />
                  <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '600', fontSize: 10, flexShrink: 1 }]} numberOfLines={1}>
                    {item.status}
                  </Text>
                </View>
              </GlassCard>
            </PressableScale>
          </FadeInUp>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({});
