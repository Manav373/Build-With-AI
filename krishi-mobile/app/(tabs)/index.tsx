import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen, GlassCard } from '@/components/ui/Screen';
import { WeatherWidget } from '@/components/home/WeatherWidget';
import { StatsRow } from '@/components/home/StatsRow';
import { QuickActions } from '@/components/home/QuickActions';
import { IotHomeCard } from '@/components/home/IotHomeCard';
import { AlertsFeed } from '@/components/home/AlertsFeed';
import { useScreenStrings } from '@/hooks/useLanguage';
import { useColorScheme, useType } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useLocation } from '@/hooks/useLocation';
import { getUserProfile, getUserCoords, saveUserCoords, UserProfile, UserCoords } from '@/services/session';
import { getLiveMandis } from '@/services/api';

const STRINGS = {
  en: {
    title: 'KrishiAI',
    subtitle: 'Your Smart Farming Companion',
    nearbyMandis: 'Nearby APMC Mandis',
    viewAll: 'View All',
    away: 'away',
    noMandisFound: 'Finding nearest mandis...',
  },
  hi: {
    title: 'कृषिAI',
    subtitle: 'आपका स्मार्ट खेती सहायक',
    nearbyMandis: 'पास की APMC मंडियां',
    viewAll: 'सभी देखें',
    away: 'दूर',
    noMandisFound: 'निकटतम मंडियां खोजी जा रही हैं...',
  },
  gu: {
    title: 'કૃષિAI',
    subtitle: 'તમારો સ્માર્ટ ખેતી સહાયક',
    nearbyMandis: 'નજીક APMC માર્કેટ',
    viewAll: 'બધું જુઓ',
    away: 'દૂર',
    noMandisFound: 'નજીકની માર્કેટ શોધી રહ્યાં છીએ...',
  },
  mr: {
    title: 'कृषीAI',
    subtitle: 'तुमचा स्मार्ट शेती सहायक',
    nearbyMandis: 'जवळची APMC मंडी',
    viewAll: 'सर्व पहा',
    away: 'दूर',
    noMandisFound: 'जवळच्या मंड्या शोधत आहोत...',
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const t = useType();
  const s = useScreenStrings(STRINGS as any);

  const { location, loading: locationLoading } = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [nearbyMandis, setNearbyMandis] = useState<any[]>([]);

  // Load user profile and user coordinates
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const p = await getUserProfile();
      if (isMounted && p) setProfile(p);

      const c = await getUserCoords();
      if (isMounted && c) setCoords(c);
    })();
    return () => { isMounted = false; };
  }, []);

  // When GPS location resolves, update coords and save to session
  useEffect(() => {
    if (location && !locationLoading) {
      const newCoords: UserCoords = {
        lat: location.lat,
        lon: location.lon,
        city: location.city,
        state: location.state,
      };
      setCoords(newCoords);
      saveUserCoords(newCoords).catch(() => {});
    }
  }, [location, locationLoading]);

  // Determine effective display city/region
  const effectiveCity =
    location?.city && location?.state
      ? `${location.city}, ${location.state}`
      : profile?.district && profile?.state
      ? `${profile.district}, ${profile.state}`
      : 'Karnal, Haryana';

  const effectiveLat = location?.lat || coords?.lat || 29.6857;
  const effectiveLon = location?.lon || coords?.lon || 76.9905;

  // Fetch nearest mandis based on user location
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await getLiveMandis(effectiveLat, effectiveLon);
        const list = res?.mandis || res?.data || [];
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setNearbyMandis(list.slice(0, 3));
        }
      } catch (e) {
        console.warn('Failed to load nearby mandis on home:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [effectiveLat, effectiveLon]);

  return (
    <Screen
      title={profile?.fullName ? `${s.title} • ${profile.fullName}` : s.title}
      subtitle={profile?.cropType ? `${profile.cropType} Farmer • ${effectiveCity}` : s.subtitle}
      emoji="🌾"
    >
      <View style={styles.container}>
        <WeatherWidget
          city={effectiveCity}
          lat={effectiveLat}
          lon={effectiveLon}
        />

        <StatsRow
          userProfile={profile}
          userCoords={coords || (location ? { lat: location.lat, lon: location.lon } : null)}
        />

        {/* Dedicated IoT Smart Farm & Water Section */}
        <IotHomeCard />

        {/* Nearby Live Mandis Section */}
        {nearbyMandis.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Feather name="shopping-bag" size={16} color={colors.accent} />
                <Text style={[t.titleSmall, { color: colors.text, fontWeight: '700' }]}>
                  {s.nearbyMandis}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/market')}
                style={styles.viewAllBtn}
                hitSlop={8}
              >
                <Text style={[styles.viewAllText, { color: colors.accent }]}>
                  {s.viewAll}
                </Text>
                <Feather name="chevron-right" size={14} color={colors.accent} />
              </Pressable>
            </View>

            <View style={styles.mandiCards}>
              {nearbyMandis.map((mandi, idx) => {
                let priceDisplay = '₹2,420/Q';
                if (mandi.price_note) {
                  const match = mandi.price_note.match(/₹[0-9]+/);
                  if (match) priceDisplay = `${match[0]}/Q`;
                } else if (mandi.price) {
                  priceDisplay = `₹${Math.round(mandi.price)}/Q`;
                }

                return (
                  <GlassCard
                    key={mandi.id || `mandi-${idx}`}
                    liquid
                    padding={14}
                    style={styles.mandiCard}
                  >
                    <Pressable
                      onPress={() => router.push('/(tabs)/market')}
                      style={styles.mandiCardInner}
                    >
                      <View style={[styles.mandiIcon, { backgroundColor: `${colors.accent}15` }]}>
                        <Feather name="map-pin" size={16} color={colors.accent} />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
                          {mandi.name || mandi.mandi_name || mandi.city}
                        </Text>
                        <Text style={[t.caption, { color: colors.textMuted }]}>
                          {mandi.distance_km ? `${mandi.distance_km} km ${s.away}` : mandi.city || mandi.state}
                        </Text>
                      </View>
                      <View style={styles.mandiRight}>
                        <Text style={[t.bodyStrong, { color: colors.accent, fontWeight: '800' }]}>
                          {priceDisplay}
                        </Text>
                        <Text style={[t.caption, { color: colors.textMuted, fontSize: 10 }]}>
                          {mandi.crops ? mandi.crops.split(',')[0] : 'APMC Rate'}
                        </Text>
                      </View>
                    </Pressable>
                  </GlassCard>
                );
              })}
            </View>
          </View>
        )}

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
  section: {
    gap: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mandiCards: {
    gap: 8,
  },
  mandiCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mandiCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mandiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandiRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
