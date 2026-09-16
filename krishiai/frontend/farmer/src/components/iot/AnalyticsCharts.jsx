import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { LineChart as ChartIcon, Calendar, Filter, Sparkles, RefreshCw } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsCharts({ deviceId = 'krishiai-node-01' }) {
  const [range, setRange] = useState('24h');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateFallbackData = (selectedRange) => {
    const points = selectedRange === '1h' ? 12 : selectedRange === '6h' ? 18 : 24;
    const now = Date.now();
    const interval = selectedRange === '1h' ? 5 * 60 * 1000 : selectedRange === '6h' ? 20 * 60 * 1000 : 60 * 60 * 1000;
    const mock = [];
    for (let i = points - 1; i >= 0; i--) {
      const t = new Date(now - i * interval);
      const hour = t.getHours();
      const baseMoisture = 48 + Math.sin(i / 3) * 14;
      const baseTemp = 24 + Math.sin((hour - 8) / 4) * 7;
      const baseHum = 75 - Math.sin((hour - 8) / 4) * 15;
      const isPumpOn = (i === 4 || i === 5 || i === 12);
      const isRain = (i === 18);
      mock.push({
        timestamp: t.toISOString(),
        soilMoisture: Math.round(baseMoisture),
        temperature: parseFloat(baseTemp.toFixed(1)),
        humidity: Math.round(baseHum),
        pump: isPumpOn,
        rain: isRain
      });
    }
    return mock;
  };

  const fetchHistory = async (selectedRange) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/devices/${deviceId}/history?range=${selectedRange}`);
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setHistoryData(data.data);
      } else {
        setHistoryData(generateFallbackData(selectedRange));
      }
    } catch (err) {
      setHistoryData(generateFallbackData(selectedRange));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(range);
  }, [range, deviceId]);

  // Format labels based on time
  const labels = historyData.map((pt) => {
    const d = new Date(pt.timestamp);
    if (range === '1h' || range === '6h' || range === '24h') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
  });

  // Chart 1: Soil Moisture %
  const soilChartData = {
    labels,
    datasets: [
      {
        label: 'Soil Moisture (%)',
        data: historyData.map((d) => d.soilMoisture),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: historyData.length > 50 ? 0 : 3,
        pointHoverRadius: 6
      }
    ]
  };

  // Chart 2: Temperature & Humidity Dual-Axis
  const tempHumData = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: historyData.map((d) => d.temperature),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        yAxisID: 'yTemp',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: historyData.length > 50 ? 0 : 3
      },
      {
        label: 'Humidity (%)',
        data: historyData.map((d) => d.humidity),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        yAxisID: 'yHum',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: historyData.length > 50 ? 0 : 3
      }
    ]
  };

  // Chart 3: Rain Events & Pump Activations
  const rainPumpData = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Rain Detected',
        data: historyData.map((d) => (d.rain ? 1 : 0)),
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderColor: '#818cf8',
        borderWidth: 1,
        yAxisID: 'yBinary'
      },
      {
        type: 'line',
        label: 'Pump ON Event',
        data: historyData.map((d) => (d.pump ? 1 : 0)),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 2,
        stepped: true,
        fill: true,
        yAxisID: 'yBinary'
      }
    ]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Outfit', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(12, 21, 36, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', maxTicksLimit: 10, font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 11 } },
        min: 0,
        max: 100
      }
    }
  };

  const dualAxisOptions = {
    ...commonOptions,
    scales: {
      x: commonOptions.scales.x,
      yTemp: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#fbbf24', callback: (v) => `${v}°C` },
        min: 15,
        max: 45
      },
      yHum: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#38bdf8', callback: (v) => `${v}%` },
        min: 20,
        max: 100
      }
    }
  };

  const binaryOptions = {
    ...commonOptions,
    scales: {
      x: commonOptions.scales.x,
      yBinary: {
        ticks: {
          stepSize: 1,
          callback: (v) => (v === 1 ? 'ACTIVE' : 'OFF'),
          color: '#64748b'
        },
        min: 0,
        max: 1.2
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Time Range Selector Bar (PRD Section 19: 1h, 6h, 24h, 7d, 30d) */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Calendar size={18} color="var(--emerald-400)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
            Telemetry Analytics Range:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: '1h', label: '1 Hour' },
            { id: '6h', label: '6 Hours' },
            { id: '24h', label: '24 Hours' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' }
          ].map((r) => (
            <button
              key={r.id}
              id={`btn-range-${r.id}`}
              className={`btn-secondary ${range === r.id ? 'active' : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                borderColor: range === r.id ? 'var(--emerald-500)' : 'var(--border-subtle)',
                background: range === r.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: range === r.id ? 'var(--emerald-400)' : 'var(--text-secondary)',
                fontWeight: 600
              }}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}

          <button 
            id="btn-refresh-history"
            className="btn-secondary" 
            onClick={() => fetchHistory(range)}
            title="Refresh Charts"
            style={{ padding: '0.4rem 0.65rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Chart 1: Soil Moisture */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem' }}>🌱 Soil Moisture Dynamics (%)</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Target thresholds: Dry (&lt;25%) • Optimal (40-69%) • Wet (&gt;70%)
            </div>
          </div>
          <span className="meta-pill font-mono" style={{ fontSize: '0.75rem' }}>
            {historyData.length} data points
          </span>
        </div>

        <div style={{ height: '280px', width: '100%' }}>
          <Line data={soilChartData} options={commonOptions} />
        </div>
      </div>

      {/* Chart 2: Temperature & Humidity */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem' }}>🌡️ Ambient Temperature & Relative Humidity</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              DHT11 Sensor trends: Diurnal ambient temperature curve vs humidity
            </div>
          </div>
        </div>

        <div style={{ height: '280px', width: '100%' }}>
          <Line data={tempHumData} options={dualAxisOptions} />
        </div>
      </div>

      {/* Chart 3: Rain Events & Irrigation Sessions */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem' }}>🌧️ Precipitation Events & Pump Duty Cycles</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Correlation between natural rain detection and relay activation sessions
            </div>
          </div>
        </div>

        <div style={{ height: '220px', width: '100%' }}>
          <Bar data={rainPumpData} options={binaryOptions} />
        </div>
      </div>
    </div>
  );
}
