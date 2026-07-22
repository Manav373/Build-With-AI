import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    screenTitle: 'Weather Intel',
    screenSubtitle: 'Karnal Region • Haryana',
    viewAlerts: 'View alerts',
    activeWarnings: '2 active warnings: Severe Storm tomorrow. Read advisory →',
    partlyCloudy: 'Partly Cloudy • Feels like 37°',
    rainChance: 'Rain Chance',
    humidity: 'Humidity',
    wind: 'Wind',
    uvIndex: 'UV Index',
    aiMeteorologicalDigest: 'AI Meteorological Digest',
    aiSummary: 'Weather will remain stable today. Heavy localized storms are forecast to strike Wednesday afternoon. Avoid spraying pesticide sprays in the next 36 hours as runoff risk is exceptionally high.',
    hourlyTimeline: 'HOURLY TIMELINE',
    sevenDayForecast: '7-DAY FORECAST',
    satelliteRadarPreview: 'Satellite Radar Preview',
    lightClouds: 'Light Clouds',
    stormDensity: 'Storm Density',
    dayWednesday: 'Wednesday',
    dayThursday: 'Thursday',
    dayFriday: 'Friday',
    daySaturday: 'Saturday',
    daySunday: 'Sunday',
    conditionHeavyStorms: 'Heavy Storms',
    conditionPartlyCloudy: 'Partly Cloudy',
    conditionClearSunny: 'Clear & Sunny',
    conditionExtremelyDry: 'Extremely Dry',
    conditionLightShowers: 'Light Showers',
  },
  hi: {
    screenTitle: 'मौसम खुफिया',
    screenSubtitle: 'करनाल क्षेत्र • हरियाणा',
    viewAlerts: 'सतर्कताएं देखें',
    activeWarnings: '2 सक्रिय चेतावनी: कल गंभीर तूफान। सलाह पढ़ें →',
    partlyCloudy: 'आंशिक बादल • महसूस होता है 37°',
    rainChance: 'बारिश की संभावना',
    humidity: 'नमी',
    wind: 'हवा',
    uvIndex: 'यूवी इंडेक्स',
    aiMeteorologicalDigest: 'AI मौसम विज्ञान डाइजेस्ट',
    aiSummary: 'मौसम आज स्थिर रहेगा। बुधवार दोपहर में भारी स्थानीय तूफान की संभावना है। अगले 36 घंटों में कीटनाशक स्प्रे न करें क्योंकि अपवाह का जोखिम अत्यधिक है।',
    hourlyTimeline: 'प्रति घंटा समयरेखा',
    sevenDayForecast: '7 दिन का पूर्वानुमान',
    satelliteRadarPreview: 'उपग्रह रडार पूर्वावलोकन',
    lightClouds: 'हल्के बादल',
    stormDensity: 'तूफान घनत्व',
    dayWednesday: 'बुधवार',
    dayThursday: 'गुरुवार',
    dayFriday: 'शुक्रवार',
    daySaturday: 'शनिवार',
    daySunday: 'रविवार',
    conditionHeavyStorms: 'भारी तूफान',
    conditionPartlyCloudy: 'आंशिक बादल',
    conditionClearSunny: 'स्पष्ट और धूप',
    conditionExtremelyDry: 'अत्यंत सूखा',
    conditionLightShowers: 'हल्की बारिश',
  },
  gu: {
    screenTitle: 'હવામાન બુદ્ધિ',
    screenSubtitle: 'કરનાલ પ્રદેશ • હરિયાણા',
    viewAlerts: 'ચેતવણીઓ જુઓ',
    activeWarnings: '2 સક્રિય ચેતવણીઓ: કાલે તીવ્ર તોફાન. સલાહ વાંચો →',
    partlyCloudy: 'આંશિક ગાજવું • લાગે છે 37°',
    rainChance: 'વરસાદની સંભાવના',
    humidity: 'ભેજ',
    wind: 'હવા',
    uvIndex: 'યુવી ઇન્ડેક્સ',
    aiMeteorologicalDigest: 'AI હવામાન વિજ્ঞાન પાચન',
    aiSummary: 'હવામાન આજ સ્થિર રહશે. બુધવારે બપોરે ભારે સ્થાનિક તોફાનની આગાહી છે. આગળના 36 કલાકમાં જંતુનાશક છંટાય છતાં ન કરો કારણ કે વહાણીની જોખમ અત્યંત ઊંચી છે.',
    hourlyTimeline: 'કલાક દર કલાક સમયરેખા',
    sevenDayForecast: '7 દિવસનો આગાહી',
    satelliteRadarPreview: 'ઉપગ્રહ રડાર પૂર્વાવલોકન',
    lightClouds: 'હળવા વાદળો',
    stormDensity: 'તોફાન ધનતા',
    dayWednesday: 'બુધવાર',
    dayThursday: 'ગુરુવાર',
    dayFriday: 'શુક્રવાર',
    daySaturday: 'શનિવાર',
    daySunday: 'રવિવાર',
    conditionHeavyStorms: 'ભારે તોફાન',
    conditionPartlyCloudy: 'આંશિક ગાજવું',
    conditionClearSunny: 'સ્વચ્છ અને સૂર્યપ્રકાશ',
    conditionExtremelyDry: 'અત્યંત શુષ્ક',
    conditionLightShowers: 'હળવી વરસાદ',
  },
  mr: {
    screenTitle: 'हवामान बुद्धिमत्ता',
    screenSubtitle: 'करनाल क्षेत्र • हरियाणा',
    viewAlerts: 'सतर्कता पहा',
    activeWarnings: '2 सक्रिय सतर्कता: उद्यास काळजी वादळ. सल्ला वाचा →',
    partlyCloudy: 'अंशतः ढगाळ • वाटते 37°',
    rainChance: 'पाऊस येण्याची शक्यता',
    humidity: 'आर्द्रता',
    wind: 'वारा',
    uvIndex: 'यूव्ही निर्देशांक',
    aiMeteorologicalDigest: 'AI हवामान विज्ञान सारांश',
    aiSummary: 'हवामान आज स्थिर राहील. बुधवारी दुपारी भारी स्थानिक वादळ अपेक्षित आहे. अगळ्या 36 तासांत कीटकनाशक फवारणी करू नका कारण धो्या चालण्याचा धोका अतिशय जास्त आहे.',
    hourlyTimeline: 'प्रति तास कालक्रम',
    sevenDayForecast: '7 दिवसाचा अंदाज',
    satelliteRadarPreview: 'उपग्रह रडार पूर्वावलोकन',
    lightClouds: 'हलके ढग',
    stormDensity: 'वादळ घनता',
    dayWednesday: 'बुधवार',
    dayThursday: 'गुरुवार',
    dayFriday: 'शुक्रवार',
    daySaturday: 'शनिवार',
    daySunday: 'रविवार',
    conditionHeavyStorms: 'भारी वादळ',
    conditionPartlyCloudy: 'अंशतः ढगाळ',
    conditionClearSunny: 'स्वच्छ आणि धूप',
    conditionExtremelyDry: 'अत्यंत कोरड',
    conditionLightShowers: 'हलकी पाऊस',
  },
};

