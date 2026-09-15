/**
 * external-connectors/satelliteGeeConnector.js
 * -------------------------------------------------------------
 * Google Earth Engine (GEE) and Sentinel-2 satellite imagery streaming connector.
 * Provides live tile streaming, NDVI calculation feeds, and cloud-masking telemetry.
 */

import { domainBridge } from '../cross-domain/domainBridge.js';
import { universalClient } from '../api/universalClient.js';

export class SatelliteGeeConnector {
  constructor() {
    this.activeFarmBounds = null;
  }

  /**
   * Request NDVI indices and tile URL for a farm coordinate polygon.
   */
  async fetchNdviTiles(latitude, longitude, dateRange = { days: 30 }) {
    domainBridge.broadcast('SATELLITE_QUERY_STARTED', { latitude, longitude, dateRange }, 'gee');

    try {
      const data = await universalClient.post('/api/v1/farmer/satellite/ndvi', {
        latitude,
        longitude,
        days: dateRange.days
      });

      domainBridge.broadcast('SATELLITE_TILES_RECEIVED', {
        latitude,
        longitude,
        ndviMean: data.ndvi_mean,
        healthRating: data.health_rating,
        tileUrl: data.tile_url,
        timestamp: new Date().toISOString()
      }, 'gee');

      return data;
    } catch (err) {
      domainBridge.broadcast('SATELLITE_QUERY_FAILED', {
        latitude,
        longitude,
        error: err.message
      }, 'gee');
      throw err;
    }
  }
}

export const satelliteConnector = new SatelliteGeeConnector();
export default satelliteConnector;
