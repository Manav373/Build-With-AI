import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  lat: number;
  lon: number;
  city?: string;
  state?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const result: LocationData = {
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
        };
        // Reverse geocode
        try {
          const [geo] = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (geo) {
            result.city = geo.city || geo.subregion || undefined;
            result.state = geo.region || undefined;
          }
        } catch { /* geocode optional */ }
        setLocation(result);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Location error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, loading, error };
}
