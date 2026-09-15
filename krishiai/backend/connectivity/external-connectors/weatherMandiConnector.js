/**
 * external-connectors/weatherMandiConnector.js
 * -------------------------------------------------------------
 * Live telemetry connector for OpenWeatherMap and Agmarknet Mandi rates.
 * Streams real-time meteorological conditions and market price updates.
 */

import { domainBridge } from '../cross-domain/domainBridge.js';
import { universalClient } from '../api/universalClient.js';

export class WeatherMandiConnector {
  /**
   * Fetch real-time weather and forecast for farm location.
   */
  async fetchLiveWeather(latitude, longitude) {
    domainBridge.broadcast('WEATHER_QUERY_STARTED', { latitude, longitude }, 'weather');
    try {
      const data = await universalClient.get(`/api/v1/weather/current?lat=${latitude}&lon=${longitude}`);
      domainBridge.broadcast('WEATHER_DATA_RECEIVED', {
        latitude,
        longitude,
        tempC: data.temperature,
        humidity: data.humidity,
        condition: data.condition,
        timestamp: new Date().toISOString()
      }, 'weather');
      return data;
    } catch (err) {
      domainBridge.broadcast('WEATHER_QUERY_FAILED', { error: err.message }, 'weather');
      throw err;
    }
  }

  /**
   * Fetch live APMC mandi commodity prices.
   */
  async fetchMandiPrices(state = '', commodity = '') {
    domainBridge.broadcast('MANDI_PRICE_QUERY_STARTED', { state, commodity }, 'mandi');
    try {
      const data = await universalClient.get(`/api/v1/farmer/market/prices?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}`);
      domainBridge.broadcast('MANDI_PRICES_RECEIVED', {
        count: Array.isArray(data) ? data.length : 0,
        timestamp: new Date().toISOString()
      }, 'mandi');
      return data;
    } catch (err) {
      domainBridge.broadcast('MANDI_PRICE_QUERY_FAILED', { error: err.message }, 'mandi');
      throw err;
    }
  }
}

export const weatherMandiConnector = new WeatherMandiConnector();
export default weatherMandiConnector;
