import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { PressableScale } from '@/components/ui/Motion';
import { useScreenStrings } from '@/hooks/useLanguage';

let MapView: any, Marker: any, Circle: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
}

const STRINGS = {
  en: {
    title: 'Farm Map',
    subtitle: 'Your Fields & Locations',
    currentLocation: 'Current Location',
    farmArea: 'Farm Area',
    noLocation: 'Location not available',
    grantPermission: 'Grant Permission',
    locationPermissionError: 'Permission Error',
    permissionDenied: 'Location permission denied. Please enable it in settings.',
  },
  hi: {
    title: 'खेत का मानचित्र',
    subtitle: 'आपके खेत और स्थान',
    currentLocation: 'वर्तमान स्थान',
    farmArea: 'खेत का क्षेत्र',
    noLocation: 'स्थान उपलब्ध नहीं',
    grantPermission: 'अनुमति दें',
    locationPermissionError: 'अनुमति त्रुटि',
    permissionDenied: 'स्थान की अनुमति दी गई नहीं है। कृपया सेटिंग्स में सक्षम करें।',
  },
  gu: {
    title: 'ખેતર નકશો',
    subtitle: 'તમારા ખેતર અને સ્થાનો',
    currentLocation: 'વર્તમાન સ્થાન',
    farmArea: 'ખેતર ક્ષેત્ર',
    noLocation: 'સ્થાન ઉપલબ્ધ નથી',
    grantPermission: 'અનુમતિ આપો',
    locationPermissionError: 'અનુમતિ ભૂલ',
    permissionDenied: 'સ્થાન અનુમતિ નકારી દેવામાં આવી. કૃપયા સેટિંગ્સમાં સક્ષમ કરો.',
  },
  mr: {
    title: 'शेत नकाशा',
    subtitle: 'तुमचे शेत आणि स्थान',
    currentLocation: 'वर्तमान स्थान',
    farmArea: 'शेत क्षेत्र',
    noLocation: 'स्थान उपलब्ध नाही',
    grantPermission: 'अनुमति द्या',
    locationPermissionError: 'अनुमति त्रुटी',
    permissionDenied: 'स्थान अनुमति नकारली. कृपया सेटिंग्जमध्ये सक्षम करा.',
  },
};

interface FarmLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'wheat' | 'rice' | 'cotton' | 'current';
  area?: number;
  health?: 'healthy' | 'warning' | 'critical';
}

const SAMPLE_FARMS: FarmLocation[] = [
  { id: '1', name: 'Wheat Field North', lat: 29.2183, lon: 77.1241, type: 'wheat', area: 5.2, health: 'healthy' },
  { id: '2', name: 'Rice Paddy South', lat: 29.2083, lon: 77.1341, type: 'rice', area: 3.8, health: 'warning' },
  { id: '3', name: 'Cotton Plot East', lat: 29.2283, lon: 77.1441, type: 'cotton', area: 4.1, health: 'healthy' },
];

const getMarkerColor = (type: string) => {
  switch (type) {
    case 'wheat':
      return '#4ade80';
    case 'rice':
      return '#3b82f6';
    case 'cotton':
      return '#f59e0b';
    case 'current':
      return '#ec4899';
    default:
      return '#666666';
  }
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  const requestLocationPermission = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(s.locationPermissionError, s.permissionDenied);
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, [s]);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const [mapReady, setMapReady] = useState(false);
  const mapRef = React.useRef<MapView>(null);

  const defaultRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 29.2183,
        longitude: 77.1241,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <PressableScale onPress={() => router.back()} haptic="light" style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.text} />
          </PressableScale>
          <View>
            <Text style={[t.titleSmall, { color: colors.text, fontWeight: '700' }]}>{s.title}</Text>
            <Text style={[t.caption, { color: colors.textMuted }]}>{s.subtitle}</Text>
          </View>
        </View>
      </View>

      {/* Map */}
      {Platform.OS === 'web' ? (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }]}>
          <Feather name="map-pin" size={48} color={colors.primary} />
          <Text style={[t.body, { color: colors.text, marginTop: 12, fontWeight: '600' }]}>
            {s.title}
          </Text>
          <Text style={[t.caption, { color: colors.textMuted, marginTop: 4 }]}>
            {location ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : s.noLocation}
          </Text>
        </View>
      ) : !loading && location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={defaultRegion}
          onMapReady={() => setMapReady(true)}
          showsUserLocation={true}
          showsMyLocationButton={false}
          pitchEnabled={false}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {/* Current Location Marker */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={s.currentLocation}
            pinColor={getMarkerColor('current')}
          />
          <Circle
            center={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            radius={500}
            fillColor="rgba(236, 72, 153, 0.1)"
            strokeColor="rgba(236, 72, 153, 0.3)"
            strokeWidth={2}
          />

          {/* Sample Farm Markers */}
          {SAMPLE_FARMS.map((farm) => (
            <Marker
              key={farm.id}
              coordinate={{ latitude: farm.lat, longitude: farm.lon }}
              title={farm.name}
              description={`${farm.type} • ${farm.area}ha ${farm.health ? `• ${farm.health}` : ''}`}
              pinColor={getMarkerColor(farm.type)}
            />
          ))}
        </MapView>
      ) : (
        <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
          <Text style={[t.body, { color: colors.text }]}>{loading ? 'Loading location...' : s.noLocation}</Text>
          {!loading && (
            <PressableScale onPress={requestLocationPermission} haptic="medium" style={[styles.permissionBtn, { backgroundColor: colors.accent }]}>
              <Text style={[t.body, { color: '#ffffff', fontWeight: '600' }]}>{s.grantPermission}</Text>
            </PressableScale>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 12 }]}>
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            if (location && mapReady && mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }, 500);
            }
          }}
          haptic="light"
          style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Feather name="target" size={20} color={colors.accent} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  map: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  permissionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    gap: 12,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
