import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/Screen';
import { Colors } from '@/constants/Colors';
import { useColorScheme, useType } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    defaultCity: 'Your Location',
    conditionPartlyCloudy: 'Partly Cloudy',
    feelsLike: 'Feels',
    dayTue: 'Tue',
    dayWed: 'Wed',
    dayThu: 'Thu',
    dayFri: 'Fri',
    daySat: 'Sat',
  },
  hi: {
    defaultCity: 'आपका स्थान',
    conditionPartlyCloudy: 'आंशिक बादल',
    feelsLike: 'लगता है',
    dayTue: 'मंगल',
    dayWed: 'बुध',
    dayThu: 'गुरु',
    dayFri: 'शुक्र',
    daySat: 'शनि',
  },
  gu: {
    defaultCity: 'તમારું સ્થાન',
    conditionPartlyCloudy: 'આંશિક મેઘ',
    feelsLike: 'લાગે છે',
    dayTue: 'મંગ',
    dayWed: 'બુધ',
    dayThu: 'ગુરુ',
    dayFri: 'શુક્ર',
    daySat: 'શનિ',
  },
  mr: {
    defaultCity: 'आपले स्थान',
    conditionPartlyCloudy: 'अंशतः ढगाळ',
    feelsLike: 'वाटते',
    dayTue: 'मंगळ',
    dayWed: 'बुध',
    dayThu: 'गुरु',
    dayFri: 'शुक्र',
    daySat: 'शनि',
  },
};

import { getLiveWeather } from '@/services/api';
import { getUserCoords, getUserProfile } from '@/services/session';

interface WeatherWidgetProps {
  city?: string;
  lat?: number | null;
  lon?: number | null;
}

