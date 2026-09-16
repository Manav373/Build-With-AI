/**
 * KrishiAI IoT Day-by-Day Historical Telemetry Logger
 * Persists daily aggregated environmental and actuator logs.
 * Enables multi-day AI analysis (rain history, drying rate, fertilizer timing).
 */

const STORAGE_KEY_HISTORY = 'krishiai_daily_iot_history';

/**
 * Generate seed historical data if none exists
 */
function createInitialHistory() {
  const today = new Date();
  const history = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Label
    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Yesterday';
    else label = `${i} days ago`;

    // Simulate realistic historical rainfall and moisture trends
    // Day 2 was a rain event day for testing AI rain reasoning!
    const hadRain = i === 1; // It rained yesterday!
    const avgMoisture = hadRain ? 68 : Math.max(22, Math.min(65, 54 - (i * 4) + (hadRain ? 20 : 0)));
    const avgTemp = Number((27.5 + (i % 3) * 1.2).toFixed(1));
    const avgHum = hadRain ? 84 : Number((58 + (i % 2) * 5).toFixed(1));
    const pumpMinutes = hadRain ? 0 : (i === 3 ? 25 : (i === 5 ? 30 : 0));

    history.push({
      date: dateStr,
      label,
      daysAgo: i,
      moisture: avgMoisture,
      minMoisture: Math.max(18, avgMoisture - 6),
      maxMoisture: Math.min(85, avgMoisture + 8),
      temperature: avgTemp,
      humidity: avgHum,
      hadRain,
      rainfallMm: hadRain ? 18.5 : 0,
      pumpMinutes,
      status: hadRain ? 'RAIN_IRRIGATED' : (pumpMinutes > 0 ? 'PUMP_IRRIGATED' : 'NATURAL_DRYING')
    });
  }

  return history;
}

export function getDailyHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load IoT history:', e);
  }

  const initial = createInitialHistory();
  saveDailyHistory(initial);
  return initial;
}

export function saveDailyHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save IoT history:', e);
  }
}

/**
 * Update today's entry with live telemetry packet
 */
export function recordLiveTelemetry(liveTelemetry) {
  if (!liveTelemetry) return;
  const history = getDailyHistory();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayIndex = history.findIndex(item => item.date === todayStr || item.daysAgo === 0);
  const moisture = liveTelemetry.soilMoisture ?? 40;
  const temp = liveTelemetry.temperature ?? 28;
  const hum = liveTelemetry.humidity ?? 60;
  const isRaining = Boolean(liveTelemetry.rain);

  if (todayIndex >= 0) {
    const current = history[todayIndex];
    current.moisture = Number(((current.moisture * 0.8) + (moisture * 0.2)).toFixed(1));
    current.temperature = Number(((current.temperature * 0.8) + (temp * 0.2)).toFixed(1));
    current.humidity = Number(((current.humidity * 0.8) + (hum * 0.2)).toFixed(1));
    if (isRaining) {
      current.hadRain = true;
      current.rainfallMm = Math.max(current.rainfallMm || 0, 5.0);
    }
  } else {
    // Add today if date rolled over
    history.push({
      date: todayStr,
      label: 'Today',
      daysAgo: 0,
      moisture,
      minMoisture: moisture,
      maxMoisture: moisture,
      temperature: temp,
      humidity: hum,
      hadRain: isRaining,
      rainfallMm: isRaining ? 5.0 : 0,
      pumpMinutes: 0,
      status: isRaining ? 'RAIN_IRRIGATED' : 'NATURAL_DRYING'
    });
    if (history.length > 7) history.shift();
  }

  saveDailyHistory(history);
}

/**
 * Analysis query helpers for AI Agronomic Engine
 */
export function getYesterdayTelemetry() {
  const history = getDailyHistory();
  return history.find(item => item.daysAgo === 1) || null;
}

export function checkRecentRain(days = 2) {
  const history = getDailyHistory();
  const recentDays = history.filter(item => item.daysAgo > 0 && item.daysAgo <= days);
  const hadRain = recentDays.some(item => item.hadRain);
  const totalRainMm = recentDays.reduce((acc, item) => acc + (item.rainfallMm || 0), 0);

  return {
    hadRain,
    totalRainMm: Number(totalRainMm.toFixed(1)),
    daysChecked: days,
    yesterdayRained: history.some(item => item.daysAgo === 1 && item.hadRain)
  };
}
