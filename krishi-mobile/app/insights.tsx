import React from 'react';
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
const GRID_CARD_WIDTH = (width - 44) / 2;

const STRINGS = {
  en: {
    title: 'Insights',
    subtitle: 'Activity Timeline + Yield Charts',
    projectedYield: '22.4 Q/Ac',
    projectedYieldLabel: 'Projected Yield',
    yieldAboveAvg: '+12% above avg',
    revenueEstimate: '₹2.4 Lakhs',
    revenueLabel: 'Revenue Estimate',
    revenueNote: '+₹18k from APMC',
    rainTitle: 'Rain & Soil Correlation',
    rainDesc: 'Weather stations show clear skies for the next 7 days. Evaporation rate is moderate. Delaying watering by 24h will let roots dry out, triggering grain hardening for a heavier harvest.',
    yieldChart: 'Yield Performance Over Years',
    harvestTimeline: 'HARVEST CHECK TIMELINE',
    t1Label: 'Maturation Checkpoint',
    t1Desc: 'Grain moisture levels checked',
    t1Date: 'June 18',
    t2Label: 'Pesticide Application',
    t2Desc: 'Border aphid prevention spraying',
    t2Date: 'June 20',
    t3Label: 'Soil Nitrogen Scan',
    t3Desc: 'Satellite NDVI moisture sweep',
    t3Date: 'June 22 (Today)',
    t4Label: 'Wheat Harvest Window',
    t4Desc: 'Harvest machinery preparation',
    t4Date: 'June 25 - 28',
  },
  hi: {
    title: 'अंतर्दृष्टि',
    subtitle: 'गतिविधि समयरेखा + उपज चार्ट',
    projectedYield: '22.4 Q/Ac',
    projectedYieldLabel: 'अनुमानित उपज',
    yieldAboveAvg: '+12% औसत से ऊपर',
    revenueEstimate: '₹2.4 लाख',
    revenueLabel: 'राजस्व अनुमान',
    revenueNote: '+₹18k APMC से',
    rainTitle: 'वर्षा और मिट्टी संबंध',
    rainDesc: 'मौसम स्टेशन अगले 7 दिनों के लिए स्पष्ट आकाश दिखाते हैं। वाष्पीकरण दर मध्यम है। पानी देने में 24 घंटे की देरी करने से जड़ों को सूखने से, अनाज को कठोर करने और भारी उपज के लिए ट्रिगर मिलेगा।',
    yieldChart: 'वर्षों में उपज प्रदर्शन',
    harvestTimeline: 'कटाई जांच समयरेखा',
    t1Label: 'परिपक्वता चेकपॉइंट',
    t1Desc: 'अनाज नमी स्तर जांचा गया',
    t1Date: 'June 18',
    t2Label: 'कीटनाशक आवेदन',
    t2Desc: 'सीमा शहद-तेल की रोकथाम छिड़काव',
    t2Date: 'June 20',
    t3Label: 'मिट्टी नाइट्रोजन स्कैन',
    t3Desc: 'सैटेलाइट NDVI नमी स्वीप',
    t3Date: 'June 22 (आज)',
    t4Label: 'गेहूं कटाई खिड़की',
    t4Desc: 'कटाई मशीनरी की तैयारी',
    t4Date: 'June 25 - 28',
  },
  gu: {
    title: 'અંતર્દૃષ્ટિ',
    subtitle: 'પ્રવૃત્તિ સમયરેખા + ફसલ ચાર્ટ',
    projectedYield: '22.4 Q/Ac',
    projectedYieldLabel: 'અંદાજિત ફસલ',
    yieldAboveAvg: '+12% સરેરાશથી વધુ',
    revenueEstimate: '₹2.4 લાખ',
    revenueLabel: 'આવક અંદાજ',
    revenueNote: '+₹18k APMC થી',
    rainTitle: 'વર્ષા અને જમીન સંબંધ',
    rainDesc: 'હવામાન સ્ટેશનો આગલા 7 દિવસ માટે સ્પષ્ટ આકાશ દર્શાવે છે. બાષ્પીકરણ દર મધ્યમ છે. પાણી આપવામાં 24 કલાકની વિલંબ કરવાથી મૂળો સુકાશે, અનાજ કઠોર થશે તેના માટે ટ્રિગર આવશે.',
    yieldChart: 'વર્ષો દરમિયાન ફસલ પ્રદર્શન',
    harvestTimeline: 'લણણી જાંચ સમયરેખા',
    t1Label: 'પરિપક્વતા ચેકપોઇંટ',
    t1Desc: 'અનાજ ભેજ સ્તર તપાસવામાં આવ્યો',
    t1Date: 'June 18',
    t2Label: 'જીવનાશક વપરાશ',
    t2Desc: 'સીમા એફિડ નિવારણ છંટકાવ',
    t2Date: 'June 20',
    t3Label: 'જમીન નાઇટ્રોજન સ્કેન',
    t3Desc: 'સેટેલાઇટ NDVI ભેજ સ્વીપ',
    t3Date: 'June 22 (આજ)',
    t4Label: 'ઘઉં લણણી વિંડો',
    t4Desc: 'લણણી મશીનરી તૈયારી',
    t4Date: 'June 25 - 28',
  },
  mr: {
    title: 'अंतर्दृष्टी',
    subtitle: 'क्रियाकलाप टाइमलाइन + उपज चार्ट',
    projectedYield: '22.4 Q/Ac',
    projectedYieldLabel: 'अनुमानित उपज',
    yieldAboveAvg: '+12% सरासरीच्या वरती',
    revenueEstimate: '₹2.4 लाख',
    revenueLabel: 'उत्पन्न अंदाज',
    revenueNote: '+₹18k APMC कडून',
    rainTitle: 'पाऊस व जमीन परस्पर संबंध',
    rainDesc: 'हवामान स्टेशन येत्या 7 दिवसांत स्पष्ट आकाश दर्शवत आहे. वाष्पीकरणाचा दर मध्यम आहे. पाणी देणे 24 तास विलंब केल्यास मुळे कोरडे होतील, धान्य कठोर होते त्यासाठी ट्रिगर मिळेल.',
    yieldChart: 'वर्षांमध्ये उपज कार्यप्रदर्शन',
    harvestTimeline: 'कापणी तपास टाइमलाइन',
    t1Label: 'परिपक्वता चेकपॉइंट',
    t1Desc: 'धान्य आर्द्रता स्तर तपासला',
    t1Date: 'June 18',
    t2Label: 'कीटकनाशक अनुप्रयोग',
    t2Desc: 'सीमा एफिड प्रतिबंधन फवारा',
    t2Date: 'June 20',
    t3Label: 'जमीन नायट्रोजन स्कॅन',
    t3Desc: 'स्यूटेलाइट NDVI आर्द्रता स्वीप',
    t3Date: 'June 22 (आज)',
    t4Label: 'गव्हाची कापणी विंडो',
    t4Desc: 'कापणी यंत्रसामग्री तयारी',
    t4Date: 'June 25 - 28',
  },
};

