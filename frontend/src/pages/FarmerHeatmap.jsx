import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import { BarChart2, Users, Globe, Activity, RefreshCw, MapPin, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFarmerLocations, getLiveMandis } from '../services/api';
import { useAuth } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { translations } from '../utils/translations';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/Map.css';
import { Store } from 'lucide-react';

const MAP_STYLES = {
  roadmap_light: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  roadmap_dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
};



// ─── Sample fallback — only used when backend is offline ─────────────────────
const SAMPLE_LOCATIONS = [
  { latitude: 23.02, longitude: 72.57, source: 'web', state: 'Gujarat', city: 'Ahmedabad' },
  { latitude: 22.30, longitude: 70.80, source: 'whatsapp', state: 'Gujarat', city: 'Rajkot' },
  { latitude: 19.08, longitude: 72.88, source: 'web', state: 'Maharashtra', city: 'Mumbai' },
  { latitude: 18.52, longitude: 73.86, source: 'whatsapp', state: 'Maharashtra', city: 'Pune' },
  { latitude: 26.91, longitude: 75.78, source: 'web', state: 'Rajasthan', city: 'Jaipur' },
  { latitude: 30.73, longitude: 76.78, source: 'web', state: 'Punjab', city: 'Chandigarh' },
  { latitude: 26.45, longitude: 80.33, source: 'web', state: 'Uttar Pradesh', city: 'Kanpur' },
  { latitude: 23.18, longitude: 77.39, source: 'whatsapp', state: 'Madhya Pradesh', city: 'Bhopal' },
  { latitude: 12.97, longitude: 77.59, source: 'web', state: 'Karnataka', city: 'Bengaluru' },
  { latitude: 17.38, longitude: 78.49, source: 'whatsapp', state: 'Telangana', city: 'Hyderabad' },
  { latitude: 22.57, longitude: 88.36, source: 'web', state: 'West Bengal', city: 'Kolkata' },
  { latitude: 25.59, longitude: 85.13, source: 'web', state: 'Bihar', city: 'Patna' },
];

function getMarkerColor(source) {
  return source === 'whatsapp' ? '#facc15' : '#4ade80';
}


