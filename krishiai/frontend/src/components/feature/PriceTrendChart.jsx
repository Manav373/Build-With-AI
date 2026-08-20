import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, X, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { getMarketTrends } from '../../services/api';

const COLORS = ['#4ade80', '#86efac', '#fbbf24', '#f87171', '#60a5fa', '#c084fc', '#fb923c'];

const AVAILABLE_CROPS = ['wheat', 'rice', 'maize', 'soybean', 'mustard', 'cotton', 'gram'];

export default function PriceTrendChart({ onClose }) {
  const { getToken } = useAuth();
  const [selectedCrops, setSelectedCrops] = useState(['wheat', 'rice', 'maize']);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live day-by-day market prices from the backend
    const fetchData = async () => {
      try {
        const token = await getToken();
        const data = await getMarketTrends(token);
        if (data) {
          setChartData(data.trends || []);
        }
      } catch (err) {
        console.error("Failed to fetch market trends:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCrop = (crop) => {
    setSelectedCrops(prev =>
      prev.includes(crop)
        ? prev.filter(c => c !== crop)
        : prev.length < 4 ? [...prev, crop] : prev
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-[720px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(8,18,11,0.97)',
          border: '1px solid rgba(134,239,172,0.2)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          maxHeight: '90vh', overflow: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-5 border-b border-[#86efac]/10 shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(22,101,52,0.5),rgba(15,40,22,0.7))' }}>
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-[#4ade80]" />
            <div>
              <div className="text-white font-bold text-[1rem]">Live Mandi Prices</div>
              <div className="text-[0.72rem] text-[#86efac]/60">Daily Market Price (₹/quintal) • Last 7 Days</div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#86efac]/50 hover:text-white cursor-pointer p-1">
            <X size={18} />
          </button>
        </div>

        {/* Crop selector */}
        <div className="flex flex-wrap gap-2 p-4">
          {AVAILABLE_CROPS.map((crop, i) => (
            <motion.button
              key={crop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleCrop(crop)}
              className={`px-3 py-1.5 rounded-full text-[0.78rem] font-medium border cursor-pointer capitalize transition-all ${
                selectedCrops.includes(crop)
                  ? 'border-[#4ade80]/60 text-white'
                  : 'border-[#86efac]/15 text-[#86efac]/40 hover:text-[#86efac]'
              }`}
              style={selectedCrops.includes(crop) ? { background: `${COLORS[i % COLORS.length]}20` } : {}}
            >
              {crop}
            </motion.button>
          ))}
          <span className="text-[0.7rem] text-[#86efac]/30 self-center ml-1">Select up to 4</span>
        </div>

        {/* Chart */}
        <div className="px-2 sm:px-4 pb-4 sm:pb-6 h-[320px] sm:h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-[#86efac]/50 gap-4">
              <Loader2 size={32} className="animate-spin text-[#4ade80]" />
              <div className="animate-pulse text-sm">Fetching live day-by-day government Data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(134,239,172,0.08)" />
                <XAxis dataKey="date" stroke="#7aad86" tick={{ fontSize: 12 }} />
                <YAxis stroke="#7aad86" tick={{ fontSize: 11 }}
                  tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(8,18,11,0.95)', border: '1px solid rgba(134,239,172,0.3)',
                  borderRadius: '0.75rem', color: '#86efac', fontSize: '0.82rem'
                }}
                formatter={(val, name) => [`₹${val.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Legend wrapperStyle={{ color: '#86efac', fontSize: '0.8rem', paddingTop: '8px' }} />
              {selectedCrops.map((crop, i) => (
                <Line key={crop} type="monotone" dataKey={crop}
                  stroke={COLORS[i % COLORS.length]} strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS[i % COLORS.length] }}
                  activeDot={{ r: 6 }} />
              ))}
              </LineChart>
            </ResponsiveContainer>
          )}
          <p className="text-center text-[0.68rem] text-[#86efac]/30 mt-2">
            Source: live day-by-day government Mandi data • data.gov.in / e-NAM
          </p>
        </div>
      </div>
    </motion.div>
  );
}
