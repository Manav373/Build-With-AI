import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Screen, SectionTitle, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';

interface Farm {
  id: string;
  name: string;
  size: string;
  crop: string;
  soil: string;
  water: string;
  notes: string;
  gpsCoordinates: string;
}

export default function FarmsScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  const [farms, setFarms] = useState<Farm[]>([
    {
      id: 'f1',
      name: '🌾 Rampur Main Plot A',
      size: '4.5 Acres',
      crop: 'Wheat (HD2967)',
      soil: 'Alluvial Soil',
      water: 'Tube Well Irrigation',
      notes: 'Soil nitrogen levels stabilized last week. Prepping for rabi harvesting.',
      gpsCoordinates: '29.6857° N, 76.9904° E',
    },
    {
      id: 'f2',
      name: '🍅 Karnal Vegetable Plot B',
      size: '1.2 Acres',
      crop: 'Tomatoes & Capsicum',
      soil: 'Clayey Soil',
      water: 'Drip Irrigation system',
      notes: 'Early aphid activity seen near borders. Organic sprays active.',
      gpsCoordinates: '29.7041° N, 76.9782° E',
    },
  ]);

  const handleEditBoundaries = (farmName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert('GIS Mapping', `Launching GPS field boundaries mapping tool for ${farmName}.`);
  };

  const handleAddNewFarm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Add Property', 'Add New Property form triggered successfully.');
  };

  return (
    <Screen
      title="My Farms"
      emoji="🏡"
      subtitle="Manage Property & Boundaries"
      back
      onBack={() => router.back()}
      right={<HeaderIconButton icon="plus" label="Add farm" onPress={handleAddNewFarm} />}
    >
        {farms.map((farm, idx) => (
        <FadeInUp key={farm.id} index={idx} distance={16}>
          <GlassCard padding={20}>
            <View style={{ gap: 14 }}>
              {/* Farm Header */}
              <View>
                <Text style={[t.title, { color: colors.text, fontWeight: '800' }]} numberOfLines={1}>{farm.name}</Text>
                <Text style={[t.caption, { color: colors.textSecondary, marginTop: 4 }]}>{farm.size} • {farm.gpsCoordinates}</Text>
              </View>

              {/* Specs Grid - 3 columns */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border + '40', gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="box" size={12} color={colors.accent} />
                    <Text style={[t.overline, { color: colors.textSecondary, fontSize: 9 }]}>CROP</Text>
                  </View>
                  <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700', fontSize: 12 }]}>{farm.crop}</Text>
                </View>

                <View style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border + '40', gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="layers" size={12} color={colors.info} />
                    <Text style={[t.overline, { color: colors.textSecondary, fontSize: 9 }]}>SOIL</Text>
                  </View>
                  <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700', fontSize: 12 }]}>{farm.soil}</Text>
                </View>

                <View style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border + '40', gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="droplet" size={12} color={colors.accent} />
                    <Text style={[t.overline, { color: colors.textSecondary, fontSize: 9 }]}>WATER</Text>
                  </View>
                  <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700', fontSize: 12 }]}>{farm.water}</Text>
                </View>
              </View>

              {/* Satellite Boundary Viz */}
              <View style={{ height: 80, borderRadius: 14, backgroundColor: colors.surfaceElevated, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Feather name="globe" size={20} color={colors.textMuted} />
                <Text style={[t.caption, { color: colors.textMuted, fontWeight: '600' }]}>Satellite Boundary Active</Text>
              </View>

              {/* Notes */}
              <View style={{ gap: 6 }}>
                <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>📝 Cultivation Notes</Text>
                <Text style={[t.body, { color: colors.textSecondary, lineHeight: 20 }]}>{farm.notes}</Text>
              </View>

              {/* Edit Button */}
              <PressableScale onPress={() => handleEditBoundaries(farm.name)} haptic="light" style={{ marginTop: 4 }}>
                <View style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.accent + '12', borderWidth: 1, borderColor: colors.accent + '30', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Feather name="map" size={14} color={colors.accent} />
                  <Text style={[t.label, { color: colors.accent, fontWeight: '700' }]}>Redraw GPS Boundaries</Text>
                </View>
              </PressableScale>
            </View>
          </GlassCard>
        </FadeInUp>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({});
