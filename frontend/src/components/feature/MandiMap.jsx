import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, Loader2, Search, RefreshCw, Info, ExternalLink, ChevronRight, CheckCircle, Satellite, Layers, Mountain, Map as MapIcon, Eye, Menu, Maximize2, Minimize2, ArrowUpRight, Clock, Milestone, List, ChevronDown } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { getLiveMandis, getNearbyMarkets } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMobileMenu } from '../../context/MobileMenuContext';
import { useTheme } from '../../context/ThemeContext';

const TILE_LAYERS = {
  roadmap_light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  roadmap_dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  labels: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
};

const redIcon = L.divIcon({
  html: `<img src="https://maps.google.com/mapfiles/ms/icons/red-dot.png" style="width: 32px; height: 32px; display: block;" />`,
  className: 'custom-marker-pin-red',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const blueIcon = L.divIcon({
  html: `<img src="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" style="width: 32px; height: 32px; display: block;" />`,
  className: 'custom-marker-pin-blue',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const orangeIcon = L.divIcon({
  html: `<img src="https://maps.google.com/mapfiles/ms/icons/orange-dot.png" style="width: 32px; height: 32px; display: block;" />`,
  className: 'custom-marker-pin-orange',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const greenIcon = L.divIcon({
  html: `<img src="https://maps.google.com/mapfiles/ms/icons/green-dot.png" style="width: 32px; height: 32px; display: block;" />`,
  className: 'custom-marker-pin-green',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

function MapController({ center, zoom, onViewStateChange, recenterCount }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [recenterCount]);

  useMapEvents({
    moveend() {
      const currentCenter = map.getCenter();
      onViewStateChange?.({
        latitude: currentCenter.lat,
        longitude: currentCenter.lng,
        zoom: map.getZoom()
      });
    }
  });

  return null;
}

/* ═══ MAP TILE LAYERS ═══ */
const MAP_LAYERS = [
  { id: 'satellite', name: 'Satellite', icon: <Satellite size={14} /> },
  { id: 'hybrid', name: 'Hybrid', icon: <Layers size={14} /> },
  { id: 'terrain', name: 'Terrain', icon: <Mountain size={14} /> },
  { id: 'roadmap', name: 'Street Map', icon: <MapIcon size={14} /> },
  { id: 'streetview', name: 'Street View', icon: <Eye size={14} /> },
];


/* ─── Sub-component: handles marker selection and popup ─── */
function MandiMarker({ m, isSelected, onClick }) {
  if (!m || typeof m.lat !== 'number' || typeof m.lon !== 'number' || isNaN(m.lat) || isNaN(m.lon)) return null;

  return (
    <Marker
      position={[m.lat, m.lon]}
      icon={m.type === 'terminal' ? orangeIcon : greenIcon}
      eventHandlers={{
        click: (e) => {
          onClick();
        }
      }}
    />
  );
}


export default function MandiMap({ onClose, userLat, userLon, isPage = false }) {
  const { setMobileMenuOpen } = useMobileMenu();
  const isLoaded = true;
  const { getToken } = useAuth();
  const { theme } = useTheme();
  
  const [mandis, setMandis] = useState([]);
  const [loadingMandis, setLoadingMandis] = useState(true);
  
  // Controlled viewState for react-map-gl
  const [viewState, setViewState] = useState({
    latitude: userLat && userLon ? userLat : 22.5937,
    longitude: userLat && userLon ? userLon : 78.9629,
    zoom: userLat && userLon ? 10 : 5
  });

  const [recenterCount, setRecenterCount] = useState(0);

  const mapCenter = { lat: viewState.latitude, lng: viewState.longitude };
  const zoom = viewState.zoom;

  const setMapCenter = (coords) => {
    setViewState(prev => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng
    }));
    setRecenterCount(prev => prev + 1);
  };

  const setZoom = (z) => {
    setViewState(prev => ({
      ...prev,
      zoom: z
    }));
    setRecenterCount(prev => prev + 1);
  };

  const [userCoords, setUserCoords] = useState(userLat && userLon ? { lat: userLat, lng: userLon } : null);
  const [hasLocation, setHasLocation] = useState(!!(userLat && userLon));
  const [selectedMandi, setSelectedMandi] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allIndiaMode, setAllIndiaMode] = useState(false);
  const [activeLayer, setActiveLayer] = useState('hybrid');
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);
  const [showDiscovered, setShowDiscovered] = useState(true);
  const [nearbyMarkets, setNearbyMarkets] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHud, setShowHud] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(400);
  
  // Directions States
  const [response, setResponse] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [isComputingRoute, setIsComputingRoute] = useState(false);
  const [navError, setNavError] = useState(null);

  const routeCoordinates = useMemo(() => {
    if (!response || !response.coordinates) return [];
    return response.coordinates.map(coord => [coord[1], coord[0]]); // [lat, lon]
  }, [response]);

  const handleDragStart = (e) => {
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const handlePointerMove = (moveEvent) => {
      const newHeight = window.innerHeight - moveEvent.clientY;
      const clamped = Math.max(100, Math.min(newHeight, window.innerHeight * 0.85));
      setSheetHeight(clamped);
    };

    const handlePointerUp = (upEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      target.removeEventListener('pointermove', handlePointerMove);
      target.removeEventListener('pointerup', handlePointerUp);
    };

    target.addEventListener('pointermove', handlePointerMove);
    target.addEventListener('pointerup', handlePointerUp);
  };

  const openInExternalMaps = (mandi) => {
    const target = mandi || selectedMandi;
    if (!target) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lon}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleGetDirections = async (mandi) => {
    if (!userCoords) {
      alert("Please enable location to get directions.");
      return;
    }
    const target = mandi || selectedMandi;
    if (!target) return;

    setNavError(null);
    setIsComputingRoute(true);
    setShowDirections(true);
    setSelectedMandi(target);

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userCoords.lng},${userCoords.lat};${target.lon},${target.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("OSRM routing request failed");
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setResponse(route.geometry); // GeoJSON format
        
        // Map OSRM steps format to match the state format used by the UI
        const steps = route.legs[0].steps.map(step => ({
          instructions: step.maneuver.type === 'depart' 
            ? `Depart from starting point on ${step.name || 'road'}`
            : `${step.maneuver.type} ${step.maneuver.modifier || ''} onto ${step.name || 'road'}`,
          distance: { text: `${(step.distance).toFixed(0)} m` },
          duration: { text: `${Math.round(step.duration / 60)} min` }
        }));

        setTravelInfo({
          distance: `${(route.distance / 1000).toFixed(1)} km`,
          duration: `${Math.round(route.duration / 60)} mins`,
          steps: steps
        });
      } else {
        throw new Error("No route found");
      }
    } catch (error) {
      console.error("OSRM Route Error:", error);
      setNavError("Failed to fetch free route. Using External Fallback.");
    } finally {
      setIsComputingRoute(false);
    }
  };

  // Fetch Discovery data
  useEffect(() => {
    const lat = selectedMandi?.lat || userLat || mapCenter.lat;
    const lon = selectedMandi?.lon || userLon || mapCenter.lng;

    if (lat && lon) {
      const fetchDiscovery = async () => {
        setLoadingNearby(true);
        try {
          const token = await getToken();
          const data = await getNearbyMarkets(lat, lon, 50000, token);
          setNearbyMarkets(data.nearby || []);
        } catch (err) {
          console.error("Discovery discovery error", err);
        } finally {
          setLoadingNearby(false);
        }
      };
      fetchDiscovery();
    } else {
      setNearbyMarkets([]);
    }
  }, [selectedMandi, userLat, userLon, mapCenter.lat, mapCenter.lng, getToken]);

  const filteredMandis = React.useMemo(() => {
    if (!searchTerm) return mandis;
    const lowSearch = searchTerm.toLowerCase();
    return mandis.filter(m =>
      (m.name || '').toLowerCase().includes(lowSearch) ||
      (m.city || '').toLowerCase().includes(lowSearch) ||
      (m.crops || '').toLowerCase().includes(lowSearch)
    );
  }, [mandis, searchTerm]);

  /* ─── fetch from backend ─── */
  const fetchGovData = async (lat, lon, isAllIndia = false) => {
    setLoadingMandis(true);
    try {
      const token = await getToken();
      const data = await getLiveMandis(lat, lon, token, isAllIndia);
      const newMandis = data.mandis || [];
      setMandis(newMandis);

      if (!isAllIndia && newMandis.length > 0) {
        const nearest = newMandis[0];
        setSelectedMandi(nearest);
        setMapCenter({ lat: nearest.lat, lng: nearest.lon });
      }
    } catch (error) {
      console.error("Failed to fetch mandis:", error);
    } finally {
      setLoadingMandis(false);
    }
  };

  const toggleAllIndiaMode = () => {
    const newVal = !allIndiaMode;
    setAllIndiaMode(newVal);
    setShowDirections(false);
    setResponse(null);
    if (newVal) {
      setMapCenter({ lat: 20.5937, lng: 78.9629 });
      setZoom(4.5);
      fetchGovData(null, null, true);
    } else {
      if (userCoords) {
        setMapCenter(userCoords);
        setZoom(10);
        fetchGovData(userCoords.lat, userCoords.lng, false);
      }
    }
  };


  /* ─── geolocation ─── */
  useEffect(() => {
    if (userLat && userLon) {
      setHasLocation(true);
      const loc = { lat: userLat, lng: userLon };
      setMapCenter(loc);
      setUserCoords(loc);
      fetchGovData(userLat, userLon);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setHasLocation(true);
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMapCenter(loc);
          setUserCoords(loc);
          fetchGovData(loc.lat, loc.lng);
        },
        () => setLoadingMandis(false),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    } else setLoadingMandis(false);
  }, [userLat, userLon]);

  const onMapLoad = (evt) => {
    mapRef.current = evt.target;
  };

  const handleMandiClick = (m) => {
    setSelectedMandi(m);
    setMapCenter({ lat: m.lat, lng: m.lon });
    // Don't auto-show directions on every click to avoid API spam, but update destination if showing
    if (showDirections) {
      setResponse(null);
      setIsComputingRoute(true);
    }
  };


  const Wrapper = isPage ? 'div' : motion.div;
  const wrapperProps = isPage
    ? { className: `flex-1 overflow-hidden flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-[#030905]'}` }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: `fixed inset-0 z-[100] flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-[#030905]'}` };

  return (
    <Wrapper {...wrapperProps}>

      {/* ═══ HEADER BAR ═══ */}
      <header className={`px-5 py-3 border-b backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 flex-shrink-0 z-20 transition-colors ${
        theme === 'light' ? 'bg-white/90 border-gray-100' : 'bg-black/40 border-white/5'
      }`}>
        <div className="flex items-center gap-3">
          {isPage && (
            <button onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 -ml-2 rounded-xl transition-all ${
                theme === 'light' ? 'hover:bg-gray-100 text-slate-600' : 'hover:bg-white/5 active:bg-white/10 text-white/70'
              }`}
            >
              <Menu size={24} />
            </button>
          )}

          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 items-center justify-center shadow-lg shadow-emerald-500/20">
            <MapPin size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-black transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {allIndiaMode ? 'Nationwide' : 'Nearby'} Mandis <span className="text-emerald-500">Live</span>
            </h1>
            <p className={`text-[0.6rem] font-bold leading-none mt-0.5 transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>
              APMC Markets · {allIndiaMode ? 'All India' : 'Local Results'} · {mandis.length} found
            </p>
          </div>

        </div>
        <div className="flex items-center gap-2">
          {hasLocation && (
            <button onClick={() => fetchGovData(mapCenter.lat, mapCenter.lng, allIndiaMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[0.65rem] font-bold transition-all ${
                theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}>
              <RefreshCw size={12} /> Refresh
            </button>
          )}

          <div className={`flex items-center gap-1.5 py-1.5 px-3 border rounded-lg transition-colors ${
            theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/5'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${loadingMandis ? 'bg-amber-400 animate-pulse' : mandis.length > 0 ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`} />
            <span className={`text-[0.6rem] font-black transition-colors ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`}>
              {loadingMandis ? 'Connecting…' : mandis.length > 0 ? 'Connected' : 'No Data'}
            </span>
          </div>
          <button onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              theme === 'light' ? 'hover:bg-gray-100 text-gray-400 hover:text-slate-900' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white'
            }`}>
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ═══ MAP + SIDEBAR ═══ */}
      <div className="h-full flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ── LEFT: MAP (fills viewport) ── */}
        <div className={`flex-1 relative bg-slate-900 overflow-hidden transition-all duration-300 ${isExpanded ? 'fixed inset-0 z-[100]' : 'h-[45vh] lg:h-auto z-0'}`}>

          {isExpanded && (
            <button onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white flex items-center justify-center shadow-2xl transition-all"
            >
              <Minimize2 size={20} />
            </button>
          )}

          {/* ═══ MAP HUD ═══ */}
          <div className={`absolute top-4 left-4 z-[9999] flex flex-col gap-3 origin-top-left transition-transform duration-300 ${isExpanded ? 'scale-100' : 'scale-[0.85] sm:scale-95 md:scale-100'}`}>

            <button onClick={() => setShowHud(!showHud)}
              className="lg:hidden flex items-center gap-2 px-3 py-2.5 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl text-emerald-400 font-bold text-[0.75rem] shadow-2xl hover:bg-black transition-all">
              <Layers size={16} />
              {showHud ? 'Hide Intelligence' : 'Map Intelligence'}
              <ChevronRight size={14} className={`transition-transform duration-300 ${showHud ? 'rotate-90' : ''}`} />
            </button>

            <div className={`flex-col gap-3 ${showHud ? 'flex' : 'hidden lg:flex'}`}>
              <div className={`backdrop-blur-xl border rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-2xl relative z-20 ${
                theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'
              }`}>
                <div className={`flex items-center gap-2 px-2 pb-1.5 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                  <Layers size={12} className={theme === 'light' ? 'text-gray-400' : 'text-white/30'} />
                  <span className={`text-[0.55rem] font-black ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`}>Orbital mode</span>
                </div>
                <div className="relative">
                  {/* Dropdown Trigger */}
                  <button
                    onClick={() => setShowLayerDropdown(!showLayerDropdown)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-[0.65rem] font-bold border transition-all ${
                      theme === 'light'
                        ? 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
                        : 'bg-black/40 border-white/10 text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">
                        {MAP_LAYERS.find(l => l.id === activeLayer)?.icon}
                      </span>
                      <span>{MAP_LAYERS.find(l => l.id === activeLayer)?.name || 'Select View'}</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${showLayerDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown List */}
                  <AnimatePresence>
                    {showLayerDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className={`absolute left-0 right-0 mt-1.5 z-[100] p-1 rounded-xl border flex flex-col gap-0.5 shadow-2xl backdrop-blur-xl ${
                          theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-950/95 border-white/10'
                        }`}
                      >
                        {MAP_LAYERS.map(layer => (
                          <button
                            key={layer.id}
                            onClick={() => {
                              setActiveLayer(layer.id);
                              setShowLayerDropdown(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.65rem] font-bold transition-all ${
                              activeLayer === layer.id
                                ? (theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-300 border border-blue-500/20')
                                : (theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/5 text-white/50 hover:text-white')
                            }`}
                          >
                            <span className={activeLayer === layer.id ? 'text-white' : 'text-blue-500'}>
                              {layer.icon}
                            </span>
                            <span>{layer.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className={`backdrop-blur-xl border rounded-2xl p-2 flex flex-col gap-1 shadow-2xl relative z-10 ${
                theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'
              }`}>
                <button onClick={toggleAllIndiaMode}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[0.65rem] font-black border transition-all ${allIndiaMode
                    ? (theme === 'light' ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10')
                    : (theme === 'light' ? 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100' : 'bg-black/40 border-transparent text-white/40 hover:text-white')
                    }`}>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className={allIndiaMode ? (theme === 'light' ? 'text-white' : 'text-amber-400') : (theme === 'light' ? 'text-gray-300' : 'text-white/20')} />
                    <span>Nationwide view</span>
                  </div>
                  <div className={`w-6 h-3 rounded-full relative transition-colors ${allIndiaMode ? 'bg-amber-500' : (theme === 'light' ? 'bg-gray-200' : 'bg-white/10')}`}>
                    <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${allIndiaMode ? 'left-3.5' : 'left-0.5'}`} />
                  </div>
                </button>

                <button onClick={() => setShowDiscovered(!showDiscovered)}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[0.65rem] font-bold border transition-all ${showDiscovered
                    ? (theme === 'light' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300')
                    : (theme === 'light' ? 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100' : 'bg-black/40 border-transparent text-white/40 hover:text-white')
                    }`}>
                  <div className="flex items-center gap-2">
                    <RefreshCw size={14} className={showDiscovered ? (theme === 'light' ? 'text-white' : 'text-emerald-400') : (theme === 'light' ? 'text-gray-300' : 'text-white/20')} />
                    <span>Ground Intel</span>
                  </div>
                  <div className={`w-5 h-2.5 rounded-full relative transition-colors ${showDiscovered ? 'bg-emerald-500' : (theme === 'light' ? 'bg-gray-200' : 'bg-white/10')}`}>
                    <div className={`absolute top-0 w-2.5 h-2.5 rounded-full bg-white transition-all ${showDiscovered ? 'left-2.5' : 'left-0'}`} />
                  </div>
                </button>

                {userCoords && (
                  <button onClick={() => {
                    setAllIndiaMode(false);
                    setMapCenter(userCoords);
                    fetchGovData(userCoords.lat, userCoords.lng, false);
                  }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[0.65rem] font-bold border transition-all ${
                      theme === 'light' ? 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                    }`}>
                    <Navigation size={14} />
                    <span>My Location</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ═══ TRANSIT INTELLIGENCE (Directions Overlay) ═══ */}
          <AnimatePresence>
            {showDirections && travelInfo && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute top-4 right-4 z-[9999] flex flex-col gap-2 w-72"
              >
                <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${navError ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                        <Navigation size={16} />
                      </div>
                      <span className={`text-[0.65rem] font-black uppercase tracking-widest ${navError ? 'text-amber-400' : 'text-blue-400'}`}>
                        {navError ? 'Routing Restricted' : 'Tactical Route'}
                      </span>
                    </div>
                    <button onClick={() => { setShowDirections(false); setResponse(null); setNavError(null); }} className="text-white/40 hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  {navError ? (
                    <div className="space-y-4">
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                        <p className="text-[0.65rem] font-bold text-amber-200/80 leading-relaxed mb-3">
                          {navError}
                        </p>
                        <button 
                          onClick={() => openInExternalMaps()}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-black rounded-lg py-2 text-[0.7rem] font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <ExternalLink size={12} /> Open in Google Maps App
                        </button>
                      </div>
                      <p className="text-[0.55rem] text-white/30 italic px-1">
                        *Directions API not active for this key. External fallback provides full navigation features.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                          <div className="flex items-center gap-1.5 mb-1 opacity-40">
                            <Milestone size={10} />
                            <span className="text-[0.5rem] font-bold uppercase">Distance</span>
                          </div>
                          <div className="text-lg font-black text-white">{travelInfo?.distance}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                          <div className="flex items-center gap-1.5 mb-1 opacity-40">
                            <Clock size={10} />
                            <span className="text-[0.5rem] font-bold uppercase">Est. Time</span>
                          </div>
                          <div className="text-lg font-black text-emerald-400">{travelInfo?.duration}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[0.6rem] font-black text-white/30 uppercase tracking-wider flex items-center gap-1">
                            <List size={10} /> Navigation Steps
                          </span>
                          <span className="text-[0.5rem] font-bold text-blue-400">{travelInfo?.steps.length} turns</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                          {travelInfo?.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                              <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                                <span className="text-[0.6rem] font-bold">{idx + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[0.65rem] font-medium text-white/80 leading-relaxed" 
                                  dangerouslySetInnerHTML={{ __html: step.instructions }} 
                                />
                                <div className="flex items-center gap-2 mt-1 opacity-40">
                                  <span className="text-[0.55rem] font-bold">{step.distance.text}</span>
                                  <div className="w-1 h-1 rounded-full bg-white/20" />
                                  <span className="text-[0.55rem] font-bold">{step.duration.text}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoaded ? (
            <div className="w-full h-full relative">
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={zoom}
                zoomControl={false}
                style={{ width: '100%', height: '100%', background: '#020704' }}
              >
                <MapController
                  center={mapCenter}
                  zoom={zoom}
                  onViewStateChange={setViewState}
                  recenterCount={recenterCount}
                />
                
                <TileLayer
                  url={
                    activeLayer === 'satellite' || activeLayer === 'hybrid'
                      ? TILE_LAYERS.satellite
                      : theme === 'light'
                        ? TILE_LAYERS.roadmap_light
                        : TILE_LAYERS.roadmap_dark
                  }
                  attribution='&copy; ESRI, CartoDB'
                />
                
                {activeLayer === 'hybrid' && (
                  <TileLayer
                    url={TILE_LAYERS.labels}
                    attribution='&copy; CartoDB'
                  />
                )}

                {/* User Coords Marker */}
                {userCoords && typeof userCoords.lat === 'number' && !isNaN(userCoords.lat) && typeof userCoords.lng === 'number' && !isNaN(userCoords.lng) && (
                  <Marker
                    position={[userCoords.lat, userCoords.lng]}
                    icon={redIcon}
                  />
                )}

                {/* Mandi Markers */}
                {!showDirections && mandis.map((m, i) => (
                  <MandiMarker 
                    key={`gov-${i}`} 
                    m={m}
                    isSelected={selectedMandi === m}
                    onClick={() => handleMandiClick(m)}
                  />
                ))}

                {/* Nearby Markets (Discovered) Markers */}
                {!showDirections && showDiscovered && nearbyMarkets.map((m, i) => {
                  if (typeof m.lat !== 'number' || typeof m.lon !== 'number' || isNaN(m.lat) || isNaN(m.lon)) return null;
                  return (
                    <Marker
                      key={`disco-${i}`}
                      position={[m.lat, m.lon]}
                      icon={blueIcon}
                      eventHandlers={{
                        click: (e) => {
                          setSelectedMandi({
                            name: m.name,
                            city: m.vicinity || "Discovered",
                            lat: m.lat,
                            lon: m.lon,
                            type: 'discovered',
                            crops: 'Search results near this location'
                          });
                        }
                      }}
                    />
                  );
                })}

                {/* Directions Route Layer */}
                {showDirections && routeCoordinates.length > 0 && (
                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{
                      color: '#3b82f6',
                      weight: 6,
                      opacity: 0.8
                    }}
                  />
                )}



                {/* Street View Fallback Warning Overlay */}
                {activeLayer === 'streetview' && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    zIndex: 1000,
                    padding: 24,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem' }}>🌐</div>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 900 }}>Interactive Street View</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', maxWidth: 320 }}>
                      Street View is opened externally to protect your API quota. Click the button below to view 360° panorama.
                    </p>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${mapCenter.lat},${mapCenter.lng}`, '_blank')}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: '#fff',
                        borderRadius: 12,
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Open Street View 🚀
                    </button>
                  </div>
                )}
              </MapContainer>

              {/* Selected Mandi Info Card Overlay */}
              <AnimatePresence>
                {selectedMandi && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute bottom-16 left-4 z-[9999] p-4 rounded-2xl shadow-2xl backdrop-blur-xl border w-72 transition-all ${
                      theme === 'light'
                        ? 'bg-white/95 border-gray-200 text-slate-950 shadow-gray-200/50'
                        : 'bg-[#080d0a]/95 border-emerald-950/30 text-white shadow-black/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b pb-2 mb-2 border-slate-200/10">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base shrink-0 mt-0.5">🏪</div>
                        <div className="min-w-0">
                          <strong className="text-xs font-black block leading-tight truncate">{selectedMandi.name}</strong>
                          <span className="text-[0.6rem] font-bold text-slate-400 mt-0.5 block truncate">📍 {selectedMandi.city}</span>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedMandi(null); setShowDirections(false); setResponse(null); }} className="text-white/40 hover:text-white/80 transition-colors p-1 hover:bg-white/10 rounded-lg">
                        <X size={14} className={theme === 'light' ? 'text-slate-400 hover:text-slate-900' : 'text-white/40 hover:text-white'} />
                      </button>
                    </div>

                    <div className="space-y-1.5 py-1">
                      <div className="flex items-start justify-between text-[0.7rem] font-bold leading-normal">
                        <span className="opacity-75">Crops:</span>
                        <span className="text-right text-emerald-400">{selectedMandi.crops}</span>
                      </div>
                      
                      {selectedMandi.price_note && (
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[0.7rem] font-black text-emerald-400 text-center">
                          📊 {selectedMandi.price_note}
                        </div>
                      )}
                      
                      <div className={`text-[0.6rem] font-black py-1 rounded-lg text-center ${
                        selectedMandi.type === 'terminal' 
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                          : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                      }`}>
                        {selectedMandi.type === 'terminal' ? '⭐ Terminal Market' : '🏢 Wholesale Market'}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-2 border-t border-slate-200/10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleGetDirections(selectedMandi); }}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-[0.7rem] font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
                      >
                        <Navigation size={12} /> Road Route
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedMandi.lat},${selectedMandi.lon}&travelmode=driving`, '_blank'); }}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 shrink-0 ${
                          theme === 'light' ? 'bg-gray-100 border-gray-200 text-slate-700' : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                        }`}
                        title="Open in Google Maps App"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom Zoom Controls */}
              <div className="absolute bottom-4 right-4 z-[9999] flex flex-col gap-1.5">
                <button onClick={() => setIsExpanded(!isExpanded)}
                  className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white text-xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg lg:hidden" title="Toggle Fullscreen">
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(20, prev.zoom + 1) }))}
                  className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white text-xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg">+</button>
                <button onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(1, prev.zoom - 1) }))}
                  className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white text-xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg">−</button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-900">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
              <p className="text-white/40 font-bold text-sm">Initializing Google Maps Engine…</p>
            </div>
          )}


          {hasLocation && (
            <div className={`absolute bottom-5 left-5 z-[9999] backdrop-blur-xl border rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg transition-colors ${
              theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/60 border-white/10'
            }`}>
              <Navigation size={12} className="text-emerald-500" />
              <span className={`text-[0.6rem] font-bold ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        {/* ── RIGHT: MANDI SIDEBAR ── */}
        <aside
          style={{ height: window.innerWidth < 1024 ? sheetHeight : '100%' }}
          className={`w-full lg:w-96 flex-shrink-0 border-t lg:border-t-0 lg:border-l backdrop-blur-2xl overflow-y-auto z-10 relative rounded-t-[2rem] lg:rounded-none -mt-5 lg:mt-0 lg:shadow-none flex flex-col transition-all duration-300 ${
            theme === 'light' ? 'bg-white border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]' : 'bg-[#0a1a0d]/95 border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
          }`}>

          <div
            className={`w-full flex justify-center pt-3 pb-3 lg:hidden sticky top-0 z-20 rounded-t-[2rem] cursor-ns-resize touch-none ${theme === 'light' ? 'bg-white' : 'bg-[#0a1a0d]'}`}
            onPointerDown={handleDragStart}
          >
            <div className={`w-12 h-1.5 rounded-full ${theme === 'light' ? 'bg-gray-200' : 'bg-white/20'}`} />
          </div>

          <div className="p-5 pt-0 lg:pt-5 space-y-4 flex-1 overflow-y-auto no-scrollbar pb-10">

            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/20'}`} />
              <input type="text" placeholder="Search mandis, crops…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-sm transition-all font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  theme === 'light' ? 'bg-gray-50 border-gray-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500' : 'bg-white/[0.03] border-white/5 text-white placeholder-white/20 focus:border-emerald-500/30'
                }`} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className={`p-3 rounded-xl border text-center transition-colors ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-white/[0.03] border-white/5'}`}>
                <div className="text-xl font-black text-emerald-500">{mandis.length}</div>
                <div className={`text-[0.5rem] font-bold transition-colors ${theme === 'light' ? 'text-slate-500' : 'text-white/25'}`}>Mandis</div>
              </div>
              <div className={`p-3 rounded-xl border text-center transition-colors ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-white/[0.03] border-white/5'}`}>
                <div className="text-xl font-black text-blue-400">{mandis.filter(m => m.type === 'terminal').length}</div>
                <div className={`text-[0.5rem] font-bold transition-colors ${theme === 'light' ? 'text-slate-500' : 'text-white/25'}`}>Terminal</div>
              </div>
              <div className={`p-3 rounded-xl border text-center transition-colors ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-white/[0.03] border-white/5'}`}>
                <div className="text-xl font-black text-amber-400">{allIndiaMode ? 'All' : mandis.filter(m => m.type !== 'terminal').length}</div>
                <div className={`text-[0.5rem] font-bold transition-colors ${theme === 'light' ? 'text-slate-500' : 'text-white/25'}`}>{allIndiaMode ? 'States' : 'Wholesale'}</div>
              </div>
            </div>


            <AnimatePresence>
              {selectedMandi && (
                <motion.div
                  key="detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    theme === 'light' 
                      ? 'bg-emerald-50 border-emerald-100 shadow-sm' 
                      : 'bg-gradient-to-br from-emerald-900/30 via-emerald-800/15 to-transparent border-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.1)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border transition-colors ${
                        theme === 'light' ? 'bg-white border-emerald-100 shadow-sm' : 'bg-emerald-500/20 border-emerald-500/20'
                      }`}>🏪</div>
                      <div>
                        <h3 className={`text-sm font-black transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{selectedMandi.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className={`text-[0.65rem] font-bold transition-colors ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>{selectedMandi.city}</p>
                          {selectedMandi.is_accurate && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors ${
                              theme === 'light' ? 'bg-blue-50 border-blue-100' : 'bg-blue-500/10 border-blue-500/20'
                            }`}>
                              <CheckCircle size={8} className="text-blue-500" />
                              <span className="text-[0.5rem] font-black text-blue-500">Accurate</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedMandi(null); setShowDirections(false); setResponse(null); }} className={`p-1 transition-colors ${theme === 'light' ? 'text-gray-400 hover:text-slate-900' : 'text-white/20 hover:text-white/60'}`}>
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-3 rounded-xl border transition-colors ${theme === 'light' ? 'bg-white border-emerald-100' : 'bg-black/30 border-white/5'}`}>
                      <div className={`text-[0.5rem] font-bold mb-0.5 transition-colors ${theme === 'light' ? 'text-gray-400' : 'text-white/25'}`}>Type</div>
                      <span className={`text-xs font-black ${selectedMandi.type === 'terminal' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {selectedMandi.type === 'terminal' ? '⭐ Terminal' : '🏢 Wholesale'}
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border transition-colors ${theme === 'light' ? 'bg-white border-emerald-100' : 'bg-black/30 border-white/5'}`}>
                      <div className={`text-[0.5rem] font-bold mb-0.5 transition-colors ${theme === 'light' ? 'text-gray-400' : 'text-white/25'}`}>Transit Intel</div>
                      <button 
                        onClick={() => handleGetDirections()}
                        className="text-[0.6rem] font-black text-blue-400 flex items-center gap-1 hover:text-blue-300"
                      >
                        <Navigation size={10} /> View Route
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleGetDirections()}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-[0.7rem] font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <Navigation size={14} /> Navigate Now
                    </button>
                    <button 
                      onClick={() => openInExternalMaps()}
                      className={`flex items-center justify-center w-12 rounded-xl border transition-all hover:bg-white/5 active:scale-95 ${theme === 'light' ? 'border-emerald-200 text-slate-400' : 'border-white/5 text-white/40'}`}
                      title="Open in External Maps"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>

                  {travelInfo && showDirections && (
                    <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-[0.5rem] font-black text-blue-400/60 uppercase">Travel Details</div>
                        <span className="text-xs font-black text-blue-300">{travelInfo.distance} · {travelInfo.duration}</span>
                      </div>
                      <CheckCircle size={14} className="text-blue-400" />
                    </div>
                  )}

                  <div className={`p-3 rounded-xl border transition-colors ${theme === 'light' ? 'bg-white border-emerald-100' : 'bg-black/30 border-white/5'}`}>
                    <div className={`text-[0.5rem] font-bold mb-1 transition-colors ${theme === 'light' ? 'text-gray-400' : 'text-white/25'}`}>Crops Traded</div>
                    <div className="flex flex-wrap gap-1">
                      {(selectedMandi.crops || '').split(',').map((c, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded-md text-[0.6rem] font-bold border transition-colors ${
                          theme === 'light' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <h3 className={`text-[0.6rem] font-black flex items-center gap-1.5 transition-colors ${theme === 'light' ? 'text-slate-500' : 'text-white/20'}`}>
                <MapPin size={10} />
                {loadingMandis ? 'Connecting to Govt API…' : `${filteredMandis.length} Active Markets`}
              </h3>

              {loadingMandis ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="animate-spin text-emerald-500" size={28} />
                  <div className="space-y-1 text-center">
                    <p className="text-xs font-bold text-white/40 animate-pulse">Establishing Secure Connection…</p>
                    <p className="text-[0.6rem] text-white/20">Fetching live APMC data from govt servers</p>
                  </div>
                </div>
              ) : filteredMandis.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredMandis.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={() => handleMandiClick(m)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                        selectedMandi === m 
                          ? (theme === 'light' ? 'bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-500/10' : 'bg-emerald-500/10 border-emerald-500/30') 
                          : (theme === 'light' ? 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10')
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-colors ${
                        m.type === 'terminal' 
                          ? (theme === 'light' ? 'bg-amber-100 border border-amber-200 shadow-sm' : 'bg-amber-500/15 border border-amber-500/20') 
                          : (theme === 'light' ? 'bg-emerald-100 border border-emerald-200 shadow-sm' : 'bg-emerald-500/15 border border-emerald-500/20')
                      }`}>
                        {m.type === 'terminal' ? '⭐' : '🏪'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs font-bold truncate transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{m.name}</span>
                          <ChevronRight size={12} className={`flex-shrink-0 transition-colors ${theme === 'light' ? 'text-gray-300' : 'text-white/15'}`} />
                        </div>
                        <div className={`text-[0.6rem] font-medium truncate transition-colors ${theme === 'light' ? 'text-gray-500' : 'text-white/30'}`}>
                          {m.state ? `${m.state} · ` : ''} 📍 {m.city} · <span className={theme === 'light' ? 'text-gray-400' : 'text-white/20'}>🌾 {m.crops}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border mx-auto transition-colors ${
                    theme === 'light' ? 'bg-gray-50 border-gray-100 text-gray-300' : 'bg-white/[0.03] border-white/5 text-white/10'
                  }`}>
                    <MapPin size={20} />
                  </div>
                  <p className={`text-xs font-medium transition-colors ${theme === 'light' ? 'text-gray-500' : 'text-white/25'}`}>
                    {searchTerm ? 'No mandis match your search' : 'No mandis found nearby'}
                  </p>
                </div>
              )}
            </div>

            {/* Discovery Section */}
            <div className={`space-y-2 pt-2 border-t transition-colors ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-[0.6rem] font-black flex items-center gap-1.5 transition-colors ${theme === 'light' ? 'text-slate-500' : 'text-white/40'}`}>
                  <Search size={10} />
                  {selectedMandi ? 'Nearby Alternatives' : 'Discovery (Markets within 50km)'}
                </h4>
                {loadingNearby && <Loader2 size={10} className="animate-spin text-emerald-400" />}
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                {nearbyMarkets.length > 0 ? (
                  nearbyMarkets.map((m, idx) => (
                    <div
                      key={`disco-side-${idx}`}
                      onClick={() => {
                        const center = { lat: m.lat, lng: m.lon };
                        setMapCenter(center);
                        if (mapRef.current) {
                          mapRef.current.panTo(center);
                          mapRef.current.setZoom(14);
                        }
                        setSelectedMandi({
                          name: m.name,
                          city: m.vicinity || "Discovered",
                          lat: m.lat,
                          lon: m.lon,
                          type: 'discovered',
                          crops: 'Search results near this location'
                        });
                      }}
                      className={`group p-2.5 rounded-xl border cursor-pointer transition-all ${
                        theme === 'light' 
                          ? 'bg-white border-gray-100 hover:bg-emerald-50 hover:border-emerald-200' 
                          : 'bg-white/[0.03] hover:bg-emerald-500/10 border-white/5 hover:border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[0.6rem] transition-colors ${
                            theme === 'light' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'bg-blue-500/10 text-blue-400'
                          }`}>🏪</div>
                          <div className="min-w-0">
                            <p className={`text-[0.65rem] font-bold transition-colors truncate ${theme === 'light' ? 'text-slate-900 group-hover:text-emerald-700' : 'text-white group-hover:text-emerald-300'}`}>{m.name}</p>
                            <p className={`text-[0.5rem] font-bold truncate transition-colors ${theme === 'light' ? 'text-gray-500' : 'text-white/30'}`}>📍 {m.vicinity || "Nearby"}</p>
                          </div>
                        </div>
                        <ChevronRight size={10} className={`transition-all flex-shrink-0 ${theme === 'light' ? 'text-gray-200 group-hover:text-emerald-500' : 'text-white/10 group-hover:text-emerald-500 group-hover:translate-x-0.5'}`} />
                      </div>
                    </div>
                  ))
                ) : !loadingNearby && (
                  <div className={`text-center py-4 rounded-xl border border-dashed transition-colors ${
                    theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.02] border-white/5'
                  }`}>
                    <p className={`text-[0.55rem] font-bold transition-colors ${theme === 'light' ? 'text-gray-400' : 'text-white/20'}`}>Scanning vicinity for markets…</p>
                  </div>
                )}
              </div>
            </div>

            <div className={`pt-4 space-y-2 border-t transition-colors ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
              <h4 className={`text-[0.55rem] font-black transition-colors ${theme === 'light' ? 'text-gray-400' : 'text-white/20'}`}>Tactical Intelligence</h4>
              <p className={`text-[0.6rem] leading-relaxed transition-colors ${theme === 'light' ? 'text-gray-500' : 'text-white/30'}`}>
                APMC data sourced from <strong className={theme === 'light' ? 'text-gray-700' : 'text-white/50'}>Government of India</strong>.
                Transit intelligence powered by Google Directions API. Road conditions and traffic may affect estimated arrival times.
              </p>
            </div>
          </div>
        </aside>

      </div>
    </Wrapper>
  );
}
