import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  Alert, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Screen, SectionTitle, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';

// Default telemetry baseline
const INITIAL_TELEMETRY = {
  soilMoisture: 38,
  soilRaw: 2450,
  temperature: 28.5,
  humidity: 62.0,
  rain: false,
  light: true,
  pump: false,
};

export default function IrrigationScreen() {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const t = useType();
  const router = useRouter();

  // State
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [selectedTimer, setSelectedTimer] = useState<number>(10);
  const [history, setHistory] = useState([
    { id: '1', time: 'Today, 06:15 AM', duration: '15m', mode: 'AUTO', reason: 'Critical dry (<25%)', shift: '21% → 65%' },
    { id: '2', time: 'Yesterday, 07:00 PM', duration: '10m', mode: 'MANUAL', reason: 'Evening top-up', shift: '32% → 58%' },
  ]);

  // Modals
  const [firebaseModalVisible, setFirebaseModalVisible] = useState(false);
  const [simulatorModalVisible, setSimulatorModalVisible] = useState(false);

  // Firebase Config State
  const [firebaseUrl, setFirebaseUrl] = useState('https://krishiai-iot-default-rtdb.firebaseio.com');
  const [firebasePath, setFirebasePath] = useState('/krishiAI');
  const [firebaseEnabled, setFirebaseEnabled] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [firebaseStatusText, setFirebaseStatusText] = useState('');

  // Explainable AI Decision Engine
  const evaluateDecision = (telem: typeof INITIAL_TELEMETRY) => {
    const moisture = telem.soilMoisture;
    const rain = telem.rain;
    const temp = telem.temperature;
    const hum = telem.humidity;

    const critical = 25;
    const target = 65;

    let action = 'STANDBY';
    let badge = 'MONITORING';
    let badgeColor = colors.accent;
    let reason = `Moisture stable at ${moisture}%. Soil capillary absorption is active.`;
    let shouldIrrigate = false;

    if (rain) {
      action = 'HOLD_RAIN';
      badge = 'RAIN LOCKOUT';
      badgeColor = '#3b82f6';
      reason = 'Rain sensor triggered. Water pump held offline to protect root oxygenation.';
    } else if (moisture < critical) {
      action = 'IRRIGATE_NOW';
      badge = 'CRITICAL DRY';
      badgeColor = '#ef4444';
      reason = `Soil moisture (${moisture}%) below permanent wilting threshold (${critical}%).`;
      shouldIrrigate = true;
    } else if (moisture < 40) {
      action = 'RECOMMEND';
      badge = 'WATER DEFICIT';
      badgeColor = '#f59e0b';
      reason = `Mild moisture deficit (${moisture}%). Scheduled watering top-up recommended.`;
    }

    const baseDrying = telem.light ? 1.5 : 0.35;
    const dryingRate = Math.max(0.1, Number((baseDrying + (temp - 25) * (telem.light ? 0.08 : 0.02) - (hum - 50) * 0.01).toFixed(2)));
    const hoursUntilDry = moisture > critical ? Math.max(0, Number(((moisture - critical) / Number(dryingRate)).toFixed(1))) : 0;

    return {
      action,
      badge,
      badgeColor,
      reason,
      shouldIrrigate,
      dryingRate,
      hoursUntilDry,
      pipeline: {
        sense: `Moisture ${moisture}% • Rain ${rain ? 'Active' : 'None'} • ${telem.light ? 'Daylight' : 'Night'}`,
        understand: rain ? 'Precipitation supplying root zone natural water.' : moisture < critical ? 'Root zone severely dehydrated. Rapid transpiration stress.' : 'Soil capillary absorption within functional agronomic boundaries.',
        decide: reason,
        act: telem.pump ? 'GPIO 26 Relay ENERGIZED (Pumping water)' : 'GPIO 26 Relay DE-ENERGIZED (Standby)',
        learn: `Evaporation rate ~${dryingRate}%/hr. Approx ${hoursUntilDry}h buffer before critical threshold.`
      }
    };
  };

  const decision = evaluateDecision(telemetry);

  // Auto pump controller trigger
  useEffect(() => {
    if (mode === 'AUTO') {
      if (decision.shouldIrrigate && !telemetry.pump && !telemetry.rain) {
        handlePumpStart(15, 'KrishiAI AI Auto Trigger');
      } else if (!decision.shouldIrrigate && telemetry.pump) {
        if (telemetry.soilMoisture >= 65) {
          handlePumpStop('Target moisture reached');
        }
      }
    }
  }, [telemetry.soilMoisture, telemetry.rain, mode]);

  // Test Firebase RTDB Connection
  const testFirebaseConnection = async () => {
    setFirebaseStatusText('Testing connection...');
    try {
      let cleanUrl = firebaseUrl.trim().replace(/\/+$/, '');
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      let cleanPath = firebasePath.trim();
      if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;

      const res = await fetch(`${cleanUrl}${cleanPath}.json`);
      if (res.ok) {
        const data = await res.json();
        setFirebaseConnected(true);
        setFirebaseStatusText('✅ Connected! Telemetry streaming.');
        if (data && typeof data === 'object') {
          const sensors = data.sensors || {};
          const status = data.status || {};
          const control = data.control || {};
          const raw = sensors.soilRaw !== undefined ? Number(sensors.soilRaw) : (data.soilRaw !== undefined ? Number(data.soilRaw) : 0);
          let moistureVal = sensors.moisture !== undefined ? Number(sensors.moisture) : (data.soilMoisture !== undefined ? Number(data.soilMoisture) : null);
          if ((moistureVal === null || moistureVal === 0) && raw > 0) {
            moistureVal = Math.max(0, Math.min(100, Math.round(((4000 - raw) / (4000 - 1400)) * 100)));
          }

          setTelemetry(prev => ({
            ...prev,
            soilMoisture: moistureVal ?? prev.soilMoisture,
            soilRaw: raw > 0 ? raw : prev.soilRaw,
            temperature: sensors.temperature ?? data.temperature ?? data.temp ?? prev.temperature,
            humidity: sensors.humidity ?? data.humidity ?? data.hum ?? prev.humidity,
            rain: sensors.rain !== undefined ? Boolean(sensors.rain) : (data.rain !== undefined ? Boolean(data.rain) : prev.rain),
            light: sensors.light !== undefined ? Boolean(sensors.light) : (data.light !== undefined ? Boolean(data.light) : prev.light),
            pump: status.motor !== undefined ? Boolean(status.motor) : (data.pump !== undefined ? Boolean(data.pump) : prev.pump),
          }));
          if (control.mode) {
            setMode(control.mode);
          }
        }
      } else {
        setFirebaseConnected(false);
        setFirebaseStatusText(`HTTP ${res.status}: Check URL or RTDB rules.`);
      }
    } catch (e: any) {
      setFirebaseConnected(false);
      setFirebaseStatusText(`Connection error: ${e?.message || 'Network error'}`);
    }
  };

  // Periodic Firebase RTDB Polling if enabled
  useEffect(() => {
    let timer: any = null;
    if (firebaseEnabled) {
      testFirebaseConnection();
      timer = setInterval(() => {
        testFirebaseConnection();
      }, 5000);
    } else {
      setFirebaseConnected(false);
      setFirebaseStatusText('');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [firebaseEnabled, firebaseUrl, firebasePath]);

  // Pump actions
  const handlePumpStart = (mins: number, reason: string) => {
    if (telemetry.rain) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Rain Interlock Engaged', 'Cannot energize pump while rain is detected. Safety interlock prevents root rot and power wastage.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTelemetry(prev => ({ ...prev, pump: true }));
    setHistory(prev => [
      {
        id: String(Date.now()),
        time: 'Just now',
        duration: `${mins}m`,
        mode,
        reason,
        shift: `${telemetry.soilMoisture}% → ...`
      },
      ...prev
    ]);

    // Push to Firebase RTDB if enabled
    if (firebaseEnabled && firebaseConnected) {
      try {
        let cleanUrl = firebaseUrl.trim().replace(/\/+$/, '');
        let cleanPath = firebasePath.trim();
        if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
        const isKrishiAI = cleanPath === '/krishiAI' || cleanPath.startsWith('/krishiAI');
        const targetUrl = isKrishiAI ? `${cleanUrl}/krishiAI/control.json` : `${cleanUrl}${cleanPath}.json`;
        const payload = isKrishiAI ? { motorCommand: true } : { pump: true, pumpCommand: true, timestamp: Date.now() };
        fetch(targetUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}
    }

    Alert.alert('Pump Energized', `Submersible pump active for ${mins} minutes. Irrigating field parcel.`);
  };

  const handlePumpStop = (reason: string = 'Manual stop') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTelemetry(prev => ({ ...prev, pump: false }));

    if (firebaseEnabled && firebaseConnected) {
      try {
        let cleanUrl = firebaseUrl.trim().replace(/\/+$/, '');
        let cleanPath = firebasePath.trim();
        if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
        const isKrishiAI = cleanPath === '/krishiAI' || cleanPath.startsWith('/krishiAI');
        const targetUrl = isKrishiAI ? `${cleanUrl}/krishiAI/control.json` : `${cleanUrl}${cleanPath}.json`;
        const payload = isKrishiAI ? { motorCommand: false } : { pump: false, pumpCommand: false, timestamp: Date.now() };
        fetch(targetUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}
    }
  };

  const handleEmergencyStop = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    handlePumpStop('EMERGENCY STOP');
    Alert.alert('🚨 Emergency Cutoff', 'Relay de-energized immediately. Submersible pump stopped.');
  };

  // Preset scenarios
  const applyPreset = (preset: 'DRY' | 'RAIN' | 'OPTIMAL') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (preset === 'DRY') {
      setTelemetry(prev => ({ ...prev, soilMoisture: 18, soilRaw: 2900, rain: false, temperature: 32, humidity: 45 }));
    } else if (preset === 'RAIN') {
      setTelemetry(prev => ({ ...prev, rain: true, humidity: 85, pump: false }));
    } else {
      setTelemetry(prev => ({ ...prev, soilMoisture: 55, soilRaw: 2200, rain: false, temperature: 28, humidity: 62 }));
    }
  };

  // Moisture badge helper
  const getMoistureBadge = (val: number) => {
    if (val < 25) return { label: 'CRITICAL DRY (<25%)', color: '#ef4444', zone: 'Severe Stress', grad: ['#ef4444', '#dc2626'] as const };
    if (val < 40) return { label: 'WATER DEFICIT (25–39%)', color: '#f59e0b', zone: 'Mild Deficit', grad: ['#f59e0b', '#d97706'] as const };
    if (val < 70) return { label: 'OPTIMAL (40–69%)', color: '#10b981', zone: 'Optimal Soil Hydration', grad: ['#10b981', '#059669'] as const };
    return { label: 'SATURATED (70–100%)', color: '#3b82f6', zone: 'High Saturation', grad: ['#3b82f6', '#2563eb'] as const };
  };

  const moistBadge = getMoistureBadge(telemetry.soilMoisture);

  return (
    <Screen
      title="Smart Irrigation"
      emoji="💧"
      subtitle="IoT Field Node • Kisan Alert Interlock"
      back
      onBack={() => router.back()}
      right={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <HeaderIconButton
            icon="sliders"
            label="Simulator"
            onPress={() => setSimulatorModalVisible(true)}
          />
          <HeaderIconButton
            icon="cpu"
            label="Firebase"
            onPress={() => setFirebaseModalVisible(true)}
          />
        </View>
      }
    >
      <View style={styles.contentWrap}>
        {/* Status / Cloud Sync Banner */}
        <FadeInUp index={0} distance={10}>
          <View style={[
            styles.syncBanner, 
            { 
              backgroundColor: firebaseConnected 
                ? (dark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.10)')
                : (dark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.10)'),
              borderColor: firebaseConnected 
                ? (dark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)')
                : (dark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.25)')
            }
          ]}>
            <View style={[styles.pulseDot, { backgroundColor: firebaseConnected ? '#10b981' : '#f59e0b' }]} />
            <Text style={[styles.syncBannerText, { color: firebaseConnected ? (dark ? '#34d399' : '#059669') : (dark ? '#fbbf24' : '#d97706') }]}>
              {firebaseConnected 
                ? 'Firebase RTDB: Streaming Live Node Telemetry' 
                : firebaseEnabled 
                ? 'Connecting to Firebase Realtime Database...'
                : 'Local Node Simulator Active • Tap CPU icon to connect RTDB'}
            </Text>
          </View>
        </FadeInUp>

        {/* Rain Safety Lockout Alert Banner */}
        {telemetry.rain && (
          <FadeInUp index={0} distance={10}>
            <View style={[styles.rainBanner, { backgroundColor: dark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.10)', borderColor: dark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.25)' }]}>
              <View style={styles.rainIconWrap}>
                <Feather name="cloud-rain" size={18} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rainBannerTitle, { color: dark ? '#93c5fd' : '#1d4ed8' }]}>
                  Rain Safety Interlock Engaged
                </Text>
                <Text style={[styles.rainBannerSub, { color: dark ? '#bfdbfe' : '#2563eb' }]}>
                  FC-37 detected rainfall. Smart pump locked out to save power & avoid root rot.
                </Text>
              </View>
            </View>
          </FadeInUp>
        )}

        {/* 1. SOIL MOISTURE HERO CARD */}
        <FadeInUp index={1} distance={14}>
          <GlassCard liquid padding={18} style={styles.card}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.headerIconCircle, { backgroundColor: dark ? 'rgba(6, 182, 212, 0.16)' : 'rgba(6, 182, 212, 0.10)' }]}>
                  <Feather name="droplet" size={18} color="#06b6d4" />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Root Zone Moisture</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Capacitive Sensor (GPIO 5)</Text>
                </View>
              </View>
              <View style={[styles.badgePill, { backgroundColor: `${moistBadge.color}15`, borderColor: `${moistBadge.color}35` }]}>
                <Text style={[styles.badgePillText, { color: moistBadge.color }]}>
                  {moistBadge.label}
                </Text>
              </View>
            </View>

            {/* Gauge & Metrics Split */}
            <View style={styles.heroBody}>
              {/* Radial Moisture Gauge */}
              <View style={styles.gaugeContainer}>
                <View style={[styles.gaugeOuterRing, { borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                  <LinearGradient
                    colors={moistBadge.grad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gaugeInner}
                  >
                    <Text style={styles.gaugeValueText}>{telemetry.soilMoisture}%</Text>
                    <Text style={styles.gaugeAdcText}>{telemetry.soilRaw} ADC</Text>
                  </LinearGradient>
                </View>
                <Text style={[styles.gaugeStatusLabel, { color: moistBadge.color }]}>
                  {moistBadge.zone}
                </Text>
              </View>

              {/* 2x2 Telemetry Chips */}
              <View style={styles.telemetryGrid}>
                {/* Temp */}
                <View style={[styles.telemChip, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)', borderColor: colors.border }]}>
                  <View style={[styles.telemIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <Feather name="thermometer" size={14} color="#f59e0b" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.telemLabel, { color: colors.textMuted }]}>Ambient</Text>
                    <Text style={[styles.telemValue, { color: colors.text }]}>{telemetry.temperature}°C</Text>
                  </View>
                </View>

                {/* Humidity */}
                <View style={[styles.telemChip, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)', borderColor: colors.border }]}>
                  <View style={[styles.telemIconWrap, { backgroundColor: 'rgba(6, 182, 212, 0.12)' }]}>
                    <Feather name="wind" size={14} color="#06b6d4" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.telemLabel, { color: colors.textMuted }]}>Humidity</Text>
                    <Text style={[styles.telemValue, { color: colors.text }]}>{telemetry.humidity}% RH</Text>
                  </View>
                </View>

                {/* Daylight */}
                <View style={[styles.telemChip, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)', borderColor: colors.border }]}>
                  <View style={[styles.telemIconWrap, { backgroundColor: telemetry.light ? 'rgba(250, 204, 21, 0.15)' : 'rgba(129, 140, 248, 0.15)' }]}>
                    <Feather name={telemetry.light ? 'sun' : 'moon'} size={14} color={telemetry.light ? '#d97706' : '#6366f1'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.telemLabel, { color: colors.textMuted }]}>Light</Text>
                    <Text style={[styles.telemValue, { color: colors.text }]}>{telemetry.light ? 'Daylight' : 'Night'}</Text>
                  </View>
                </View>

                {/* Relay */}
                <View style={[styles.telemChip, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)', borderColor: colors.border }]}>
                  <View style={[styles.telemIconWrap, { backgroundColor: telemetry.pump ? 'rgba(16, 185, 129, 0.18)' : 'rgba(148, 163, 184, 0.15)' }]}>
                    <Feather name="zap" size={14} color={telemetry.pump ? '#10b981' : colors.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.telemLabel, { color: colors.textMuted }]}>Relay</Text>
                    <Text style={[styles.telemValue, { color: telemetry.pump ? '#10b981' : colors.text }]}>
                      {telemetry.pump ? 'Active' : 'Standby'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Moisture Spectrum Bar */}
            <View style={styles.spectrumContainer}>
              <View style={styles.spectrumHeader}>
                <Text style={[styles.spectrumLabel, { color: colors.textMuted }]}>Agronomic Moisture Spectrum</Text>
                <Text style={[styles.spectrumLabel, { color: colors.text, fontWeight: '700' }]}>{telemetry.soilMoisture}% / 100%</Text>
              </View>
              <View style={styles.spectrumTrack}>
                <View style={[styles.spectrumSegment, { flex: 25, backgroundColor: '#ef4444' }]} />
                <View style={[styles.spectrumSegment, { flex: 15, backgroundColor: '#f59e0b' }]} />
                <View style={[styles.spectrumSegment, { flex: 30, backgroundColor: '#10b981' }]} />
                <View style={[styles.spectrumSegment, { flex: 30, backgroundColor: '#3b82f6' }]} />
              </View>
              <View style={styles.spectrumLegend}>
                <Text style={[styles.legendText, { color: '#ef4444' }]}>Dry</Text>
                <Text style={[styles.legendText, { color: '#f59e0b' }]}>Deficit</Text>
                <Text style={[styles.legendText, { color: '#10b981' }]}>Optimal</Text>
                <Text style={[styles.legendText, { color: '#3b82f6' }]}>Wet</Text>
              </View>
            </View>
          </GlassCard>
        </FadeInUp>

        {/* 2. EXPLAINABLE AI DECISION ENGINE */}
        <FadeInUp index={2} distance={14}>
          <GlassCard liquid padding={18} style={styles.card}>
            {/* Header with non-overflowing badge */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.headerIconCircle, { backgroundColor: dark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.10)' }]}>
                  <Feather name="cpu" size={18} color="#10b981" />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>AI Decision Engine</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>5-Step Closed Loop Inference</Text>
                </View>
              </View>
              <View style={[styles.badgePill, { backgroundColor: `${decision.badgeColor}18`, borderColor: `${decision.badgeColor}40`, maxWidth: 140 }]}>
                <Text style={[styles.badgePillText, { color: decision.badgeColor }]} numberOfLines={1}>
                  {decision.badge}
                </Text>
              </View>
            </View>

            {/* Stepper Pipeline UI */}
            <View style={styles.pipelineContainer}>
              {/* Step 1: SENSE */}
              <View style={styles.stepRow}>
                <View style={styles.stepTimeline}>
                  <View style={[styles.stepNode, { backgroundColor: 'rgba(6, 182, 212, 0.15)', borderColor: '#06b6d4' }]}>
                    <Feather name="eye" size={13} color="#06b6d4" />
                  </View>
                  <View style={[styles.stepLine, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
                </View>
                <View style={[styles.stepContentCard, { backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[styles.stepTag, { color: '#06b6d4' }]}>1. SENSE</Text>
                    <Text style={[styles.stepSubTag, { color: colors.textMuted }]}>Hardware Telemetry</Text>
                  </View>
                  <Text style={[styles.stepDescription, { color: colors.text }]}>{decision.pipeline.sense}</Text>
                </View>
              </View>

              {/* Step 2: UNDERSTAND */}
              <View style={styles.stepRow}>
                <View style={styles.stepTimeline}>
                  <View style={[styles.stepNode, { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: '#6366f1' }]}>
                    <Feather name="activity" size={13} color="#6366f1" />
                  </View>
                  <View style={[styles.stepLine, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
                </View>
                <View style={[styles.stepContentCard, { backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[styles.stepTag, { color: '#6366f1' }]}>2. UNDERSTAND</Text>
                    <Text style={[styles.stepSubTag, { color: colors.textMuted }]}>Soil Physics</Text>
                  </View>
                  <Text style={[styles.stepDescription, { color: colors.text }]}>{decision.pipeline.understand}</Text>
                </View>
              </View>

              {/* Step 3: DECIDE */}
              <View style={styles.stepRow}>
                <View style={styles.stepTimeline}>
                  <View style={[styles.stepNode, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b' }]}>
                    <Feather name="git-branch" size={13} color="#f59e0b" />
                  </View>
                  <View style={[styles.stepLine, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
                </View>
                <View style={[styles.stepContentCard, { backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[styles.stepTag, { color: '#f59e0b' }]}>3. DECIDE</Text>
                    <Text style={[styles.stepSubTag, { color: colors.textMuted }]}>Threshold Analysis</Text>
                  </View>
                  <Text style={[styles.stepDescription, { color: colors.text }]}>{decision.pipeline.decide}</Text>
                </View>
              </View>

              {/* Step 4: ACT */}
              <View style={styles.stepRow}>
                <View style={styles.stepTimeline}>
                  <View style={[styles.stepNode, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }]}>
                    <Feather name="zap" size={13} color="#10b981" />
                  </View>
                  <View style={[styles.stepLine, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
                </View>
                <View style={[styles.stepContentCard, { backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[styles.stepTag, { color: '#10b981' }]}>4. ACT</Text>
                    <Text style={[styles.stepSubTag, { color: colors.textMuted }]}>Relay Control</Text>
                  </View>
                  <Text style={[styles.stepDescription, { color: colors.text }]}>{decision.pipeline.act}</Text>
                </View>
              </View>

              {/* Step 5: LEARN */}
              <View style={styles.stepRow}>
                <View style={styles.stepTimeline}>
                  <View style={[styles.stepNode, { backgroundColor: 'rgba(236, 72, 153, 0.15)', borderColor: '#ec4899' }]}>
                    <Feather name="trending-up" size={13} color="#ec4899" />
                  </View>
                </View>
                <View style={[styles.stepContentCard, { backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[styles.stepTag, { color: '#ec4899' }]}>5. LEARN</Text>
                    <Text style={[styles.stepSubTag, { color: colors.textMuted }]}>Predictive Decay</Text>
                  </View>
                  <Text style={[styles.stepDescription, { color: colors.text }]}>{decision.pipeline.learn}</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </FadeInUp>

        {/* 3. PUMP STATION & SMART CONTROL HUB */}
        <FadeInUp index={3} distance={14}>
          <GlassCard liquid padding={18} style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.headerIconCircle, { backgroundColor: dark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.10)' }]}>
                  <Feather name="power" size={18} color="#10b981" />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Pump Station</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>12V Submersible Relay (GPIO 26)</Text>
                </View>
              </View>

              {/* Auto / Manual Mode Pill */}
              <View style={[styles.modeTogglePill, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: colors.border }]}>
                <Text style={[styles.modeToggleLabel, { color: mode === 'AUTO' ? '#10b981' : '#f59e0b' }]}>
                  {mode === 'AUTO' ? 'AUTO' : 'MANUAL'}
                </Text>
                <Switch
                  value={mode === 'AUTO'}
                  onValueChange={(val: boolean) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setMode(val ? 'AUTO' : 'MANUAL');
                  }}
                  trackColor={{ false: '#f59e0b', true: '#10b981' }}
                  thumbColor="#ffffff"
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
            </View>

            {/* Quick Irrigation Timers */}
            <Text style={[styles.timerSectionTitle, { color: colors.textSecondary }]}>
              Scheduled Irrigation Duration:
            </Text>
            <View style={styles.timerRow}>
              {[5, 10, 15, 20].map((mins) => {
                const isSelected = selectedTimer === mins;
                return (
                  <PressableScale
                    key={mins}
                    disabled={telemetry.pump || telemetry.rain}
                    onPress={() => {
                      setSelectedTimer(mins);
                      Haptics.selectionAsync().catch(() => {});
                    }}
                    style={[
                      styles.timerChip,
                      {
                        backgroundColor: isSelected
                          ? (dark ? 'rgba(16, 185, 129, 0.20)' : 'rgba(16, 185, 129, 0.12)')
                          : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
                        borderColor: isSelected
                          ? '#10b981'
                          : colors.border,
                      }
                    ]}
                  >
                    <Feather 
                      name="clock" 
                      size={12} 
                      color={isSelected ? '#10b981' : colors.textMuted} 
                    />
                    <Text style={[
                      styles.timerChipText, 
                      { 
                        color: isSelected ? '#10b981' : colors.text,
                        fontWeight: isSelected ? '800' : '600'
                      }
                    ]}>
                      {mins}m
                    </Text>
                  </PressableScale>
                );
              })}
            </View>

            {/* Main Action Buttons */}
            <View style={styles.actionButtonRow}>
              {telemetry.pump ? (
                <TouchableOpacity
                  onPress={() => handlePumpStop('User clicked stop')}
                  style={[styles.primaryActionBtn, { backgroundColor: '#334155' }]}
                  activeOpacity={0.85}
                >
                  <Feather name="square" size={16} color="#facc15" />
                  <Text style={[styles.actionBtnText, { color: '#ffffff' }]}>Stop Water Cycle</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  disabled={telemetry.rain}
                  onPress={() => handlePumpStart(selectedTimer, `Manual ${selectedTimer}m Run`)}
                  style={[
                    styles.primaryActionBtn, 
                    { 
                      backgroundColor: telemetry.rain ? (dark ? '#334155' : '#cbd5e1') : '#10b981',
                      opacity: telemetry.rain ? 0.6 : 1
                    }
                  ]}
                  activeOpacity={0.85}
                >
                  <Feather name="play" size={16} color="#ffffff" />
                  <Text style={[styles.actionBtnText, { color: '#ffffff' }]}>
                    Start Pump ({selectedTimer}m)
                  </Text>
                </TouchableOpacity>
              )}

              {/* Emergency Cutoff Button */}
              <TouchableOpacity
                onPress={handleEmergencyStop}
                style={[styles.emergencyBtn, { borderColor: '#ef4444' }]}
                activeOpacity={0.85}
              >
                <Feather name="alert-triangle" size={15} color="#ef4444" />
                <Text style={styles.emergencyBtnText}>STOP ALL</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </FadeInUp>

        {/* 4. RECENT IRRIGATION AUDIT LOG */}
        <FadeInUp index={4} distance={14}>
          <SectionTitle>Recent Irrigation Sessions</SectionTitle>
          <View style={{ gap: 8, marginTop: 4 }}>
            {history.map((h) => (
              <GlassCard key={h.id} padding={14} style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <View style={[styles.historyIconCircle, { backgroundColor: h.mode === 'AUTO' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)' }]}>
                    <Feather name="droplet" size={16} color={h.mode === 'AUTO' ? '#10b981' : '#f59e0b'} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.historyTime, { color: colors.text }]}>{h.time}</Text>
                    <Text style={[styles.historyDetails, { color: colors.textMuted }]}>
                      {h.reason} • {h.shift}
                    </Text>
                  </View>
                  <View style={[styles.historyBadge, { backgroundColor: h.mode === 'AUTO' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', borderColor: h.mode === 'AUTO' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)' }]}>
                    <Text style={[styles.historyBadgeText, { color: h.mode === 'AUTO' ? '#10b981' : '#f59e0b' }]}>
                      {h.mode} • {h.duration}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        </FadeInUp>
      </View>

      {/* FIREBASE RTDB CONFIG MODAL */}
      <Modal
        visible={firebaseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFirebaseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.headerIconCircle, { backgroundColor: 'rgba(249, 115, 22, 0.14)' }]}>
                  <Feather name="cpu" size={18} color="#f97316" />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Firebase RTDB Sync</Text>
              </View>
              <TouchableOpacity onPress={() => setFirebaseModalVisible(false)} hitSlop={10}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalToggleRow, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalToggleLabel, { color: colors.text }]}>Enable Cloud Telemetry</Text>
                <Text style={[styles.modalToggleSub, { color: colors.textMuted }]}>Stream realtime sensor data from hardware</Text>
              </View>
              <Switch
                value={firebaseEnabled}
                onValueChange={(val: boolean) => setFirebaseEnabled(val)}
                trackColor={{ false: colors.border, true: '#f97316' }}
              />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Firebase RTDB URL:
            </Text>
            <TextInput
              value={firebaseUrl}
              onChangeText={setFirebaseUrl}
              placeholder="https://your-project-default-rtdb.firebaseio.com"
              placeholderTextColor={colors.textMuted}
              style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}
              autoCapitalize="none"
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 12 }]}>
              Device RTDB Path:
            </Text>
            <TextInput
              value={firebasePath}
              onChangeText={setFirebasePath}
              placeholder="/devices/krishiai-node-01"
              placeholderTextColor={colors.textMuted}
              style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}
              autoCapitalize="none"
            />

            {firebaseStatusText ? (
              <View style={styles.statusBox}>
                <Text style={[styles.statusText, { color: firebaseConnected ? '#10b981' : '#f59e0b' }]}>
                  {firebaseStatusText}
                </Text>
              </View>
            ) : null}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={testFirebaseConnection}
                style={[styles.modalSecondaryBtn, { borderColor: colors.border, backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              >
                <Text style={[styles.modalSecondaryBtnText, { color: colors.text }]}>Test Connection</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFirebaseModalVisible(false)}
                style={[styles.modalPrimaryBtn, { backgroundColor: '#f97316' }]}
              >
                <Text style={styles.modalPrimaryBtnText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HARDWARE SIMULATOR MODAL */}
      <Modal
        visible={simulatorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSimulatorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.headerIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
                  <Feather name="sliders" size={18} color="#10b981" />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Hardware Simulator</Text>
              </View>
              <TouchableOpacity onPress={() => setSimulatorModalVisible(false)} hitSlop={10}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Agricultural Test Scenarios:
            </Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                onPress={() => applyPreset('DRY')}
                style={[styles.presetBtn, { borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
              >
                <Text style={[styles.presetBtnText, { color: '#ef4444' }]}>🚨 Dry (18%)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => applyPreset('RAIN')}
                style={[styles.presetBtn, { borderColor: 'rgba(59, 130, 246, 0.3)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}
              >
                <Text style={[styles.presetBtnText, { color: '#3b82f6' }]}>🌧️ Rain Active</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => applyPreset('OPTIMAL')}
                style={[styles.presetBtn, { borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}
              >
                <Text style={[styles.presetBtnText, { color: '#10b981' }]}>🌾 Optimal (55%)</Text>
              </TouchableOpacity>
            </View>

            {/* Quick sensor toggles */}
            <View style={{ gap: 12, marginTop: 6 }}>
              <View style={styles.simToggleRow}>
                <View>
                  <Text style={[styles.simToggleLabel, { color: colors.text }]}>Rain Sensor (FC-37)</Text>
                  <Text style={[styles.simToggleSub, { color: colors.textMuted }]}>Simulates surface rainfall</Text>
                </View>
                <Switch
                  value={telemetry.rain}
                  onValueChange={(val: boolean) => setTelemetry(prev => ({ ...prev, rain: val }))}
                  trackColor={{ false: colors.border, true: '#3b82f6' }}
                />
              </View>

              <View style={styles.simToggleRow}>
                <View>
                  <Text style={[styles.simToggleLabel, { color: colors.text }]}>Sunlight Photocell (HW-072)</Text>
                  <Text style={[styles.simToggleSub, { color: colors.textMuted }]}>Toggles Daylight vs Night cycle</Text>
                </View>
                <Switch
                  value={telemetry.light}
                  onValueChange={(val: boolean) => setTelemetry(prev => ({ ...prev, light: val }))}
                  trackColor={{ false: colors.border, true: '#facc15' }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSimulatorModalVisible(false)}
              style={[styles.modalPrimaryBtn, { backgroundColor: '#10b981', marginTop: 22 }]}
            >
              <Text style={styles.modalPrimaryBtnText}>Close Simulator</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentWrap: {
    gap: 16,
    paddingBottom: 28,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncBannerText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  rainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  rainIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  rainBannerSub: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 106,
  },
  gaugeOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  gaugeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValueText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  gaugeAdcText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  gaugeStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  telemetryGrid: {
    flex: 1,
    gap: 8,
  },
  telemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  telemIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  telemValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  spectrumContainer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.12)',
  },
  spectrumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  spectrumLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  spectrumTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
  },
  spectrumSegment: {
    height: '100%',
    borderRadius: 2,
  },
  spectrumLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pipelineContainer: {
    gap: 4,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepTimeline: {
    alignItems: 'center',
    width: 24,
  },
  stepNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  stepContentCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    gap: 2,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stepSubTag: {
    fontSize: 9,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 2,
  },
  modeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingLeft: 8,
    paddingRight: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeToggleLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  timerSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  timerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timerChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  timerChipText: {
    fontSize: 12,
  },
  actionButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  emergencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emergencyBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ef4444',
    letterSpacing: 0.4,
  },
  historyCard: {
    borderRadius: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTime: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyDetails: {
    fontSize: 11,
    fontWeight: '500',
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalToggleLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalToggleSub: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  statusBox: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalSecondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  simToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simToggleLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  simToggleSub: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
});
