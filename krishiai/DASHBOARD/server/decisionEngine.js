export class DecisionEngine {
  static evaluate(telemetry, device) {
    const soil = telemetry.soilMoisture;
    const rain = telemetry.rain;
    const settings = device.settings || {
      veryDryThreshold: 24,
      dryThreshold: 39,
      goodThreshold: 69
    };

    let status = 'MONITOR';
    let title = 'NO IRRIGATION REQUIRED';
    let recommendation = 'Soil moisture is currently adequate.';
    let badgeColor = 'emerald';
    let reason = `Soil moisture: ${soil}%, Rain: Not detected.`;
    let shouldAutoIrrigate = false;

    if (rain) {
      status = 'WAIT_RAIN';
      title = '🌧 WAIT — RAIN DETECTED';
      recommendation = 'Hold irrigation. Rain precipitation detected in field.';
      badgeColor = 'blue';
      reason = 'Rain detected by FC-37 sensor. Automatic irrigation paused to prevent root waterlogging.';
      shouldAutoIrrigate = false;
    } else if (soil <= settings.veryDryThreshold) {
      status = 'IRRIGATION_RECOMMENDED';
      title = '💧 IRRIGATION RECOMMENDED';
      recommendation = 'Start irrigation immediately. Soil moisture is critically low.';
      badgeColor = 'rose';
      reason = `Soil moisture is ${soil}% (below critical threshold of ${settings.veryDryThreshold}%). Rain: Not detected.`;
      shouldAutoIrrigate = true;
    } else if (soil <= settings.dryThreshold) {
      status = 'IRRIGATION_RECOMMENDED';
      title = '💧 IRRIGATION RECOMMENDED';
      recommendation = 'Irrigation advised. Field is entering dry condition.';
      badgeColor = 'amber';
      reason = `Soil moisture is ${soil}% (below optimal band of 40%). Rain: Not detected.`;
      shouldAutoIrrigate = true;
    } else if (soil >= settings.goodThreshold) {
      status = 'NO_WATER_REQUIRED';
      title = '⛔ NO IRRIGATION REQUIRED';
      recommendation = 'Field is well-watered / saturated.';
      badgeColor = 'cyan';
      reason = `Soil moisture is ${soil}% (high moisture level). Adequate soil water reserves present.`;
      shouldAutoIrrigate = false;
    } else {
      status = 'NO_WATER_REQUIRED';
      title = '⛔ IRRIGATION NOT REQUIRED';
      recommendation = 'Maintain regular monitoring. Optimal field condition.';
      badgeColor = 'emerald';
      reason = `Soil moisture is ${soil}% (within healthy 40–69% band). Temperature is ${telemetry.temperature}°C.`;
      shouldAutoIrrigate = false;
    }

    // Sense -> Understand -> Decide -> Act -> Learn layer (PRD Philosophy)
    const sense = {
      soilText: `Soil moisture: ${soil}% (ADC: ${telemetry.soilRaw || 2450})`,
      rainText: rain ? 'Rain DETECTED (FC-37 Active)' : 'Rain NOT detected',
      envText: `Temp: ${telemetry.temperature}°C | Humidity: ${telemetry.humidity}% | Light: ${telemetry.light ? 'DAY ☀️' : 'DARK 🌙'}`
    };

    let understand = '';
    if (rain) {
      understand = 'Rain sensor indicates precipitation. Natural rainfall supplies required water.';
    } else if (soil <= settings.veryDryThreshold) {
      understand = 'Severe soil drought tension detected. Transpiration demand exceeds current soil capillary supply.';
    } else if (soil <= settings.dryThreshold) {
      understand = 'Soil moisture is approaching depletion boundary. Root uptake efficiency is beginning to drop.';
    } else if (soil >= settings.goodThreshold) {
      understand = 'Field capacity is near saturation. Any additional water may cause runoff or anaerobic root stress.';
    } else {
      understand = 'Soil moisture tension is in the optimal vegetative growth zone. Transpiration is balanced.';
    }

    let decide = '';
    if (rain) {
      decide = 'Inhibit relay output. Postpone scheduled irrigation runs until soil dries post-rain.';
    } else if (shouldAutoIrrigate) {
      decide = device.mode === 'AUTO' 
        ? 'Engage irrigation pump relay for regulated 5-15 min cycle with safety runtime cutoff.' 
        : 'Recommend immediate manual pump activation to operator.';
    } else {
      decide = 'Standby mode. Maintain relay in de-energized (OFF) state.';
    }

    const act = telemetry.pump 
      ? 'Relay GPIO 26 is ACTIVE (Pump ON). Continuous safety countdown active.' 
      : 'Relay GPIO 26 is INACTIVE (Pump OFF).';

    // Estimating drying velocity
    const dryingHours = soil > settings.dryThreshold 
      ? Math.max(1, Math.round((soil - settings.dryThreshold) / 2.2)) 
      : 0;

    const learn = `Estimated drying rate: ~2.1%/hr. ${dryingHours > 0 ? `Expected dry condition in ~${dryingHours} hrs.` : 'Moisture threshold currently triggered.'}`;

    return {
      status,
      title,
      recommendation,
      badgeColor,
      reason,
      shouldAutoIrrigate,
      sense,
      understand,
      decide,
      act,
      learn,
      dryingHours
    };
  }
}