export default function InsightsScreen() {
  const colors = useThemeColors();
  const t = useType();
  const scheme = useColorScheme();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);

  const timelineSteps = [
    { label: s.t1Label, desc: s.t1Desc, date: s.t1Date, done: true },
    { label: s.t2Label, desc: s.t2Desc, date: s.t2Date, done: true },
    { label: s.t3Label, desc: s.t3Desc, date: s.t3Date, done: true, active: true },
    { label: s.t4Label, desc: s.t4Desc, date: s.t4Date, done: false },
  ];

  const historicalYields = [
    { year: '2023', val: 18.2, label: '18.2 Q/Ac' },
    { year: '2024', val: 19.8, label: '19.8 Q/Ac' },
    { year: '2025', val: 21.0, label: '21.0 Q/Ac' },
    { year: '2026', val: 22.4, label: '22.4 Q/Ac (Est)' },
  ];

  return (
    <Screen
      title={s.title}
      emoji="📊"
      subtitle={s.subtitle}
      back
      right={<HeaderIconButton icon="trending-up" label="View details" />}
    >
      {/* Yield Prediction & Profit estimate side-by-side */}
      <FadeInUp index={0} distance={16}>
        <View style={styles.rowGrid}>
          <PressableScale haptic="light" style={{ flex: 1 }}>
            <GlassCard padding={14} style={styles.gridCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(74, 222, 128, 0.08)' }]}>
                <Feather name="box" size={18} color={colors.accent} />
              </View>
              <Text style={[t.title, { color: colors.text }]}>{s.projectedYield}</Text>
              <Text style={[t.caption, { color: colors.textSecondary }]}>{s.projectedYieldLabel}</Text>
              <Text style={[t.overline, { color: colors.accent }]}>{s.yieldAboveAvg}</Text>
            </GlassCard>
          </PressableScale>

          <PressableScale haptic="light" style={{ flex: 1 }}>
            <GlassCard padding={14} style={styles.gridCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]}>
                <Feather name="dollar-sign" size={18} color={colors.info} />
              </View>
              <Text style={[t.title, { color: colors.text }]}>{s.revenueEstimate}</Text>
              <Text style={[t.caption, { color: colors.textSecondary }]}>{s.revenueLabel}</Text>
              <Text style={[t.overline, { color: colors.info }]}>{s.revenueNote}</Text>
            </GlassCard>
          </PressableScale>
        </View>
      </FadeInUp>

      {/* Rain Impact Card */}
      <FadeInUp index={1} distance={16}>
        <LinearGradient
          colors={scheme === 'dark' ? ['#0e2a14', '#050e07'] : ['#f0fdf4', '#f8faf7']}
          style={[styles.rainCard, { borderColor: colors.border, ...DesignTokens.shadow.level1 }]}
        >
          <View style={styles.cardHeader}>
            <Feather name="cloud-rain" size={18} color={colors.accent} />
            <Text numberOfLines={1} style={[t.title, { color: colors.text, fontWeight: '800', flex: 1 }]}>{s.rainTitle}</Text>
          </View>
          <Text style={[t.body, { color: colors.textSecondary, lineHeight: 19 }]}>
            {s.rainDesc}
          </Text>
        </LinearGradient>
      </FadeInUp>

      {/* Historical Yield Graph (pure React Native) */}
      <FadeInUp index={2} distance={16}>
        <GlassCard padding={20}>
          <Text style={[t.title, { color: colors.text, fontWeight: '800', marginBottom: 12 }]}>{s.yieldChart}</Text>
          <View style={styles.chartContainer}>
            {historicalYields.map((y, idx) => {
              const maxVal = 25.0;
              const fillPercentage = (y.val / maxVal) * 100;
              const isLast = idx === historicalYields.length - 1;
              return (
                <View key={y.year} style={styles.chartBarRow}>
                  <Text style={[t.caption, { color: colors.textSecondary, width: 40 }]}>{y.year}</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.barTrack, { backgroundColor: colors.surfaceElevated }]}>
                      <LinearGradient
                        colors={isLast ? colors.gradient.accent : colors.gradient.primary}
                        style={[styles.barFill, { width: `${fillPercentage}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                  </View>
                  <Text numberOfLines={1} style={[t.overline, { color: isLast ? colors.accent : colors.text, minWidth: 68, flexShrink: 1, textAlign: 'right' }]}>{y.label}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Timeline checklist */}
      <FadeInUp index={3} distance={16}>
        <View>
          <Text style={[t.overline, { color: colors.textMuted, marginBottom: 12, marginLeft: 4 }]}>{s.harvestTimeline}</Text>

          <View style={styles.timelineWrapper}>
            {timelineSteps.map((step, idx) => (
              <View key={step.label} style={styles.timelineRow}>
                {/* Node column */}
                <View style={styles.nodeColumn}>
                  <View
                    style={[
                      styles.nodeCircle,
                      {
                        backgroundColor: step.done ? colors.accent : colors.surfaceElevated,
                        borderColor: step.active ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    {step.done && <Feather name="check" size={10} color="#ffffff" />}
                  </View>
                  {idx < timelineSteps.length - 1 && (
                    <View style={[styles.nodeLine, { backgroundColor: step.done ? colors.accent : colors.border }]} />
                  )}
                </View>

                {/* Details column */}
                <View style={styles.detailsColumn}>
                  <View style={styles.timelineHeaderRow}>
                    <Text style={[t.bodyStrong, { color: colors.text, fontWeight: step.active ? '900' : '700', flexShrink: 1 }]}>
                      {step.label}
                    </Text>
                    <Text numberOfLines={1} style={[t.caption, { color: colors.textMuted }]}>{step.date}</Text>
                  </View>
                  <Text style={[t.body, { color: colors.textSecondary }]}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowGrid: { flexDirection: 'row', gap: 12 },
  gridCard: {
    flex: 1,
    gap: 4,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainCard: {
    borderRadius: DesignTokens.radius.extraLarge,
    borderWidth: 1.5,
    padding: 20,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  chartContainer: { gap: 10 },
  chartBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barWrapper: { flex: 1, height: 12, justifyContent: 'center' },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  timelineWrapper: { paddingLeft: 4, gap: 8 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  nodeColumn: { alignItems: 'center', width: 20 },
  nodeCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeLine: { width: 2, flex: 1, zIndex: 1, marginVertical: -2 },
  detailsColumn: { flex: 1, paddingBottom: 0, gap: 2 },
  timelineHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
});
