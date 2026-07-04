import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, Smartphone, Globe, Activity, TrendingUp, Map, RefreshCw, MapPin, Store, CheckCircle, Menu } from 'lucide-react';
import { GoogleMap, MarkerF, InfoWindowF, CircleF, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { getAnalytics, getFarmerLocations, getLiveMandis, getAllMarketPrices } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { translations } from '../utils/translations';
import { useAuth } from '@clerk/clerk-react';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/Map.css';

const PIE_COLORS = ['#4ade80', '#34d399'];

const card = {
  background: 'var(--card-bg-glass)',
  border: '1px solid var(--glass-border)',
  borderRadius: '1.25rem',
  backdropFilter: 'blur(16px)',
  padding: 'clamp(1.25rem, 3vw, 2rem)',
};

// ─── Live indicator ───────────────────────────────────────────────────────────
function LiveBadge({ label = 'Live' }) {
  const { theme } = useTheme();
  const color = theme === 'light' ? '#166534' : '#4ade80';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.25rem 0.6rem', borderRadius: '999px',
      background: theme === 'light' ? 'rgba(22,101,52,0.08)' : 'rgba(74,222,128,0.15)', 
      border: `1px solid ${theme === 'light' ? 'rgba(22,101,52,0.2)' : 'rgba(74,222,128,0.35)'}`,
      fontSize: '0.7rem', fontWeight: 600, color: color,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: color,
        animation: 'pulse 1.5s infinite', boxShadow: `0 0 6px ${color}`,
      }} />
      {label}
    </span>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--tooltip-bg)', border: '1px solid var(--glass-border)',
      borderRadius: '0.75rem', padding: '0.7rem 1rem', fontSize: '0.82rem',
    }}>
      <p style={{ color: 'var(--g)', fontWeight: 600, marginBottom: '0.2rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--g)' }}>
          {p.name}: <strong>{p.value?.toLocaleString('en-IN')}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── KPI card ────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color = '#4ade80', delay = 0, isReal = false }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ ...card, position: 'relative', overflow: 'hidden', minWidth: 0 }}
    >
      {/* Decorative glow blob */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: `${color}12`, pointerEvents: 'none' }} />

      {/* Top row: icon + LIVE badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ width: 46, height: 46, borderRadius: '0.75rem', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color={color} />
        </div>
        {isReal && <LiveBadge />}
      </div>

      {/* Label */}
      <div style={{ color: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.5)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
        {label}
      </div>

      {/* Value */}
      <div style={{ color: theme === 'light' && color === '#4ade80' ? '#15803d' : color, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1, fontFamily: "'Outfit',sans-serif", marginBottom: sub ? '0.45rem' : 0 }}>
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </div>

      {/* Sub-label */}
      {sub && <div style={{ color: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.35)', fontSize: '0.74rem', fontWeight: 500, lineHeight: 1.4 }}>{sub}</div>}
    </motion.div>
  );
};

// ─── Empty state for charts ───────────────────────────────────────────────────
const EmptyChart = ({ message }) => {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 250, gap: '0.5rem' }}>
      <span style={{ fontSize: '2rem', opacity: 0.4 }}>📊</span>
      <p style={{ color: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.35)', fontSize: '0.8rem', textAlign: 'center', maxWidth: 220, fontWeight: 500 }}>{message}</p>
    </div>
  );
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MAP_OPTIONS_DARK = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#000000" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#222222" }, { visibility: "on" }],
    },
    {
      featureType: "administrative.country",
      elementType: "geometry.stroke",
      stylers: [{ color: "#333333" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#050505" }],
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#111111" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#333333" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#1a1a1a" }],
    },
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0a110d" }],
    },
  ],
};