export function WeatherWidget({ city: initialCity = 'Your Location', lat: initialLat, lon: initialLon }: WeatherWidgetProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const t = useType();
  const s = useScreenStrings(STRINGS as any);

  const [liveWeather, setLiveWeather] = useState<any>(null);
  const [displayCity, setDisplayCity] = useState(initialCity);
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to pick emoji based on condition text
  const getWeatherEmoji = (desc: string = ''): string => {
    const lower = desc.toLowerCase();
    if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) return '🌧️';
    if (lower.includes('thunder') || lower.includes('storm')) return '⛈️';
    if (lower.includes('snow') || lower.includes('hail')) return '❄️';
    if (lower.includes('clear') || lower.includes('sun')) return '☀️';
    if (lower.includes('cloud') || lower.includes('overcast')) return '⛅';
    if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return '🌫️';
    return '🌤️';
  };

  useEffect(() => {
    let isMounted = true;

    async function loadWeather() {
      try {
        setLoading(true);
        let targetLat = initialLat;
        let targetLon = initialLon;
        let targetCity = initialCity !== 'Your Location' ? initialCity : '';

        // Check stored coords / profile if props missing
        if (!targetLat || !targetLon) {
          const savedCoords = await getUserCoords();
          if (savedCoords?.lat && savedCoords?.lon) {
            targetLat = savedCoords.lat;
            targetLon = savedCoords.lon;
          }
        }

        if (!targetCity) {
          const profile = await getUserProfile();
          if (profile?.district && profile?.state) {
            targetCity = `${profile.district}, ${profile.state}`;
          } else if (profile?.state) {
            targetCity = profile.state;
          }
        }

        const params: Record<string, any> = {};
        if (targetLat && targetLon) {
          params.lat = targetLat;
          params.lon = targetLon;
        } else if (targetCity) {
          params.city = targetCity;
        } else {
          params.city = 'Karnal, Haryana'; // default agri hub
        }

        const res = await getLiveWeather(params);
        if (isMounted && res?.success && res.current) {
          setLiveWeather(res);
          if (res.current.city) {
            setDisplayCity(res.current.city);
          } else if (targetCity) {
            setDisplayCity(targetCity);
          }
          if (res.advisory) {
            setAdvisory(res.advisory);
          }
        }
      } catch (err) {
        console.warn('Failed to load real weather:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWeather();
    return () => { isMounted = false; };
  }, [initialLat, initialLon, initialCity]);

  // Derived current metrics with fallback
  const cur = liveWeather?.current;
  const currentTemp = cur?.temp_c !== undefined ? Math.round(cur.temp_c) : 32;
  const currentCondition = cur?.description || s.conditionPartlyCloudy;
  const currentHumidity = cur?.humidity ?? 68;
  const currentWind = cur?.wind_kmh !== undefined ? Math.round(cur.wind_kmh) : 12;
  const currentFeels = cur?.feels_like !== undefined ? Math.round(cur.feels_like) : 35;
  const mainEmoji = getWeatherEmoji(currentCondition);

  // Dynamic forecast list
  const daysOfWeek = [s.dayTue, s.dayWed, s.dayThu, s.dayFri, s.daySat];
  const forecastList = (liveWeather?.forecast && liveWeather.forecast.length > 0)
    ? liveWeather.forecast.slice(0, 5).map((f: any, idx: number) => ({
        day: f.date ? f.date.slice(5) : daysOfWeek[idx % daysOfWeek.length],
        icon: getWeatherEmoji(f.condition || ''),
        high: Math.round(f.temp_max || f.temp_c || currentTemp),
        low: Math.round(f.temp_min || (currentTemp - 8)),
      }))
    : [
        { day: s.dayTue, icon: mainEmoji, high: currentTemp + 2, low: currentTemp - 8 },
        { day: s.dayWed, icon: '🌧️', high: currentTemp - 1, low: currentTemp - 9 },
        { day: s.dayThu, icon: '⛅', high: currentTemp + 1, low: currentTemp - 7 },
        { day: s.dayFri, icon: '☀️', high: currentTemp + 3, low: currentTemp - 6 },
        { day: s.daySat, icon: '🌤️', high: currentTemp, low: currentTemp - 8 },
      ];

  return (
    <GlassCard liquid padding={16} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="map-pin" size={13} color={colors.accent} />
          <Text style={[styles.cityText, { color: colors.textSecondary }]} numberOfLines={1}>
            {displayCity}
          </Text>
        </View>
        <Text style={[styles.conditionText, { color: colors.textMuted }]}>{currentCondition}</Text>
      </View>

      {/* Main temp */}
      <View style={styles.mainRow}>
        <View style={styles.tempSection}>
          <Text style={styles.weatherEmoji}>{mainEmoji}</Text>
          <Text style={[styles.tempText, { color: colors.text }]}>{currentTemp}°</Text>
        </View>
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Feather name="droplet" size={13} color="#3b82f6" />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{currentHumidity}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="wind" size={13} color="#8b5cf6" />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{currentWind} km/h</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="thermometer" size={13} color="#f59e0b" />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{s.feelsLike} {currentFeels}°</Text>
          </View>
        </View>
      </View>

      {/* Real Farming Advisory */}
      {advisory && (
        <View style={[styles.advisoryBox, { backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.advisoryText, { color: colors.textSecondary }]}>
            {advisory}
          </Text>
        </View>
      )}

      {/* Forecast strip */}
      <View style={[styles.forecastStrip, { borderTopColor: colors.border }]}>
        {forecastList.map((day: any, i: number) => (
          <View key={i} style={styles.forecastDay}>
            <Text style={[styles.dayLabel, { color: colors.textMuted }]}>{day.day}</Text>
            <Text style={styles.forecastIcon}>{day.icon}</Text>
            <Text style={[styles.forecastTemp, { color: colors.text }]}>{day.high}°</Text>
            <Text style={[styles.forecastLow, { color: colors.textMuted }]}>{day.low}°</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { fontSize: 12, fontWeight: '600', lineHeight: 14 },
  conditionText: { fontSize: 12, fontWeight: '500', lineHeight: 14 },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tempSection: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weatherEmoji: { fontSize: 44 },
  tempText: { fontSize: 48, fontWeight: '800', letterSpacing: -2, lineHeight: 52 },
  detailsSection: { gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 11, fontWeight: '600', lineHeight: 13 },
  forecastStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.8,
    paddingTop: 12,
    marginTop: 2,
  },
  forecastDay: { alignItems: 'center', gap: 4, flex: 1 },
  dayLabel: { fontSize: 10, fontWeight: '600', lineHeight: 12 },
  forecastIcon: { fontSize: 22 },
  forecastTemp: { fontSize: 12, fontWeight: '700', lineHeight: 14 },
  forecastLow: { fontSize: 9, fontWeight: '500', lineHeight: 11 },
  advisoryBox: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  advisoryText: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
});
