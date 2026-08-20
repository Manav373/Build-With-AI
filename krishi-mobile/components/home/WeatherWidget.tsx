import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/Screen';
import { Colors } from '@/constants/Colors';
import { useColorScheme, useType } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';

interface WeatherWidgetProps {
  city?: string;
}

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

export function WeatherWidget({ city = 'Your Location' }: WeatherWidgetProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const t = useType();
  const s = useScreenStrings(STRINGS as any);

  // Mock weather data — will be replaced by API data
  const weather = {
    temp: 32,
    condition: s.conditionPartlyCloudy,
    humidity: 68,
    wind: 12,
    feelsLike: 35,
    high: 36,
    low: 24,
    forecast: [
      { day: s.dayTue, icon: '🌤️', high: 35, low: 24 },
      { day: s.dayWed, icon: '🌧️', high: 30, low: 22 },
      { day: s.dayThu, icon: '⛅', high: 33, low: 23 },
      { day: s.dayFri, icon: '☀️', high: 37, low: 25 },
      { day: s.daySat, icon: '🌦️', high: 31, low: 22 },
    ],
  };

  return (
    <GlassCard liquid padding={16} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="map-pin" size={12} color={colors.accent} />
          <Text style={[styles.cityText, { color: colors.textSecondary }]}>{city}</Text>
        </View>
        <Text style={[styles.conditionText, { color: colors.textMuted }]}>{weather.condition}</Text>
      </View>

      {/* Main temp */}
      <View style={styles.mainRow}>
        <View style={styles.tempSection}>
          <Text style={styles.weatherEmoji}>🌤️</Text>
          <Text style={[styles.tempText, { color: colors.text }]}>{weather.temp}°</Text>
        </View>
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Feather name="droplet" size={13} color="#3b82f6" />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{weather.humidity}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="wind" size={13} color="#8b5cf6" />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{weather.wind} km/h</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="thermometer" size={13} color="#f59e0b" />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{s.feelsLike} {weather.feelsLike}°</Text>
          </View>
        </View>
      </View>

      {/* Forecast strip */}
      <View style={[styles.forecastStrip, { borderTopColor: colors.border }]}>
        {weather.forecast.map((day) => (
          <View key={day.day} style={styles.forecastDay}>
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
});
