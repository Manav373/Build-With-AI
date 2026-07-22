import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { WeatherWidget } from '@/components/home/WeatherWidget';
import { StatsRow } from '@/components/home/StatsRow';
import { QuickActions } from '@/components/home/QuickActions';
import { AlertsFeed } from '@/components/home/AlertsFeed';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    title: 'KrishiAI',
    subtitle: 'Your Smart Farming Companion',
    city: 'Karnal, Haryana',
  },
  hi: {
    title: 'कृषिAI',
    subtitle: 'आपका स्मार्ट खेती सहायक',
    city: 'करनाल, हरियाणा',
  },
  gu: {
    title: 'કૃષિAI',
    subtitle: 'તમારો સ્માર્ટ ખેતી સહાયક',
    city: 'કરનાલ, હરિયાણા',
  },
  mr: {
    title: 'कृषीAI',
    subtitle: 'तुमचा स्मार्ट शेती सहायक',
    city: 'करनाल, हरियाणा',
  },
};

export default function HomeScreen() {
  const s = useScreenStrings(STRINGS as any);

  return (
    <Screen
      title={s.title}
      subtitle={s.subtitle}
      emoji="🌾"
    >
      <View style={styles.container}>
        <WeatherWidget city={s.city} />
        <StatsRow />
        <QuickActions />
        <AlertsFeed />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingBottom: 32,
  },
});
