import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Screen, SectionTitle, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp, Pulse } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';

interface Contact {
  name: string;
  role: string;
  phone: string;
  icon: string;
  color: string;
}

export default function EmergencyScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();

  const [sosActive, setSosActive] = useState(false);

  const contactsList: Contact[] = [
    { name: 'Dr. Anil Kumar', role: 'Karnal Block Agri Officer', phone: '+91 98765 43210', icon: 'phone', color: colors.accent },
    { name: 'Veterinary Support Helpline', role: 'Livestock & Cattle Advisor', phone: '1800 180 1551', icon: 'phone-call', color: '#f59e0b' },
    { name: 'District Disaster Control Room', role: 'Weather & Flood SOS Desk', phone: '0184 2252107', icon: 'shield', color: colors.danger },
  ];

  const handleSOSPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setSosActive(prev => !prev);
    if (!sosActive) {
      Alert.alert(
        'SOS Activated',
        'Initiating emergency alert. Your live GPS coordinates (29.6857° N, 76.9904° E) have been compiled and a distress message is ready for dispatch.'
      );
    }
  };

  const handleShareLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await Share.share({
        message: 'HELP: Farmer emergency at Rampur Main Plot A. GPS Location: https://maps.google.com/?q=29.6857,76.9904',
      });
    } catch {
      Alert.alert('Error', 'Unable to share coordinates.');
    }
  };

  const handleDial = (phone: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Alert.alert('Initiating Call', `Dialing ${name} at ${phone}...`);
  };

  return (
    <Screen
      title="Emergency Hub"
      emoji="🚨"
      subtitle="Disaster SOS & Agri Help"
      back
      onBack={() => router.back()}
      right={<HeaderIconButton icon="phone" label="Call help" />}
    >
      {/* SOS Button Hero */}
      <FadeInUp index={0} distance={16}>
        <GlassCard padding={24}>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Pulse active={sosActive}>
              <PressableScale onPress={handleSOSPress} haptic="heavy">
                <LinearGradient
                  colors={sosActive ? colors.gradient.success : colors.gradient.danger}
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    ...DesignTokens.shadow.level3
                  }}
                >
                  <MaterialCommunityIcons name="alert-decagram" size={36} color="#ffffff" />
                  <Text style={[t.overline, { color: '#ffffff', fontWeight: '900', fontSize: 11, letterSpacing: 0.8 }]}>
                    {sosActive ? 'ACTIVE' : 'SOS'}
                  </Text>
                </LinearGradient>
              </PressableScale>
            </Pulse>
            <Text style={[t.body, { color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }]}>
              {sosActive ? 'Tap to cancel' : 'Press to broadcast your location'}
            </Text>
          </View>
        </GlassCard>
      </FadeInUp>

      {/* GPS Location Card */}
      <FadeInUp index={1} distance={16}>
        <GlassCard padding={20}>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>My GPS Location</Text>
              <Text style={[t.body, { color: colors.textSecondary, marginTop: 6, fontWeight: '500' }]}>
                29.6857° N, 76.9904° E <Text style={{ color: colors.textMuted }}>• Rampur, Karnal</Text>
              </Text>
            </View>

            <PressableScale onPress={handleShareLocation} haptic="light">
              <View style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.accent + '12', borderWidth: 1, borderColor: colors.accent + '30', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Feather name="share-2" size={14} color={colors.accent} />
                <Text style={[t.label, { color: colors.accent, fontWeight: '700' }]}>Share Coordinates</Text>
              </View>
            </PressableScale>
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Emergency Contacts */}
      <FadeInUp index={2} distance={16}>
        <View>
          <SectionTitle>Direct Call Directory</SectionTitle>
        </View>
      </FadeInUp>

      {contactsList.map((contact, idx) => (
        <FadeInUp key={contact.name} index={idx + 3} distance={16}>
          <PressableScale onPress={() => handleDial(contact.phone, contact.name)} haptic="light">
            <GlassCard padding={16}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${contact.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name={contact.icon as any} size={18} color={contact.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]}>{contact.name}</Text>
                    <Text style={[t.caption, { color: colors.textSecondary, marginTop: 2 }]}>{contact.role}</Text>
                  </View>
                </View>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: contact.color + '15', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: contact.color + '30' }}>
                  <Feather name="phone" size={16} color={contact.color} />
                </View>
              </View>
            </GlassCard>
          </PressableScale>
        </FadeInUp>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({});
