import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Screen, SectionTitle, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';

export default function IrrigationScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  // Smart Pump mock states
  const [pumpOn, setPumpOn] = useState(false);
  const [autoOverride, setAutoOverride] = useState(true);

  const handlePumpToggle = (val: boolean) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPumpOn(val);
    Alert.alert(
      'Pump Status',
      val ? 'Water Pump has been TURNED ON. Pumping 80 liters/min.' : 'Water Pump has been TURNED OFF.'
    );
  };

  const handleAutoToggle = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAutoOverride(val);
  };

  const sensors = [
    { name: 'Plot 1 Moisture Probe', status: 'Active', battery: '92%', val: '58%' },
    { name: 'Root Zone sensor', status: 'Active', battery: '85%', val: '41%' },
  ];

  return (
    <Screen
      title="Smart Irrigation"
      emoji="💧"
      subtitle="IoT Sensor Controls"
      back
      onBack={() => router.back()}
      right={<HeaderIconButton icon="settings" label="Settings" />}
    >
        {/* Soil Moisture Hero */}
      <FadeInUp index={0} distance={16}>
        <GlassCard padding={20}>
          <Text style={[t.overline, { color: colors.textSecondary, letterSpacing: 0.5, fontWeight: '600' }]}>Current Soil Moisture</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 16 }}>
            <LinearGradient colors={[colors.accent, colors.accent + 'cc']} style={{ width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[t.number, { color: '#ffffff', fontWeight: '900', fontSize: 24 }]}>58%</Text>
              <Text style={[t.caption, { color: '#ffffff', fontWeight: '700', marginTop: 2 }]}>OPTIMAL</Text>
            </LinearGradient>
            <View style={{ flex: 1, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="droplet" size={14} color={colors.info} />
                <Text style={[t.body, { color: colors.text, flexShrink: 1 }]}>Level: 1.2m</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="clock" size={14} color={colors.accent} />
                <Text style={[t.body, { color: colors.text, flexShrink: 1 }]}>Delayed</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="cloud-rain" size={14} color={colors.info} />
                <Text style={[t.body, { color: colors.text, flexShrink: 1 }]}>Rain active</Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Pump Controls */}
      <FadeInUp index={1} distance={16}>
        <GlassCard padding={20}>
          <Text style={[t.title, { color: colors.text, fontWeight: '800', marginBottom: 16 }]}>Pump Controller</Text>

          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>Automatic AI Override</Text>
                <Text style={[t.caption, { color: colors.textSecondary, marginTop: 2 }]}>Pauses if rain forecast</Text>
              </View>
              <Switch
                value={autoOverride}
                onValueChange={handleAutoToggle}
                trackColor={{ false: colors.border, true: '#2E7D32' }}
                thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>Water Pump Switch</Text>
                <Text style={[t.caption, { color: pumpOn ? colors.accent : colors.textSecondary, marginTop: 2, fontWeight: '600' }]}>
                  {pumpOn ? '● Pumping (80L/m)' : 'Offline / Standby'}
                </Text>
              </View>
              <Switch
                value={pumpOn}
                onValueChange={handlePumpToggle}
                trackColor={{ false: colors.border, true: '#2E7D32' }}
                thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
                disabled={autoOverride}
              />
            </View>

            {autoOverride && (
              <Text style={[t.caption, { color: colors.textMuted, fontWeight: '500', fontStyle: 'italic' }]}>
                Disable override to manage pump manually
              </Text>
            )}
          </View>
        </GlassCard>
      </FadeInUp>

      {/* AI Water Savings */}
      <FadeInUp index={2} distance={16}>
        <LinearGradient colors={[colors.accent + '12', colors.accent + '08']} style={{ borderRadius: DesignTokens.radius.extraLarge, padding: 20, borderWidth: 1, borderColor: colors.accent + '30' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Feather name="award" size={18} color={colors.accent} />
            <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>Water Savings</Text>
          </View>
          <Text style={[t.body, { color: colors.textSecondary, lineHeight: 22 }]}>
            AI saved <Text style={{ fontWeight: '700', color: colors.accent }}>4,200L</Text> by pausing before storms. Electricity bill reduced by <Text style={{ fontWeight: '700', color: colors.accent }}>₹140</Text>.
          </Text>
        </LinearGradient>
      </FadeInUp>

      {/* Sensor Status */}
      <FadeInUp index={3} distance={16}>
        <View>
          <SectionTitle>Soil Moisture Sensors</SectionTitle>
        </View>
      </FadeInUp>

      {sensors.map((sensor, idx) => (
        <FadeInUp key={sensor.name} index={idx + 4} distance={16}>
          <GlassCard padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accent + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="cpu" size={16} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>{sensor.name}</Text>
                  <Text style={[t.caption, { color: colors.textSecondary, marginTop: 2 }]}>Battery: {sensor.battery} • {sensor.status}</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.accent + '12', borderWidth: 1, borderColor: colors.accent + '30' }}>
                <Text style={[t.label, { color: colors.accent, fontWeight: '700', fontSize: 12 }]} numberOfLines={1}>{sensor.val}</Text>
              </View>
            </View>
          </GlassCard>
        </FadeInUp>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({});
