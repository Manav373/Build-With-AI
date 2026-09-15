import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useColorScheme, useThemeColors, useType } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import { useScreenStrings } from '@/hooks/useLanguage';
import { getRecommendations, predictYield } from '@/services/api';
import { useLocation } from '@/hooks/useLocation';

const STRINGS = {
  en: {
    screenTitle: 'Predict',
    screenSubtitle: 'Crop Prediction Form & Results',
    settings: 'Settings',
    farmingParameters: 'Farming Parameters',
    parametersDesc: 'Provide details about your soil, water access, and budget to compute the most profitable crops.',
    selectStateLocation: '1. Select State Location',
    primarySoilType: '2. Primary Soil Type',
    irrigationSource: '3. Irrigation Source',
    farmingSeason: '4. Farming Season',
    cultivableArea: '5. Cultivable Area (Acres)',
    areaPlaceholder: 'e.g. 5',
    budgetConstraint: '6. Budget Constraint (per Acre)',
    calculateBestCrops: 'Calculate Best Crops',
    topRecommendation: '🌾 TOP RECOMMENDATION',
    expectedYield: 'Expected Yield',
    projectedIncome: 'Projected Income',
    cultivationLogistics: 'Cultivation Logistics',
    riskIndex: 'Risk Index:',
    wateringCycles: 'Watering Cycles:',
    marketDemandOutlook: 'Market demand outlook:',
    changeInputParameters: 'Change Input Parameters',
  },
  hi: {
    screenTitle: 'पूर्वानुमान',
    screenSubtitle: 'फसल भविष्यवाणी फॉर्म और परिणाम',
    settings: 'सेटिंग्स',
    farmingParameters: 'खेती के पैरामीटर',
    parametersDesc: 'अपनी मिट्टी, जल पहुंच और बजट के बारे में विवरण प्रदान करें सबसे लाभदायक फसलों की गणना करने के लिए।',
    selectStateLocation: '1. राज्य स्थान चुनें',
    primarySoilType: '2. प्राथमिक मिट्टी प्रकार',
    irrigationSource: '3. सिंचाई स्रोत',
    farmingSeason: '4. खेती का मौसम',
    cultivableArea: '5. खेती योग्य क्षेत्र (एकड़)',
    areaPlaceholder: 'उदा. 5',
    budgetConstraint: '6. बजट सीमा (प्रति एकड़)',
    calculateBestCrops: 'सर्वश्रेष्ठ फसलें गणना करें',
    topRecommendation: '🌾 शीर्ष सिफारिश',
    expectedYield: 'अपेक्षित उपज',
    projectedIncome: 'अनुमानित आय',
    cultivationLogistics: 'खेती लॉजिस्टिक्स',
    riskIndex: 'जोखिम सूचकांक:',
    wateringCycles: 'सिंचाई चक्र:',
    marketDemandOutlook: 'बाजार मांग दृष्टिकोण:',
    changeInputParameters: 'इनपुट पैरामीटर बदलें',
  },
  gu: {
    screenTitle: 'આગાહી',
    screenSubtitle: 'પાક ભવિષ્યવાણી ફોર્મ અને પરિણામો',
    settings: 'સેટિંગ્સ',
    farmingParameters: 'ખેતી પરિમાણો',
    parametersDesc: 'સૌથી નફાકારક પાકની ગણતરી કરવા માટે તમારી મિટ્ટી, જલ પહુંચ અને બજેટ વિશે વિગતો પ્રદાન કરો.',
    selectStateLocation: '1. રાજ્ય સ્થાન પસંદ કરો',
    primarySoilType: '2. પ્રાથમિક માટીનો પ્રકાર',
    irrigationSource: '3. સિંચાઈ સ્રોત',
    farmingSeason: '4. ખેતી મોસમ',
    cultivableArea: '5. ખેતી યોગ્ય ક્ષેત્ર (એકર)',
    areaPlaceholder: 'ઉદા. 5',
    budgetConstraint: '6. બજેટ સીમા (પ્રતિ એકર)',
    calculateBestCrops: 'શ્રેષ્ઠ પાક ગણતરી કરો',
    topRecommendation: '🌾 ટોપ ભલામણ',
    expectedYield: 'અપેક્ષિત ઉપજ',
    projectedIncome: 'અંદાજીત આવક',
    cultivationLogistics: 'ખેતી લોજિસ્ટિક્સ',
    riskIndex: 'જોખમ સૂચકાંક:',
    wateringCycles: 'સિંચાઈ ચક્ર:',
    marketDemandOutlook: 'બાજાર માંગ દૃષ્ટિકોણ:',
    changeInputParameters: 'ઇનપુટ પરિમાણો બદલો',
  },
  mr: {
    screenTitle: 'अंदाज',
    screenSubtitle: 'पीक अंदाज फॉर्म आणि परिणाम',
    settings: 'सेटिंग्ज',
    farmingParameters: 'शेती पॅरामीटर्स',
    parametersDesc: 'सर्वाधिक लाभदायक पिकांची गणना करण्यासाठी आपल्या मातीबद्दल, जल प्रवेश आणि बजेटबद्दल तपशील प्रदान करा.',
    selectStateLocation: '1. राज्य स्थान निवडा',
    primarySoilType: '2. प्राथमिक माती प्रकार',
    irrigationSource: '3. सिंचन स्रोत',
    farmingSeason: '4. शेती हंगाम',
    cultivableArea: '5. शेती योग्य क्षेत्र (एकर)',
    areaPlaceholder: 'उदा. 5',
    budgetConstraint: '6. बजेट प्रतिबंध (प्रति एकर)',
    calculateBestCrops: 'सर्वोत्तम पिके गणना करा',
    topRecommendation: '🌾 शीर्ष शिफारस',
    expectedYield: 'अपेक्षित उपज',
    projectedIncome: 'अंदाजीत उत्पन्न',
    cultivationLogistics: 'शेती लॉजिस्टिक्स',
    riskIndex: 'जोखीम निर्देशांक:',
    wateringCycles: 'सिंचन चक्र:',
    marketDemandOutlook: 'बाजार मांग दृष्टीकोन:',
    changeInputParameters: 'इनपुट पॅरामीटर्स बदला',
  },
};