function MapLegend({ tHeatmap }) {
  const { theme } = useTheme();
  return (
    <div className={`absolute bottom-6 right-6 z-10 border rounded-2xl p-4 shadow-2xl transition-all ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-[#050e07]/80 backdrop-blur-2xl border-[#4ade80]/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
      }`}>
      <p className={`font-black text-[0.65rem] mb-3 border-b pb-2 transition-colors ${theme === 'light' ? 'text-emerald-700 border-gray-100' : 'text-[#86efac] border-white/5'
        }`}>
        {tHeatmap.legend}
      </p>
      {[
        { color: '#4ade80', label: tHeatmap.webUsers, desc: 'Web Interface' },
        { color: '#facc15', label: tHeatmap.whatsappUsers, desc: 'Mobile Link' },
      ].map(({ color, label, desc }) => (
        <div key={label} className="flex items-center gap-3 mb-2.5 last:mb-0 group">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-20" style={{ background: color }} />
          </div>
          <div className="flex flex-col">
            <span className={`text-[0.75rem] font-bold leading-tight ${theme === 'light' ? 'text-gray-700' : 'text-white/80'}`}>{label}</span>
            <span className={`text-[0.55rem] font-bold ${theme === 'light' ? 'text-gray-400' : 'text-white/20'}`}>{desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FarmerHeatmap() {
  const { theme } = useTheme();
  const isLoaded = true;
  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(null);
  const { location } = useLocation();

  // Controlled viewState for react-map-gl
  const [viewState, setViewState] = useState({
    latitude: 21.0,
    longitude: 78.0,
    zoom: 5
  });

  const mapCenter = { lat: viewState.latitude, lng: viewState.longitude };
  const zoom = viewState.zoom;

  const setMapCenter = (coords) => {
    setViewState(prev => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng
    }));
  };

  const setZoom = (z) => {
    setViewState(prev => ({
      ...prev,
      zoom: z
    }));
  };
  const [stats, setStats] = useState({ total: 0, web: 0, whatsapp: 0 });
  const [view, setView] = useState('farmers'); // 'farmers' or 'mandis'
  const [mandis, setMandis] = useState([]);
  const [selectedMandi, setSelectedMandi] = useState(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { language } = useLanguage();
  const t = translations[language];
  const d = t.chat.dashboard.heatmap;
  const da = t.chat.dashboard.analytics;
  const { setMobileMenuOpen } = useMobileMenu();

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getFarmerLocations(token);
      const locs = Array.isArray(data) && data.length > 0 ? data : [];
      setBackendOnline(true);
      setLocations(locs);
      setStats({
        total: locs.length,
        web: locs.filter(l => l.source === 'web').length,
        whatsapp: locs.filter(l => l.source === 'whatsapp').length,
      });
    } catch {
      // Backend offline — show sample data as demo
      setBackendOnline(false);
      setLocations(SAMPLE_LOCATIONS);
      setStats({
        total: SAMPLE_LOCATIONS.length,
        web: SAMPLE_LOCATIONS.filter(l => l.source === 'web').length,
        whatsapp: SAMPLE_LOCATIONS.filter(l => l.source === 'whatsapp').length,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMandis = async () => {
    if (!mapCenter.lat || !mapCenter.lng) return;
    try {
      const token = await getToken();
      const data = await getLiveMandis(mapCenter.lat, mapCenter.lng, token);
      setMandis(data.mandis || []);
    } catch (err) {
      console.error("Error fetching mandis:", err);
    }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 300_000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (view === 'mandis') {
      fetchMandis();
    }
  }, [view, mapCenter.lat, mapCenter.lng]);

  // Sync initial location only once
  useEffect(() => {
    if (location?.lat && location?.lon) {
      setMapCenter({ lat: location.lat, lng: location.lon });
      setZoom(10);
    }
  }, [location?.lat, location?.lon]);

  return (
    <div style={{
      height: '100vh', width: '100%', display: 'flex', flexDirection: 'column',
      background: '#030905', color: '#e2f0e4', fontFamily: "'Inter', sans-serif", overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, padding: '0.9rem 1.5rem',
        background: 'rgba(6,18,10,0.95)', borderBottom: '1px solid rgba(74,222,128,0.12)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden" style={{ padding: '0.4rem', background: 'rgba(22,101,52,0.4)', border: '1px solid rgba(134,239,172,0.2)', borderRadius: '0.6rem', color: '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Menu size={18} />
          </button>
          <span style={{ fontSize: '1.4rem' }}>🗺️</span>
          <div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.15rem', fontWeight: 900, color: '#f0fdf4', margin: 0 }}>
              {d.pageTitle}
            </h1>
            <p style={{ color: 'rgba(134,239,172,0.45)', fontSize: '0.72rem', margin: 0 }}>
              {backendOnline === false
                ? d.demoData
                : locations.length === 0 && backendOnline
                  ? d.waitingForFarmers
                  : d.totalLocations(locations.length)}
            </p>
          </div>
        </div>

        {/* Stats + Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { icon: <Users size={14} />, label: da.charts.farmers, value: stats.total, color: '#4ade80' },
            { icon: <Globe size={14} />, label: da.charts.webLegend, value: stats.web, color: '#34d399' },
            { icon: <Activity size={14} />, label: da.charts.whatsappLegend, value: stats.whatsapp, color: '#facc15' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(22,101,52,0.15)', padding: '0.4rem 0.8rem',
              borderRadius: '2rem', border: '1px solid rgba(74,222,128,0.08)'
            }}>
              <span style={{ color, display: 'flex' }}>{icon}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,253,244,0.7)' }}>{label}:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color }}>{value}</span>
            </div>
          ))}

          <button
            onClick={() => setView(view === 'farmers' ? 'mandis' : 'farmers')}
            style={{
              padding: '0.5rem 0.9rem',
              background: view === 'mandis' ? 'rgba(74,222,128,0.2)' : 'rgba(22,101,52,0.15)',
              border: `1px solid ${view === 'mandis' ? '#4ade80' : 'rgba(74,222,128,0.2)'}`,
              borderRadius: '0.6rem', color: view === 'mandis' ? '#ffffff' : '#4ade80', fontSize: '0.75rem', fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {view === 'farmers' ? <Store size={14} /> : <Users size={14} />}
            {view === 'farmers' ? da.charts.showMandis : da.charts.farmers}
          </button>

          <button
            onClick={fetchLocations}
            disabled={loading}
            style={{
              padding: '0.5rem 0.9rem',
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '0.6rem', color: '#4ade80', fontSize: '0.75rem', fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: loading ? 0.6 : 1
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> {da.refresh}
          </button>

          <button
            onClick={() => navigate('/analytics')}
            style={{
              padding: '0.5rem 0.9rem',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.6rem', color: '#fca5a5', fontSize: '0.75rem', fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            ✕ Exit Full Screen
          </button>
        </div>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(3,9,5,0.9)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '1rem', zIndex: 1000,
          }}>
            <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>🌾</div>
            <p style={{ color: 'rgba(134,239,172,0.6)', fontSize: '0.9rem' }}>{d.loadingMap}</p>
          </div>
        )}

        {!loading && locations.length === 0 && backendOnline && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.75rem', zIndex: 10,
            background: 'rgba(3,9,5,0.5)',
          }}>
            <span style={{ fontSize: '3rem', opacity: 0.4 }}>📍</span>
            <p style={{ color: 'rgba(134,239,172,0.4)', fontSize: '0.9rem' }}>
              {d.noLocationsYet}
            </p>
            <p style={{ color: 'rgba(134,239,172,0.25)', fontSize: '0.78rem' }}>
              {d.locationInstruction}
            </p>
          </div>
        )}

        {!loading && (
          <motion.div style={{ height: '100%', width: '100%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {isLoaded ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Map
                  ref={mapRef}
                  {...viewState}
                  onMove={evt => {
                    setViewState(evt.viewState);
                    if (view === 'mandis') {
                      fetchMandis();
                    }
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle={theme === 'light' ? MAP_STYLES.roadmap_light : MAP_STYLES.roadmap_dark}
                >
                  {view === 'farmers' && locations.map((loc, i) => (
                    <Marker
                      key={i}
                      latitude={loc.latitude}
                      longitude={loc.longitude}
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setSelectedLoc(loc);
                      }}
                    >
                      <div 
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: getMarkerColor(loc.source),
                          opacity: 0.8,
                          border: '2px solid #fff',
                          cursor: 'pointer',
                          boxShadow: `0 0 10px ${getMarkerColor(loc.source)}`
                        }}
                      />
                    </Marker>
                  ))}

                  {selectedLoc && (
                    <Popup
                      latitude={selectedLoc.latitude}
                      longitude={selectedLoc.longitude}
                      onClose={() => setSelectedLoc(null)}
                      closeButton={true}
                      closeOnClick={false}
                      anchor="top"
                    >
                      <div style={{ fontFamily: "'Inter', sans-serif", minWidth: 160, padding: 4, color: '#000' }}>
                        <p style={{ fontWeight: 700, marginBottom: '0.3rem', color: '#166534', fontSize: '0.9rem' }}>
                          📍 {selectedLoc.city || selectedLoc.state || 'India'}
                        </p>
                        {selectedLoc.state && (
                          <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.2rem' }}>{selectedLoc.state}</p>
                        )}
                        <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.2rem' }}>
                          Source: {selectedLoc.source === 'whatsapp' ? '📱 WhatsApp' : '🌐 Web'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#777' }}>
                          {selectedLoc.latitude.toFixed(4)}°N, {selectedLoc.longitude.toFixed(4)}°E
                        </p>
                      </div>
                    </Popup>
                  )}

                  {view === 'mandis' && mandis.map((mandi, i) => (
                    <Marker
                      key={`mandi-${i}`}
                      latitude={mandi.lat}
                      longitude={mandi.lon}
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setSelectedMandi(mandi);
                      }}
                    >
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: '#4ade80',
                        border: '2px solid #ffffff',
                        cursor: 'pointer',
                        boxShadow: '0 0 6px rgba(0,0,0,0.3)'
                      }} />
                    </Marker>
                  ))}

                  {selectedMandi && (
                    <Popup
                      latitude={selectedMandi.lat}
                      longitude={selectedMandi.lon}
                      onClose={() => setSelectedMandi(null)}
                      closeButton={true}
                      closeOnClick={false}
                      anchor="top"
                    >
                      <div style={{ fontFamily: "'Inter', sans-serif", minWidth: 200, padding: 8, color: '#000' }}>
                        <p style={{ fontWeight: 900, marginBottom: '0.4rem', color: '#166534', fontSize: '1rem' }}>
                          🏪 {selectedMandi.name}
                        </p>
                        {selectedMandi.price_note && (
                          <div style={{ background: 'rgba(22,101,52,0.05)', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', margin: 0 }}>
                              {selectedMandi.price_note}
                            </p>
                          </div>
                        )}
                        <p style={{ fontSize: '0.8rem', color: '#444', marginBottom: '0.2rem' }}>
                          <strong>Crops:</strong> {selectedMandi.crops}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#666' }}>
                          📍 {selectedMandi.city} | {selectedMandi.type}
                        </p>
                      </div>
                    </Popup>
                  )}

                  {/* User Location Marker */}
                  {location?.lat && location?.lon && (
                    <Marker
                      latitude={location.lat}
                      longitude={location.lon}
                    >
                      <div style={{ cursor: 'pointer', transform: 'translate(-50%, -100%)' }}>
                        <img 
                          src="https://maps.google.com/mapfiles/ms/icons/red-dot.png" 
                          alt="user-pin"
                          style={{ width: '36px', height: '36px' }}
                        />
                      </div>
                    </Marker>
                  )}
                  <MapLegend tHeatmap={d} />
                </Map>

                {/* Custom Zoom Controls */}
                <div style={{
                  position: 'absolute', bottom: '1.5rem', left: '1rem', zIndex: 1000,
                  display: 'flex', flexDirection: 'column', gap: '0.5rem'
                }}>
                  <button onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(20, prev.zoom + 1) }))}
                    style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                      background: 'rgba(6,18,10,0.9)', border: '1px solid rgba(74,222,128,0.2)',
                      color: '#4ade80', fontSize: '1.5rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
                    }}>+</button>
                  <button onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(1, prev.zoom - 1) }))}
                    style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                      background: 'rgba(6,18,10,0.9)', border: '1px solid rgba(74,222,128,0.2)',
                      color: '#4ade80', fontSize: '1.5rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
                    }}>−</button>
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', width: '100%', background: '#030905', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'rgba(134,239,172,0.4)', fontSize: '0.9rem' }}>{d.loadingMap}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
