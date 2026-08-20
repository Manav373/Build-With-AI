import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';
import { useRouter } from 'expo-router';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 280;

const STRINGS = {
  en: {
    title: 'Satellite',
    subtitle: 'NDVI Map View',
    ndviLabel: 'NDVI Vegetation',
    moistureLabel: 'Soil Moisture Heatmap',
    rgbLabel: 'True Color RGB',
    weeklyHistory: 'Weekly Imagery History',
    analyticsTitle: 'AI Spatial Crop Analytics',
    plotALabel: 'Plot A (Wheat)',
    plotBLabel: 'Plot B (Bare/Dry)',
    healthyText: 'Healthy',
    alertText: 'Alert',
    ndviValue: 'NDVI: 0.82',
    ndviValueLow: 'NDVI: 0.45',
    moistureValue: 'Moisture: 58%',
    moistureValueLow: 'Moisture: 22%',
    analyticsDesc: '1. **Plot A (Wheat)**: Chlorophyll density is at optimal peak index (0.82 NDVI). Nitrogen accumulation is steady. Sowing completed efficiently.{"\n\n"}2. **Plot B (Vegetables)**: Dry patches detected at borders (moisture 22%). Drip pipe lines may be clogged. Inspect irrigation lines.',
  },
  hi: {
    title: 'सैटेलाइट',
    subtitle: 'NDVI मानचित्र दृश्य',
    ndviLabel: 'NDVI वनस्पति',
    moistureLabel: 'मिट्टी नमी हीटमैप',
    rgbLabel: 'सच्चा रंग RGB',
    weeklyHistory: 'साप्ताहिक इमेजरी इतिहास',
    analyticsTitle: 'AI स्थानिक पाक विश्लेषण',
    plotALabel: 'प्लॉट A (गेहूं)',
    plotBLabel: 'प्लॉट B (नंगी/सूखी)',
    healthyText: 'स्वस्थ',
    alertText: 'सतर्कता',
    ndviValue: 'NDVI: 0.82',
    ndviValueLow: 'NDVI: 0.45',
    moistureValue: 'नमी: 58%',
    moistureValueLow: 'नमी: 22%',
    analyticsDesc: '1. **प्लॉट A (गेहूं)**: क्लोरोफिल घनत्व सर्वोत्तम चोटी सूचकांक (0.82 NDVI) पर है। नाइट्रोजन जमा स्थिर है। बुवाई कुशलतापूर्वक पूरी हुई।{"\n\n"}2. **प्लॉट B (सब्जियां)**: किनारों पर सूखे धब्बे (नमी 22%) का पता चला। ड्रिप पाइप लाइनें अवरुद्ध हो सकती हैं। सिंचाई लाइनों का निरीक्षण करें।',
  },
  gu: {
    title: 'સેટેલાઇટ',
    subtitle: 'NDVI નકશો દૃશ્ય',
    ndviLabel: 'NDVI વનસ્પતી',
    moistureLabel: 'જમીન ભેજ હીટમેપ',
    rgbLabel: 'સાચો રંગ RGB',
    weeklyHistory: 'સાપ્તાહિક ઇમેજરી ઇતિહાસ',
    analyticsTitle: 'AI અવકાશીય પાક વિશ્લેષણ',
    plotALabel: 'પ્લોટ A (ઘઉં)',
    plotBLabel: 'પ્લોટ B (ખાલી/શુષ્ક)',
    healthyText: 'સ્વસ્થ',
    alertText: 'ચેતવણી',
    ndviValue: 'NDVI: 0.82',
    ndviValueLow: 'NDVI: 0.45',
    moistureValue: 'ભેજ: 58%',
    moistureValueLow: 'ભેજ: 22%',
    analyticsDesc: '1. **પ્લોટ A (ઘઉં)**: ક્લોરોફિલ ઘનતા સર્વોચ્ચ શિખર સૂચકાંક (0.82 NDVI) પર છે. નાઇટ્રોજન સંચય સ્થિર છે. વાવણી કુશળતાપૂર્વક પૂર્ણ હતી.{"\n\n"}2. **પ્લોટ B (શાકભાજી)**: કોરાઓ પર શુષ્ક પાચ (ભેજ 22%) શોધાયા. ટીપક પાઇપ લાઇનો અવરોધિત હોઈ શકે છે. સિંચાઈ લાઇનોનું નિરીક્ષણ કરો.',
  },
  mr: {
    title: 'सॅटेलाइट',
    subtitle: 'NDVI नकाशा दृश्य',
    ndviLabel: 'NDVI वनस्पती',
    moistureLabel: 'जमीन आर्द्रता हीटमॅप',
    rgbLabel: 'सत्य रंग RGB',
    weeklyHistory: 'साप्ताहिक इमेजरी इतिहास',
    analyticsTitle: 'AI स्थानिक पिक विश्लेषण',
    plotALabel: 'प्लॉट A (गव्हार)',
    plotBLabel: 'प्लॉट B (नग्न/कोरड)',
    healthyText: 'निरोगी',
    alertText: 'सतर्कता',
    ndviValue: 'NDVI: 0.82',
    ndviValueLow: 'NDVI: 0.45',
    moistureValue: 'आर्द्रता: 58%',
    moistureValueLow: 'आर्द्रता: 22%',
    analyticsDesc: '1. **प्लॉट A (गव्हार)**: क्लोरोफिल घनता सर्वोच्च शिखर निर्देशांक (0.82 NDVI) वर आहे. नायट्रोजन संचय स्थिर आहे. बुवाई कुशलतेने पूर्ण झाली.{"\n\n"}2. **प्लॉट B (भाजी)**: सीमांवर कोरड डाग (आर्द्रता 22%) आढळले. ड्रिप पाईप लाइने अवरोधित असू शकतात. सिंचन लाइन तपासा.',
  },
};