const MAP_OPTIONS_LIGHT = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#c9b2a6" }],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#93817c" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#f5f1e6" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#fdfcf8" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#f8c967" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#b9d3c2" }],
    },
  ],
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FarmerAnalytics() {
  const { theme } = useTheme();
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const [data, setData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [allIndiaMandis, setAllIndiaMandis] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mapMode, setMapMode] = useState('farmers');
  const [mapLoading, setMapLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { location: userLoc } = useLocation();

  const { language } = useLanguage();
  const { setMobileMenuOpen } = useMobileMenu();
  const t = translations[language];
  const d = t.chat.dashboard.analytics;

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const token = await getToken();
      setBackendOnline(true);

      // Fire all requests in parallel
      const statsPromise = getAnalytics(token);
      const locsPromise = getFarmerLocations(token);
      
      // If we are in "All India" mode, we'll fetch that separately or update here
      // For now, keep the background sync for local mandis
      const mandisPromise = getLiveMandis(userLoc?.lat || 23.0, userLoc?.lon || 72.0, token, false);
      const allIndiaPromise = getAllMarketPrices({ limit: 1 }, token);

      // 1. Process Stats
      statsPromise.then(res => {
        if (res) setData(res);
        setLoading(false);
      }).catch(() => setLoading(false));

      // 2. Process Locations
      locsPromise.then(res => {
        setLocations(res?.locations || res || []);
      }).catch(() => {});

      // 3. Process Mandis (Local)
      mandisPromise.then(res => {
        if (mapMode !== 'mandis-all') {
          setMandis(res?.mandis || res || []);
        }
      }).catch(() => {});

      // 4. Process India-wide Mandi Count
      allIndiaPromise.then(res => {
        if (res?.total) setAllIndiaMandis(res.total);
      }).catch(() => {});

      setLastRefresh(new Date());
    } catch {
      setBackendOnline(false);
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [getToken, userLoc, mapMode]);

  const handleShowAllMandis = async () => {
    setMapMode('mandis-all');
    setMapLoading(true);
    try {
      const token = await getToken();
      const res = await getLiveMandis(0, 0, token, true); // all_india = true
      setMandis(res?.mandis || res || []);
    } catch (err) {
      console.error("Failed to fetch all India mandis:", err);
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const total = data?.total_farmers ?? 0;
  const webUsers = data?.web_users ?? 0;
  const waUsers = data?.whatsapp_users ?? 0;
  const dailyActive = data?.daily_active ?? 0;
  const locationCount = data?.location_count ?? 0;
  const stateData = data?.farmers_by_state ?? [];
  const trendData = data?.daily_trend ?? [];
  const topQueries = data?.top_queries ?? [];
  const pieData = [
    { name: d.charts.webLegend, value: webUsers || 0 },
    { name: d.charts.whatsappLegend, value: waUsers || 0 },
  ];

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: theme === 'light' ? 'var(--dk2)' : 'linear-gradient(135deg, var(--dk3) 0%, var(--dk2) 60%, var(--dk3) 100%)',
      color: 'var(--txt)', fontFamily: "'Inter', sans-serif", overflowY: 'auto',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '70%', height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,101,52,0.13), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden" style={{ padding: '0.4rem', background: 'rgba(22,101,52,0.4)', border: '1px solid rgba(134,239,172,0.2)', borderRadius: '0.6rem', color: '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Menu size={18} />
              </button>
              <span style={{ fontSize: '1.8rem' }}>🌾</span>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)', fontWeight: 700, color: 'var(--header-txt)', margin: 0 }}>
                {d.pageTitle}
              </h1>
              <LiveBadge />
            </div>
            <p style={{ color: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.45)', fontSize: '0.8rem', margin: 0 }}>
              {d.liveSubtitle}
              {lastRefresh && (
                <span style={{ marginLeft: '0.75rem', opacity: 0.5 }}>
                  · {d.updatedPrefix} {lastRefresh.toLocaleTimeString(language === 'en' ? 'en-US' : 'hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {backendOnline !== null && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 0.85rem', borderRadius: '0.6rem',
                background: backendOnline ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${backendOnline ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
                fontSize: '0.75rem', fontWeight: 600,
                color: backendOnline ? '#4ade80' : '#f87171',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: backendOnline ? '#4ade80' : '#f87171' }} />
                {backendOnline ? d.backendOnline : d.backendOffline}
              </div>
            )}
            <button onClick={fetchData} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.85rem', borderRadius: '0.6rem', cursor: 'pointer',
              background: 'var(--g)/20', border: '1px solid var(--glass-border)',
              color: 'var(--glt)', fontSize: '0.8rem', fontWeight: 600,
            }}>
              <RefreshCw size={13} style={{ animation: loading ? 'spin 2s linear infinite' : 'none' }} /> {d.refresh}
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '55vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>🌾</div>
            <p style={{ color: 'rgba(134,239,172,0.5)' }}>{d.charts.loadingLive}</p>
          </div>
        ) : (
          <>
            {!backendOnline && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...card, marginBottom: '1.5rem', borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(120,80,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <div>
                  <p style={{ color: '#fbbf24', fontWeight: 700, margin: 0, fontSize: '0.88rem' }}>{d.backendNotReachable}</p>
                  <p style={{ color: 'rgba(251,191,36,0.65)', margin: 0, fontSize: '0.78rem' }}>
                    {d.backendOfflineTip}
                  </p>
                </div>
              </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <KpiCard icon={Users} label={d.kpis.totalVisitors} value={total} sub={d.kpis.totalVisitorsDesc} color="#4ade80" delay={0} isReal={backendOnline} />
              <KpiCard icon={Globe} label={d.kpis.webUsers} value={webUsers} sub={d.kpis.webUsersDesc} color="#34d399" delay={0.07} isReal={backendOnline} />
              <KpiCard icon={Smartphone} label={d.kpis.whatsappUsers} value={waUsers} sub={d.kpis.whatsappUsersDesc} color="#6ee7b7" delay={0.14} isReal={backendOnline} />
              <KpiCard icon={Activity} label={d.kpis.activeToday} value={dailyActive} sub={d.kpis.activeTodayDesc} color="#a7f3d0" delay={0.21} isReal={backendOnline} />
              <KpiCard icon={MapPin} label={d.kpis.locationShared} value={locationCount} sub={d.kpis.locationSharedDesc} color="#4ade80" delay={0.28} isReal={backendOnline} />
              <KpiCard icon={Store} label="Ind-Wide Mandis" value={allIndiaMandis} sub="Total verified Indian markets" color="#60a5fa" delay={0.35} isReal={backendOnline} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
                  <TrendingUp size={17} color="var(--g)" />
                  <h3 style={{ color: 'var(--g)', fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>{d.charts.farmersByState}</h3>
                  {backendOnline && stateData.length === 0 && (
                    <span style={{ fontSize: '0.68rem', color: 'rgba(134,239,172,0.4)', marginLeft: 'auto' }}>{d.charts.noDataYet}</span>
                  )}
                </div>
                {stateData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stateData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(134,239,172,0.07)" />
                      <XAxis dataKey="state" tick={{ fontSize: 9.5, fill: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.55)' }} angle={-28} textAnchor="end" height={52} />
                      <YAxis tick={{ fontSize: 9.5, fill: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.55)' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name={d.charts.farmers} radius={[5, 5, 0, 0]}>
                        {stateData.map((_, i) => (
                          <Cell key={i} fill={`hsl(${142 - i * 6}, 68%, ${36 + i * 2}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message={d.charts.noDataYet} />
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
                  <Activity size={17} color="var(--g)" />
                  <h3 style={{ color: 'var(--g)', fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>{d.charts.dailyVisits}</h3>
                </div>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={trendData} margin={{ left: -10 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(134,239,172,0.07)" />
                      <XAxis dataKey="date" tick={{ fontSize: 9.5, fill: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.55)' }} />
                      <YAxis tick={{ fontSize: 9.5, fill: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.55)' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="farmers" name={d.charts.visitors}
                        stroke="#4ade80" strokeWidth={2.5} fill="url(#areaGrad)"
                        dot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message={d.charts.noDataYet} />
                )}
              </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
                  <Globe size={17} color="var(--g)" />
                  <h3 style={{ color: 'var(--g)', fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>{d.charts.webVsWhatsapp}</h3>
                </div>
                {webUsers + waUsers > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={88}
                        dataKey="value" paddingAngle={4} strokeWidth={0}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={10}
                        formatter={v => <span style={{ color: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.7)', fontSize: '0.8rem' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message={d.charts.noDataYet} />
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
                  <span style={{ fontSize: '1rem' }}>💬</span>
                  <h3 style={{ color: 'var(--g)', fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>{d.charts.mostAsked}</h3>
                </div>
                {topQueries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {topQueries.map((q, i) => {
                      const maxCount = topQueries[0]?.count || 1;
                      const pct = Math.round((q.count / maxCount) * 100);
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.22rem' }}>
                            <span style={{ fontSize: '0.81rem', color: theme === 'light' ? 'var(--txt)' : 'rgba(226,240,228,0.8)', fontWeight: 500 }}>{i + 1}. {q.query}</span>
                            <span style={{ fontSize: '0.76rem', color: theme === 'light' ? 'var(--glt)' : 'rgba(74,222,128,0.75)', fontWeight: 700 }}>{q.count.toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ height: 4, borderRadius: 4, background: 'rgba(22,101,52,0.3)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.6 + i * 0.05, duration: 0.65, ease: 'easeOut' }}
                              style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, #166534, hsl(${142 - i * 5}, 70%, 52%))` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyChart message={d.charts.noDataYet} />
                )}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ ...card, marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={17} color="var(--g)" />
                  <h3 style={{ color: 'var(--g)', fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>
                    {d.charts.liveMap}
                    {locations.length > 0 && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'rgba(74,222,128,0.6)', fontWeight: 500 }}>
                        — {locations.length} {d.charts.farmers.toLowerCase()}
                      </span>
                    )}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', background: 'rgba(22,101,52,0.15)', padding: '0.2rem', borderRadius: '0.5rem', border: '1px solid rgba(74,222,128,0.1)' }}>
                    <button onClick={() => setMapMode('farmers')} style={{
                      padding: '0.25rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                      background: mapMode === 'farmers' ? '#166534' : 'transparent', color: mapMode === 'farmers' ? '#fff' : 'rgba(134,239,172,0.4)', border: 'none'
                    }}>Farmers</button>
                    <button onClick={() => setMapMode('mandis')} style={{
                      padding: '0.25rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                      background: mapMode === 'mandis' ? '#166534' : 'transparent', color: mapMode === 'mandis' ? '#fff' : 'rgba(134,239,172,0.4)', border: 'none'
                    }}>Local</button>
                    <button onClick={handleShowAllMandis} style={{
                      padding: '0.25rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                      background: mapMode === 'mandis-all' ? '#166534' : 'transparent', color: mapMode === 'mandis-all' ? '#fff' : 'rgba(134,239,172,0.4)', border: 'none'
                    }}>All Mandis</button>
                  </div>
                  <button onClick={() => navigate('/heatmap')} style={{
                    padding: '0.25rem 0.6rem', marginLeft: '0.5rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'none', display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <Globe size={12} /> Full View
                  </button>
                </div>
              </div>
              <div style={{ borderRadius: '0.75rem', overflow: 'hidden', height: 380, border: '1px solid rgba(134,239,172,0.1)', position: 'relative' }}>
                {locations.length === 0 && backendOnline && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '0.5rem', zIndex: 10,
                    background: 'var(--dk3)/60',
                  }}>
                    <span style={{ fontSize: '2rem', opacity: 0.4 }}>🗺️</span>
                    <p style={{ color: 'rgba(134,239,172,0.4)', fontSize: '0.82rem' }}>
                      {d.charts.noDataYet}
                    </p>
                  </div>
                )}
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={
                      mapMode === 'mandis-all' 
                        ? { lat: 22.5, lng: 78.5 } 
                        : (userLoc?.lat && userLoc?.lon ? { lat: userLoc.lat, lng: userLoc.lon } : { lat: 21.5, lng: 78.5 })
                    }
                    zoom={mapMode === 'mandis-all' ? 4.5 : (userLoc?.lat ? 9 : 4.8)}
                    options={{
                      ...(theme === 'dark' ? MAP_OPTIONS_DARK : MAP_OPTIONS_LIGHT),
                    }}
                  >
                    {mapMode === 'farmers' && locations.map((loc, i) => (
                      <React.Fragment key={i}>
                        <CircleF
                          center={{ lat: loc.latitude, lng: loc.longitude }}
                          radius={150}
                          onClick={() => setSelectedItem({ ...loc, type: 'farmer' })}
                          options={{
                            strokeColor: loc.source === 'whatsapp' ? '#facc15' : '#4ade80',
                            strokeOpacity: 0.8,
                            strokeWeight: 1.5,
                            fillColor: loc.source === 'whatsapp' ? '#facc15' : '#4ade80',
                            fillOpacity: 0.35,
                          }}
                        />
                        {selectedItem?.type === 'farmer' && selectedItem.latitude === loc.latitude && (
                          <InfoWindowF
                            position={{ lat: loc.latitude, lng: loc.longitude }}
                            onCloseClick={() => setSelectedItem(null)}
                          >
                            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.82rem', color: '#166534', minWidth: 150, padding: 4 }}>
                              <b style={{ fontSize: '0.9rem' }}>📍 {loc.city || loc.state || 'India'}</b><br />
                              {loc.state && <span style={{ color: '#555', fontSize: '0.75rem' }}>{loc.state}<br /></span>}
                              <span style={{ color: loc.source === 'whatsapp' ? '#b45309' : '#166534', fontWeight: 600, fontSize: '0.7rem' }}>
                                {loc.source === 'whatsapp' ? '📱 WhatsApp' : '🌐 Web'} User
                              </span>
                            </div>
                          </InfoWindowF>
                        )}
                      </React.Fragment>
                    ))}

                    {mapMode.startsWith('mandis') && mandis.map((m, i) => (
                      <React.Fragment key={i}>
                        <MarkerF
                          position={{ lat: m.lat, lng: m.lon }}
                          onClick={() => setSelectedItem({ ...m, type: 'mandi' })}
                          icon={{
                            url: m.type === 'terminal' ? 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                          }}
                        />
                        {selectedItem?.type === 'mandi' && selectedItem.lat === m.lat && (
                          <InfoWindowF
                            position={{ lat: m.lat, lng: m.lon }}
                            onCloseClick={() => setSelectedItem(null)}
                          >
                            <div style={{ fontFamily: 'Inter,sans-serif', minWidth: 180, padding: 4 }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#166534' }}>🏪 {m.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>📍 {m.city}</div>
                              <div style={{ fontSize: '0.7rem', color: '#555' }}>🌾 {m.crops}</div>
                              {m.is_accurate && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: '#2563eb' }}>
                                  <CheckCircle size={10} />
                                  <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>Geocoded Accurate</span>
                                </div>
                              )}
                            </div>
                          </InfoWindowF>
                        )}
                      </React.Fragment>
                    ))}

                    {/* User Location Marker */}
                    {userLoc && (
                      <MarkerF
                        position={{ lat: userLoc.lat, lng: userLoc.lng }}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                          scaledSize: new google.maps.Size(40, 40)
                        }}
                        title="You"
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--dk3)', gap: '1rem' }}>
                    <RefreshCw className="animate-spin" style={{ color: 'var(--g)/50' }} size={32} />
                    <p style={{ color: 'rgba(134,239,172,0.4)', fontSize: '0.82rem', fontWeight: 600 }}>Initializing intelligence map…</p>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.6rem', fontSize: '0.76rem', color: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.45)', alignItems: 'center' }}>
                {mapMode === 'farmers' ? (
                  <>
                    <span><span style={{ color: '#4ade80' }}>●</span> {d.charts.webLegend}</span>
                    <span><span style={{ color: '#facc15' }}>●</span> {d.charts.whatsappLegend}</span>
                  </>
                ) : (
                  <>
                    <span><span style={{ color: '#4ade80' }}>●</span> Wholesale Markets</span>
                    <span><span style={{ color: '#fb923c' }}>●</span> Terminal Markets</span>
                    {mapLoading && <span style={{ marginLeft: '1rem', color: '#4ade80', animation: 'pulse 1.5s infinite' }}>Searching India...</span>}
                  </>
                )}
                <span style={{ marginLeft: 'auto' }}>{d.charts.mapInstruction}</span>
              </div>
            </motion.div>

            {/* Footer */}
            <div style={{ marginTop: '2rem', textAlign: 'center', color: theme === 'light' ? 'var(--mut)' : 'rgba(134,239,172,0.28)', fontSize: '0.72rem', opacity: 0.6 }}>
              🌾 KrishiAI National Farmer Intelligence Platform · Auto-refreshes every 30 seconds · Anonymous & secure
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