export default function WeatherScreen() {
  const colors = useThemeColors();
  const t = useType();
  const scheme = useColorScheme();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);

  const handleAlertPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/weather-alerts' as any);
  };

  const hourlyForecast = [
    { time: 'Now', temp: '34°', icon: 'weather-cloudy', rain: '10%' },
    { time: '2 PM', temp: '35°', icon: 'weather-sunny', rain: '5%' },
    { time: '4 PM', temp: '33°', icon: 'weather-partly-cloudy', rain: '15%' },
    { time: '6 PM', temp: '31°', icon: 'weather-sunset', rain: '20%' },
    { time: '8 PM', temp: '28°', icon: 'weather-night', rain: '10%' },
    { time: '10 PM', temp: '26°', icon: 'weather-night-partly-cloudy', rain: '5%' },
  ];

  const weeklyForecast = [
    { day: s.dayWednesday, tempMax: '30°', tempMin: '22°', icon: 'weather-lightning-rainy', label: s.conditionHeavyStorms },
    { day: s.dayThursday, tempMax: '32°', tempMin: '23°', icon: 'weather-cloudy', label: s.conditionPartlyCloudy },
    { day: s.dayFriday, tempMax: '35°', tempMin: '24°', icon: 'weather-sunny', label: s.conditionClearSunny },
    { day: s.daySaturday, tempMax: '36°', tempMin: '25°', icon: 'weather-sunny', label: s.conditionExtremelyDry },
    { day: s.daySunday, tempMax: '34°', tempMin: '23°', icon: 'weather-partly-cloudy', label: s.conditionLightShowers },
  ];

  return (
    <Screen
      back
      title={s.screenTitle}
      emoji="⛅"
      subtitle={s.screenSubtitle}
      right={<HeaderIconButton icon="alert-triangle" onPress={handleAlertPress} label={s.viewAlerts} />}
    >
      {/* Warning Alert Bar */}
      <FadeInUp index={0} distance={16}>
        <PressableScale onPress={handleAlertPress} haptic="medium">
          <GlassCard padding={12}>
            <View style={styles.warningContent}>
              <Feather name="alert-circle" size={16} color={colors.danger} />
              <Text style={[t.body, { color: colors.text, flex: 1 }]}>
                {s.activeWarnings}
              </Text>
            </View>
          </GlassCard>
        </PressableScale>
      </FadeInUp>

      {/* Current Hero Status */}
      <FadeInUp index={1} distance={16}>
        <LinearGradient
          colors={scheme === 'dark' ? ['#0e2a14', '#050e07'] : ['#f0fdf4', '#ffffff']}
          style={[styles.heroCard, { borderColor: colors.border, ...DesignTokens.shadow.level2 }]}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <Text style={[t.displayMedium, { color: colors.text }]}>34°C</Text>
              <Text style={[t.bodySmall, { color: colors.textSecondary, flexShrink: 1 }]}>{s.partlyCloudy}</Text>
            </View>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={54} color={colors.warning} />
          </View>

          <View style={[styles.gridRow, { borderTopColor: colors.border }]}>
            <View style={styles.gridBox}>
              <Feather name="cloud-rain" size={14} color={colors.info} />
              <Text style={[t.number, { color: colors.text }]}>15%</Text>
              <Text style={[t.caption, { color: colors.textSecondary }]}>{s.rainChance}</Text>
            </View>
            <View style={styles.gridBox}>
              <Feather name="droplet" size={14} color={colors.accent} />
              <Text style={[t.number, { color: colors.text }]}>58%</Text>
              <Text style={[t.caption, { color: colors.textSecondary }]}>{s.humidity}</Text>
            </View>
            <View style={styles.gridBox}>
              <Feather name="wind" size={14} color={colors.textMuted} />
              <Text style={[t.number, { color: colors.text }]}>12 km/h</Text>
              <Text style={[t.caption, { color: colors.textSecondary }]}>{s.wind}</Text>
            </View>
            <View style={styles.gridBox}>
              <Feather name="sun" size={14} color="#f59e0b" />
              <Text style={[t.number, { color: colors.text }]}>8 (High)</Text>
              <Text style={[t.caption, { color: colors.textSecondary }]}>{s.uvIndex}</Text>
            </View>
          </View>
        </LinearGradient>
      </FadeInUp>

      {/* AI Weather Summary */}
      <FadeInUp index={2} distance={16}>
        <GlassCard padding={20}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="brain" size={18} color={colors.accent} />
            <Text style={[t.title, { color: colors.text, fontWeight: '800', flex: 1 }]} numberOfLines={1}>{s.aiMeteorologicalDigest}</Text>
          </View>
          <Text style={[t.body, { color: colors.textSecondary, lineHeight: 19 }]}>
            {s.aiSummary}
          </Text>
        </GlassCard>
      </FadeInUp>

      {/* Hourly Forecast */}
      <FadeInUp index={3} distance={16}>
        <View>
          <Text style={[t.overline, { color: colors.textMuted, marginBottom: 12, marginLeft: 4 }]}>{s.hourlyTimeline}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {hourlyForecast.map((h, idx) => (
              <GlassCard key={h.time} style={styles.hourCard} padding={12}>
                <Text style={[t.caption, { color: colors.textSecondary, textAlign: 'center' }]}>{h.time}</Text>
                <MaterialCommunityIcons name={h.icon as any} size={22} color={colors.accent} />
                <Text style={[t.label, { color: colors.text, textAlign: 'center' }]}>{h.temp}</Text>
                <Text style={[t.caption, { color: colors.textMuted, textAlign: 'center' }]}>💧 {h.rain}</Text>
              </GlassCard>
            ))}
          </ScrollView>
        </View>
      </FadeInUp>

      {/* 7-Day Forecast */}
      <FadeInUp index={4} distance={16}>
        <View>
          <Text style={[t.overline, { color: colors.textMuted, marginBottom: 12, marginLeft: 4 }]}>{s.sevenDayForecast}</Text>
          <View style={styles.forecastList}>
            {weeklyForecast.map((day, idx) => (
              <PressableScale key={day.day} haptic="light">
                <View
                  style={[
                    styles.forecastRow,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      ...DesignTokens.shadow.level1,
                    },
                  ]}
                >
                  <Text style={[t.bodyStrong, { color: colors.text, minWidth: 84, flexShrink: 1 }]} numberOfLines={1}>{day.day}</Text>
                  <View style={styles.forecastCenter}>
                    <MaterialCommunityIcons name={day.icon as any} size={18} color={colors.accent} style={{ marginRight: 6 }} />
                    <Text style={[t.caption, { color: colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>{day.label}</Text>
                  </View>
                  <Text style={[t.body, { color: colors.text }]}>
                    {day.tempMax} / <Text style={{ color: colors.textMuted }}>{day.tempMin}</Text>
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>
        </View>
      </FadeInUp>

      {/* Satellite Radar Preview */}
      <FadeInUp index={5} distance={16}>
        <GlassCard padding={20}>
          <Text style={[t.title, { color: colors.text, fontWeight: '800', marginBottom: 16 }]}>{s.satelliteRadarPreview}</Text>
          <View style={[styles.radarWrapper, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            {/* Styled mock rings to represent rain storm clouds */}
            <View style={styles.cloudBlob1} />
            <View style={styles.cloudBlob2} />
            <View style={styles.radarLegend}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(74, 222, 128, 0.5)' }]} />
                <Text style={styles.legendText}>{s.lightClouds}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(239, 68, 68, 0.5)' }]} />
                <Text style={styles.legendText}>{s.stormDensity}</Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroCard: {
    borderRadius: DesignTokens.radius.extraLarge,
    borderWidth: 1.5,
    padding: 20,
    gap: 16,
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  heroLeft: { flex: 1 },
  gridRow: { flexDirection: 'row', paddingTop: 16, borderTopWidth: 1 },
  gridBox: { flex: 1, alignItems: 'center', gap: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  horizontalScroll: { gap: 8, paddingHorizontal: 0 },
  hourCard: {
    width: 76,
    alignItems: 'center',
    gap: 6,
  },
  forecastList: { gap: 8 },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 16,
    borderRadius: DesignTokens.radius.large,
    borderWidth: 1,
  },
  forecastCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  radarWrapper: {
    height: 150,
    borderRadius: DesignTokens.radius.large,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  cloudBlob1: {
    position: 'absolute',
    top: 30,
    left: 40,
    width: 100,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 222, 128, 0.25)',
  },
  cloudBlob2: {
    position: 'absolute',
    top: 50,
    left: 90,
    width: 80,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  radarLegend: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 8,
    gap: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: '#ffffff', fontSize: 8, fontWeight: '700' },
});