export default function SatelliteScreen() {
  const colors = useThemeColors();
  const t = useType();
  const scheme = useColorScheme();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);

  // Layer state: ndvi | moisture | satellite
  const [activeLayer, setActiveLayer] = useState<'ndvi' | 'moisture' | 'satellite'>('ndvi');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedDate, setSelectedDate] = useState('June 22');

  const layers = [
    { id: 'ndvi', label: s.ndviLabel, icon: 'leaf' },
    { id: 'moisture', label: s.moistureLabel, icon: 'droplet' },
    { id: 'satellite', label: s.rgbLabel, icon: 'globe' },
  ] as const;

  const datesList = ['June 08', 'June 15', 'June 22'] as const;

  const handleZoom = (type: 'in' | 'out') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setZoomLevel(prev => {
      if (type === 'in') return Math.min(prev + 0.25, 2.0);
      return Math.max(prev - 0.25, 0.75);
    });
  };

  const handleDateSelect = (d: typeof datesList[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedDate(d);
  };

  return (
    <Screen
      title={s.title}
      emoji="🛰️"
      subtitle={s.subtitle}
      back
      right={<HeaderIconButton icon="info" onPress={() => {}} label="Info" />}
    >
      {/* Layer Selector Chips */}
      <FadeInUp index={0} distance={16}>
        <View style={styles.layerSelectorBar}>
          {layers.map(layer => (
            <PressableScale
              key={layer.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setActiveLayer(layer.id);
              }}
              haptic="light"
            >
              <View
                style={[
                  styles.layerChip,
                  {
                    backgroundColor: activeLayer === layer.id ? colors.accent : colors.surfaceElevated,
                    borderColor: activeLayer === layer.id ? 'transparent' : colors.border,
                  },
                ]}
              >
                <Feather name={layer.icon as any} size={13} color={activeLayer === layer.id ? '#ffffff' : colors.text} />
                <Text numberOfLines={1} style={[t.label, { color: activeLayer === layer.id ? '#ffffff' : colors.textSecondary, flexShrink: 1 }]}>
                  {layer.label}
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>
      </FadeInUp>

      {/* GIS Interactive map simulator */}
      <FadeInUp index={1} distance={16}>
        <View style={[styles.mapContainer, { borderColor: colors.border, backgroundColor: colors.surfaceElevated, ...DesignTokens.shadow.level1 }]}>
          {/* Map canvas scale grid */}
          <View style={[styles.mapCanvas, { transform: [{ scale: zoomLevel }] }]}>
            {/* Field boundaries */}
            <View style={styles.fieldBoundaryA}>
              <LinearGradient
                colors={
                  activeLayer === 'ndvi'
                    ? ['rgba(74, 222, 128, 0.4)', 'rgba(34, 197, 94, 0.6)']
                    : activeLayer === 'moisture'
                    ? ['rgba(59, 130, 246, 0.5)', 'rgba(29, 78, 216, 0.6)']
                    : ['#2E7D32', '#66BB6A']
                }
                style={styles.fieldFill}
              >
                <Text style={styles.fieldLabel} numberOfLines={1}>{s.plotALabel}</Text>
                <Text style={styles.fieldIndex} numberOfLines={1}>
                  {activeLayer === 'ndvi' ? s.ndviValue : activeLayer === 'moisture' ? s.moistureValue : s.healthyText}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.fieldBoundaryB}>
              <LinearGradient
                colors={
                  activeLayer === 'ndvi'
                    ? ['rgba(234, 179, 8, 0.4)', 'rgba(239, 68, 68, 0.3)']
                    : activeLayer === 'moisture'
                    ? ['rgba(239, 68, 68, 0.3)', 'rgba(244, 63, 94, 0.4)']
                    : ['#f59e0b', '#ef4444']
                }
                style={styles.fieldFill}
              >
                <Text style={styles.fieldLabel} numberOfLines={1}>{s.plotBLabel}</Text>
                <Text style={styles.fieldIndex} numberOfLines={1}>
                  {activeLayer === 'ndvi' ? s.ndviValueLow : activeLayer === 'moisture' ? s.moistureValueLow : s.alertText}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Floating zoom keys */}
          <View style={styles.zoomControls}>
            <PressableScale onPress={() => handleZoom('in')} haptic="light">
              <View style={[styles.zoomBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Feather name="plus" size={16} color={colors.text} />
              </View>
            </PressableScale>
            <PressableScale onPress={() => handleZoom('out')} haptic="light">
              <View style={[styles.zoomBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Feather name="minus" size={16} color={colors.text} />
              </View>
            </PressableScale>
          </View>
        </View>
      </FadeInUp>

      {/* Timeline Slider */}
      <FadeInUp index={2} distance={16}>
        <GlassCard padding={20}>
          <Text style={[t.title, { color: colors.text, marginBottom: 12, fontWeight: '800' }]}>{s.weeklyHistory}</Text>
          <View style={styles.dateRow}>
            {datesList.map(d => (
              <PressableScale
                key={d}
                onPress={() => handleDateSelect(d)}
                haptic="light"
              >
                <View
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: selectedDate === d ? colors.accent : colors.surfaceElevated,
                      borderColor: selectedDate === d ? 'transparent' : colors.border,
                    },
                  ]}
                >
                  <Text style={[t.label, { color: selectedDate === d ? '#ffffff' : colors.text }]}>{d}</Text>
                </View>
              </PressableScale>
            ))}
          </View>
        </GlassCard>
      </FadeInUp>

      {/* AI Satellite Analytics */}
      <FadeInUp index={3} distance={16}>
        <GlassCard padding={20}>
          <View style={styles.analysisHeader}>
            <MaterialCommunityIcons name="brain" size={18} color={colors.accent} />
            <Text numberOfLines={1} style={[t.title, { color: colors.text, fontWeight: '800', flex: 1 }]}>{s.analyticsTitle}</Text>
          </View>
          <Text style={[t.body, { color: colors.textSecondary, lineHeight: 19 }]}>
            {s.analyticsDesc}
          </Text>
        </GlassCard>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layerSelectorBar: { gap: 8, flexDirection: 'row', flexWrap: 'wrap' },
  layerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  mapContainer: {
    height: MAP_HEIGHT,
    borderRadius: DesignTokens.radius.extraLarge,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCanvas: {
    width: width - 40,
    height: MAP_HEIGHT - 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  fieldBoundaryA: {
    width: 130,
    height: 160,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  fieldBoundaryB: {
    width: 120,
    height: 160,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  fieldFill: { flex: 1, padding: 12, justifyContent: 'center', gap: 4 },
  fieldLabel: { color: '#ffffff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  fieldIndex: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  zoomControls: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    gap: 8,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
});
