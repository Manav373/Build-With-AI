export class DecisionEngine {
  static evaluate(telemetry, device = {}) {
    if (!telemetry) return null;

    const soil = Number(telemetry.soilMoisture ?? telemetry.moisture ?? 50);
    const rain = Boolean(telemetry.rain);
    const settings = device?.settings || {
      veryDryThreshold: 24,
      dryThreshold: 39,
      goodThreshold: 69
    };

    let status = 'MONITOR';
    let headline = 'NO IRRIGATION REQUIRED';
    let recommendation = 'Soil moisture is currently adequate.';
    let color = 'emerald';
    let reason = `Soil moisture: ${soil}%, Rain: Not detected.`;
    let shouldAutoIrrigate = false;
    let ruleFired = 'RULE-05-EQUILIBRIUM';
    let confidence = 94;

    if (rain) {
      status = 'WAIT_RAIN';
      headline = '🌧 HOLD — PRECIPITATION DETECTED';
      recommendation = 'Hold irrigation. Precipitation detected in field.';
      color = 'sky';
      reason = 'Rain detected by FC-37 sensor. Irrigation locked out to prevent root waterlogging.';
      shouldAutoIrrigate = false;
      ruleFired = 'RULE-01-RAIN-INTERLOCK';
      confidence = 99;
    } else if (soil <= settings.veryDryThreshold) {
      status = 'IRRIGATION_RECOMMENDED';
      headline = '🚨 IMMEDIATE IRRIGATION REQUIRED';
      recommendation = 'Activate irrigation immediately. Severe soil moisture deficit.';
      color = 'rose';
      reason = `Soil moisture is ${soil}% (below critical threshold of ${settings.veryDryThreshold}%).`;
      shouldAutoIrrigate = true;
      ruleFired = 'RULE-02-CRITICAL-DROUGHT';
      confidence = 98;
    } else if (soil <= settings.dryThreshold) {
      status = 'IRRIGATION_RECOMMENDED';
      headline = '💧 IRRIGATION RECOMMENDED';
      recommendation = 'Irrigation advised. Field is entering dry condition.';
      color = 'amber';
      reason = `Soil moisture is ${soil}% (below optimal band of 40%).`;
      shouldAutoIrrigate = true;
      ruleFired = 'RULE-03-DRY-BOUNDARY';
      confidence = 92;
    } else if (soil >= settings.goodThreshold) {
      status = 'NO_WATER_REQUIRED';
      headline = '⛔ NO WATER REQUIRED (SATURATED)';
      recommendation = 'Field is well-watered / saturated.';
      color = 'cyan';
      reason = `Soil moisture is ${soil}%. Adequate soil water reserves present.`;
      shouldAutoIrrigate = false;
      ruleFired = 'RULE-04-SATURATION';
      confidence = 96;
    } else {
      status = 'NO_WATER_REQUIRED';
      headline = '🌾 OPTIMAL SOIL MOISTURE';
      recommendation = 'Maintain regular monitoring. Optimal field condition.';
      color = 'emerald';
      reason = `Soil moisture is ${soil}% (within healthy 40–69% band). Temperature is ${telemetry.temperature || 28}°C.`;
      shouldAutoIrrigate = false;
      ruleFired = 'RULE-05-EQUILIBRIUM';
      confidence = 95;
    }

    const sense = {
      soilText: `Soil moisture: ${soil}% (ADC: ${telemetry.soilRaw || 2450})`,
      rainText: rain ? 'Rain DETECTED (FC-37 Active)' : 'Rain NOT detected',
      envText: `Temp: ${telemetry.temperature || 28}°C | Humidity: ${telemetry.humidity || 60}% | Light: ${telemetry.light ? 'DAY ☀️' : 'DARK 🌙'}`
    };

    let understand = '';
    if (rain) {
      understand = 'Rain sensor indicates precipitation. Natural rainfall supplies required water.';
    } else if (soil <= settings.veryDryThreshold) {
      understand = 'Severe soil drought tension detected. Transpiration demand exceeds capillary supply.';
    } else if (soil <= settings.dryThreshold) {
      understand = 'Soil moisture is approaching depletion boundary. Root uptake efficiency is dropping.';
    } else if (soil >= settings.goodThreshold) {
      understand = 'Field capacity is near saturation. Any additional water may cause root suffocation.';
    } else {
      understand = 'Soil moisture tension is in the optimal vegetative growth zone. Transpiration is balanced.';
    }

    const decide = `Evaluated: ${status}. Action: ${shouldAutoIrrigate ? 'ACTUATE_RELAY' : 'STANDBY'}. Trigger: ${ruleFired}`;
    const act = shouldAutoIrrigate
      ? `Signal GPIO 26 Relay ON for max ${device?.settings?.autoMaxDurationMinutes || 15} mins.`
      : 'Keep GPIO 26 Relay de-energized (Standby).';
    const learn = `Drying rate est: ~1.8%/hr. Next critical threshold estimated in ~${Math.max(1, Math.round((soil - 25) / 1.8))} hours.`;

    return {
      status,
      headline,
      color,
      reasoning: reason,
      explanation: understand,
      confidence,
      recommendedAction: recommendation,
      waterRequirementScore: Math.max(0, Math.min(100, Math.round((70 - soil) * 1.5))),
      evapoTranspirationRate: `${((telemetry.temperature || 28) * 0.12).toFixed(1)} mm/day`,
      ruleFired,
      shouldAutoIrrigate,
      stages: {
        sense,
        understand,
        decide,
        act,
        learn
      }
    };
  }
}
