import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { resolveLocationBackend } from '../services/api';

const LocationContext = createContext();

/**
 * Global Location Provider
 * Handles background location detection once per session.
 */
export const LocationProvider = ({ children }) => {
  const { getToken } = useSafeAuth();
  const [location, setLocation] = useState({
    village: null,
    taluka: null,
    district: null,
    city: null,
    state: null,
    lat: null,
    lon: null,
    loading: true,
    error: null,
    method: null
  });

  const refreshLocation = useCallback(async () => {
    localStorage.removeItem('krishiai_location');
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    // Internal detection logic
    const detect = async () => {
      const finishWithBackend = async (lat = null, lon = null) => {
        try {
          const token = await getToken();
          // Even if lat/lon is null, the backend will try IP-based resolution
          const result = await resolveLocationBackend(lat, lon, token);
          
          if (result && (result.district || result.city)) {
            const loc = { 
              village: result.village || null,
              taluka: result.taluka || null,
              district: result.district, 
              city: result.city || result.village || result.district,
              state: result.state || 'India', 
              lat: result.lat || lat,
              lon: result.lon || lon,
              method: result.method || 'backend',
              loading: false,
              error: null
            };
            setLocation(loc);
            localStorage.setItem('krishiai_location', JSON.stringify({ ...loc, ts: Date.now() }));
          } else {
            // No district found after backend attempt
            setLocation(prev => ({ 
              ...prev, 
              loading: false, 
              error: 'Search for your district manually' 
            }));
          }
        } catch (err) {
          setLocation(prev => ({ ...prev, loading: false, error: 'Could not detect location automatically' }));
        }
      };

      if ('geolocation' in navigator) {
        // We set a slightly longer timeout for browser GPS to avoid "Direct Show Failed"
        navigator.geolocation.getCurrentPosition(
          (pos) => finishWithBackend(pos.coords.latitude, pos.coords.longitude),
          (err) => {
            console.warn('[Location] GPS failed, falling back to IP:', err.message);
            finishWithBackend(null, null);
          },
          { timeout: 8000, enableHighAccuracy: true }
        );
      } else {
        finishWithBackend(null, null);
      }
    };

    await detect();
  }, [getToken]);

  useEffect(() => {
    const initLocation = async () => {
      // 1. Check Cache
      try {
        const cachedStr = localStorage.getItem('krishiai_location');
        const cached = cachedStr ? JSON.parse(cachedStr) : null;
        if (cached && Date.now() - cached.ts < 3600000) {
          setLocation({ ...cached, loading: false, error: null });
          return;
        }
      } catch {}

      // 2. Fresh Detect
      await refreshLocation();
    };

    initLocation();
  }, [refreshLocation]);

  return (
    <LocationContext.Provider value={{ location, loading: location.loading, error: location.error, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