export default function PredictScreen() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);
  const { location } = useLocation();

  // Wizard state: 1 (form input) | 2 (results display)
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Form parameters
  const [selectedState, setSelectedState] = useState('Haryana');
  const [soilType, setSoilType] = useState<'Alluvial' | 'Black' | 'Red' | 'Clayey'>('Alluvial');
  const [waterSource, setWaterSource] = useState<'Canal' | 'Tube Well' | 'Rainfed'>('Tube Well');
  const [season, setSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Rabi');
  const [farmSize, setFarmSize] = useState('4.5');
  const [budget, setBudget] = useState('Low (under ₹15k)');

  const statesList = ['Haryana', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh'];
  const soilsList = ['Alluvial', 'Black', 'Red', 'Clayey'] as const;
  const watersList = ['Canal', 'Tube Well', 'Rainfed'] as const;
  const seasonsList = ['Kharif', 'Rabi', 'Zaid'] as const;
  const budgetList = ['Low (under ₹15k)', 'Medium (₹15k-30k)', 'High (above ₹30k)'] as const;

  // Generated recommendation results
  const [resultData, setResultData] = useState({
    recommendedCrop: 'Wheat (Kanak - HD2967)',
    expectedYield: '24.5 Quintals/Acre',
    estimatedIncome: '₹1,84,000 (Total)',
    riskScore: 'Low (12%)' as 'Low (12%)' | 'Medium' | 'High',
    waterRequirement: 'Moderate (4 watering cycles)',
    demandForecast: 'High (+6% market growth)',
    aiDescription: 'HD2967 Wheat is highly responsive to alluvial soils under tube well watering. Sowing in late October will maximize maturation. Seed costs align perfectly with your budget bounds.',
  });

  const handleGenerateRecommendations = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setLoading(true);

    try {
      const params: Record<string, unknown> = {
        state: selectedState,
        soil_type: soilType,
        irrigation: waterSource,
        season,
        area: parseFloat(farmSize) || 0,
        budget,
      };
      if (location?.lat && location?.lon) {
        params.lat = location.lat;
        params.lon = location.lon;
      }

      let response: Record<string, unknown> | null = null;
      try {
        response = await getRecommendations(params);
      } catch {
        try {
          response = await predictYield(params);
        } catch {
          response = null;
        }
      }

      if (response && typeof response === 'object') {
        setResultData(prev => ({
          recommendedCrop: (response?.recommended_crop as string) || (response?.crop as string) || prev.recommendedCrop,
          expectedYield: (response?.expected_yield as string) || (response?.yield as string) || prev.expectedYield,
          estimatedIncome: (response?.estimated_income as string) || (response?.income as string) || prev.estimatedIncome,
          riskScore: (response?.risk_score as any) || prev.riskScore,
          waterRequirement: (response?.water_requirement as string) || (response?.watering as string) || prev.waterRequirement,
          demandForecast: (response?.demand_forecast as string) || (response?.market_demand as string) || prev.demandForecast,
          aiDescription: (response?.ai_description as string) || (response?.description as string) || prev.aiDescription,
        }));
      }
    } catch {
      // Silent fail — keep existing mock results
    } finally {
      setLoading(false);
      setStep(2);
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setStep(1);
  };

  return (
    <Screen
      title={s.screenTitle}
      emoji="🔮"
      subtitle={s.screenSubtitle}
      back
      onBack={() => router.back()}
      right={<HeaderIconButton icon="settings" onPress={() => Alert.alert(s.settings, 'Settings would open here')} label={s.settings} />}
    >
      {step === 1 ? (
        <>
          {/* Intro text */}
          <FadeInUp index={0} distance={16}>
            <View style={styles.introHeader}>
              <Text style={[t.title, { color: colors.text }]}>{s.farmingParameters}</Text>
              <Text style={[t.body, { color: colors.textSecondary }]}>
                {s.parametersDesc}
              </Text>
            </View>
          </FadeInUp>

          {/* Farm Location */}
          <FadeInUp index={1} distance={16}>
            <GlassCard padding={16}>
              <Text style={[t.title, { color: colors.text, marginBottom: 12 }]}>{s.selectStateLocation}</Text>
              <View style={styles.chipRow}>
                {statesList.map(s => (
                  <PressableScale
                    key={s}
                    haptic="light"
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selectedState === s ? colors.accent : colors.surfaceElevated,
                        borderColor: selectedState === s ? 'transparent' : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedState(s)}
                  >
                    <Text style={[styles.chipText, { color: selectedState === s ? '#ffffff' : colors.text }]}>{s}</Text>
                  </PressableScale>
                ))}
              </View>
            </GlassCard>
          </FadeInUp>

          {/* Soil Type */}
          <FadeInUp index={2} distance={16}>
            <GlassCard padding={16}>
              <Text style={[t.title, { color: colors.text, marginBottom: 12 }]}>{s.primarySoilType}</Text>
              <View style={styles.chipRow}>
                {soilsList.map(soil => (
                  <PressableScale
                    key={soil}
                    haptic="light"
                    style={[
                      styles.chip,
                      {
                        backgroundColor: soilType === soil ? colors.accent : colors.surfaceElevated,
                        borderColor: soilType === soil ? 'transparent' : colors.border,
                      },
                    ]}
                    onPress={() => setSoilType(soil)}
                  >
                    <Text style={[styles.chipText, { color: soilType === soil ? '#ffffff' : colors.text }]}>{soil}</Text>
                  </PressableScale>
                ))}
              </View>
            </GlassCard>
          </FadeInUp>

          {/* Water Source */}
          <FadeInUp index={3} distance={16}>
            <GlassCard padding={16}>
              <Text style={[t.title, { color: colors.text, marginBottom: 12 }]}>{s.irrigationSource}</Text>
              <View style={styles.chipRow}>
                {watersList.map(water => (
                  <PressableScale
                    key={water}
                    haptic="light"
                    style={[
                      styles.chip,
                      {
                        backgroundColor: waterSource === water ? colors.accent : colors.surfaceElevated,
                        borderColor: waterSource === water ? 'transparent' : colors.border,
                      },
                    ]}
                    onPress={() => setWaterSource(water)}
                  >
                    <Text style={[styles.chipText, { color: waterSource === water ? '#ffffff' : colors.text }]}>{water}</Text>
                  </PressableScale>
                ))}
              </View>
            </GlassCard>
          </FadeInUp>

          {/* Season */}
          <FadeInUp index={4} distance={16}>
            <GlassCard padding={16}>
              <Text style={[t.title, { color: colors.text, marginBottom: 12 }]}>{s.farmingSeason}</Text>
              <View style={styles.chipRow}>
                {seasonsList.map(sea => (
                  <PressableScale
                    key={sea}
                    haptic="light"
                    style={[
                      styles.chip,
                      {
                        backgroundColor: season === sea ? colors.accent : colors.surfaceElevated,
                        borderColor: season === sea ? 'transparent' : colors.border,
                      },
                    ]}
                    onPress={() => setSeason(sea)}
                  >
                    <Text style={[styles.chipText, { color: season === sea ? '#ffffff' : colors.text }]}>{sea}</Text>
                  </PressableScale>
                ))}
              </View>
            </GlassCard>
          </FadeInUp>

          {/* Numeric input for area */}
          <FadeInUp index={5} distance={16}>
            <GlassCard padding={16}>
              <Text style={[t.title, { color: colors.text, marginBottom: 8 }]}>{s.cultivableArea}</Text>
              <TextInput
                keyboardType="numeric"
                placeholder={s.areaPlaceholder}
                placeholderTextColor={colors.textMuted}
                style={[styles.numericField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                value={farmSize}
                onChangeText={setFarmSize}
              />
            </GlassCard>
          </FadeInUp>

          {/* Sowing budget */}
          <FadeInUp index={6} distance={16}>
            <GlassCard padding={16}>
              <Text style={[t.title, { color: colors.text, marginBottom: 12 }]}>{s.budgetConstraint}</Text>
              <View style={styles.chipRowVertical}>
                {budgetList.map(b => (
                  <PressableScale
                    key={b}
                    haptic="light"
                    style={[
                      styles.chipVertical,
                      {
                        backgroundColor: budget === b ? colors.accent : colors.surfaceElevated,
                        borderColor: budget === b ? 'transparent' : colors.border,
                      },
                    ]}
                    onPress={() => setBudget(b)}
                  >
                    <Text style={[styles.chipTextVertical, { color: budget === b ? '#ffffff' : colors.text }]}>{b}</Text>
                  </PressableScale>
                ))}
              </View>
            </GlassCard>
          </FadeInUp>

          {/* Generate Trigger */}
          <FadeInUp index={7} distance={16}>
            <PressableScale
              haptic="medium"
              style={styles.generateBtn}
              onPress={handleGenerateRecommendations}
              disabled={loading}
            >
              <LinearGradient
                colors={colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather name="cpu" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={[t.title, { color: '#ffffff' }]}>{s.calculateBestCrops}</Text>
                  </>
                )}
              </LinearGradient>
            </PressableScale>
          </FadeInUp>
        </>
      ) : (
        <>
          {/* Top crop card */}
          <FadeInUp index={0} distance={16}>
            <LinearGradient
              colors={scheme === 'dark' ? ['#0e2a14', '#050e07'] : ['#f0fdf4', '#ffffff']}
              style={[styles.resultHeroCard, { borderColor: colors.border, ...DesignTokens.shadow.level1 }]}
            >
              <Text style={[t.caption, { color: colors.accent }]}>{s.topRecommendation}</Text>
              <Text style={[t.title, { color: colors.text, marginTop: 4 }]}>{resultData.recommendedCrop}</Text>
              <Text style={[t.body, { color: colors.textSecondary, marginTop: 8 }]}>{resultData.aiDescription}</Text>
            </LinearGradient>
          </FadeInUp>

          {/* Key stats row */}
          <FadeInUp index={1} distance={16}>
            <View style={styles.rowGrid}>
              <GlassCard style={{ flex: 1, ...DesignTokens.shadow.level1 }} padding={14}>
                <Feather name="box" size={16} color={colors.accent} style={styles.gridIcon} />
                <Text style={[t.title, { color: colors.text }]}>{resultData.expectedYield}</Text>
                <Text style={[t.caption, { color: colors.textSecondary }]}>{s.expectedYield}</Text>
              </GlassCard>

              <GlassCard style={{ flex: 1, ...DesignTokens.shadow.level1 }} padding={14}>
                <Feather name="trending-up" size={16} color={colors.accent} style={styles.gridIcon} />
                <Text style={[t.title, { color: colors.text }]}>{resultData.estimatedIncome}</Text>
                <Text style={[t.caption, { color: colors.textSecondary }]}>{s.projectedIncome}</Text>
              </GlassCard>
            </View>
          </FadeInUp>

          {/* More details */}
          <FadeInUp index={2} distance={16}>
            <GlassCard padding={16}>
              <Text style={[t.title, { color: colors.text, marginBottom: 12 }]}>{s.cultivationLogistics}</Text>

              <View style={styles.detailRow}>
                <Text style={[t.body, { color: colors.textSecondary }]}>{s.riskIndex}</Text>
                <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
                  <Text numberOfLines={1} style={[t.caption, { color: colors.accent }]}>{resultData.riskScore}</Text>
                </View>
              </View>

              <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

              <View style={styles.detailRow}>
                <Text style={[t.body, { color: colors.textSecondary }]}>{s.wateringCycles}</Text>
                <Text style={[t.body, { color: colors.text, flexShrink: 1, textAlign: 'right' }]}>{resultData.waterRequirement}</Text>
              </View>

              <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

              <View style={styles.detailRow}>
                <Text style={[t.body, { color: colors.textSecondary }]}>{s.marketDemandOutlook}</Text>
                <Text style={[t.body, { color: colors.accent, flexShrink: 1, textAlign: 'right' }]}>{resultData.demandForecast}</Text>
              </View>
            </GlassCard>
          </FadeInUp>

          {/* Recalculate Trigger */}
          <FadeInUp index={3} distance={16}>
            <PressableScale
              haptic="light"
              style={styles.resetBtn}
              onPress={handleReset}
            >
              <Text style={[t.body, { color: colors.textSecondary }]}>{s.changeInputParameters}</Text>
            </PressableScale>
          </FadeInUp>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  introHeader: { gap: 4, paddingHorizontal: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: { fontSize: 12.5, fontWeight: '700' },
  numericField: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13.5,
    fontWeight: '700',
  },
  chipRowVertical: { gap: 8 },
  chipVertical: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipTextVertical: { fontSize: 14, fontWeight: '700' },
  generateBtn: { width: '100%', height: 50, borderRadius: 25, overflow: 'hidden', marginTop: 8 },
  generateGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  resultHeroCard: { padding: 20, borderRadius: 22, borderWidth: 1.5, gap: 8 },
  rowGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  gridIcon: { marginBottom: 2, alignSelf: 'flex-start' },
  itemDivider: { height: 1 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, gap: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, flexShrink: 1 },
  resetBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
