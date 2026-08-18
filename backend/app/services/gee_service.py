import logging
try:
    import ee
except ImportError:
    ee = None

import os
import json
import time
from google.oauth2 import service_account
from datetime import datetime, timedelta

class GEEService:
    _initialized = False
    _initialization_error = False

    @classmethod
    def initialize(cls):
        if cls._initialized:
            return
        if ee is None:
            logging.getLogger("KrishiMCP").warning("[GEE] Earth Engine API (ee) package not present. GEE satellite features disabled.")
            cls._initialization_error = True
            return
        
        # Priority:
        # 1. GEE_SERVICE_ACCOUNT_JSON_CONTENT (Raw JSON string)
        # 2. GEE_SERVICE_ACCOUNT_JSON (File Path - used for Render Secret Files)
        # 3. /etc/secrets/gee_key.json (Standard Render secret path)
        json_content = os.getenv("GEE_SERVICE_ACCOUNT_JSON_CONTENT")
        json_path = os.getenv("GEE_SERVICE_ACCOUNT_JSON")
        render_secret = "/etc/secrets/gee_key.json"
        
        try:
            if json_content:
                print("[GEE] Initializing from environment JSON content...")
                info = json.loads(json_content)
                credentials = service_account.Credentials.from_service_account_info(
                    info, scopes=['https://www.googleapis.com/auth/earthengine'])
                project_id = info.get('project_id')
            else:
                # Check provided path or default render secret path
                key_path = None
                if json_path and os.path.exists(json_path):
                    key_path = json_path
                elif os.path.exists(render_secret):
                    key_path = render_secret
                
                if key_path:
                    print(f"[GEE] Initializing from path: {key_path}")
                    credentials = service_account.Credentials.from_service_account_file(
                        key_path, scopes=['https://www.googleapis.com/auth/earthengine'])
                    with open(key_path) as f:
                        project_id = json.load(f).get('project_id')
                else:
                    raise FileNotFoundError("No valid GEE credentials found in environment or secret files.")

            ee.Initialize(credentials=credentials, project=project_id)
            cls._initialized = True
            cls._initialization_error = False
            print(f"[GEE] Service Account Authenticated and Initialized (Project: {project_id}).")
        except Exception as e:
            cls._initialization_error = True
            print(f"[GEE] Initialization FAILED: {e}")
            print("[GEE] Falling back to MOCK MODE for satellite data.")

    _cache = {}
    _cache_ttl = 900 # 15 minutes

    @staticmethod
    def get_all_satellite_data(lat: float, lon: float):
        """
        ULTRA-PERFORMANCE Method: Targeted for <10s response.
        - Cache (15m TTL)
        - Fast Sampling (Scale 250)
        - TOA Dataset
        """
        GEEService.initialize()
        
        # 0. Check Mock Mode (Fallback for local dev / missing keys)
        if GEEService._initialization_error:
            return {
                "ndvi": 0.684,
                "moisture": 0.245,
                "history": [
                    {"dt": int(time.time()) - 86400 * 30, "ndvi": 0.52},
                    {"dt": int(time.time()) - 86400 * 15, "ndvi": 0.61},
                    {"dt": int(time.time()), "ndvi": 0.684}
                ],
                "preview_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=320&h=320&auto=format&fit=crop",
                "is_mock": True
            }

        # 1. Check Cache (Fastest: 0s)

        point = ee.Geometry.Point([lon, lat])
        cache_key = f"{round(lat, 3)}_{round(lon, 3)}"
        end_date = datetime.now()
        start_date = end_date - timedelta(days=60)

        # 0b. Check Cache before hitting GEE (Fastest: 0s)
        cached = GEEService._cache.get(cache_key)
        if cached and (time.time() - cached['time']) < GEEService._cache_ttl:
            print(f"[GEE] Cache hit for {cache_key}")
            return cached['data']

        # 1. Faster Collection (TOA)
        # Limit to 4 images for absolute speed
        history_col = (ee.ImageCollection("COPERNICUS/S2_HARMONIZED")
                       .filterBounds(point)
                       .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                       .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 25))
                       .sort('system:time_start', False)
                       .limit(4))

        # 2. Server-side History Aggregation (Most Robust)
        # We wrap in a Dictionary to return all at once
        combined_query = ee.Dictionary({
            'history': history_col.map(lambda img: ee.Feature(None, {
                'dt': img.date().format('YYYY-MM-DD'),
                'v': img.normalizedDifference(['B8', 'B4']).reduceRegion(reducer=ee.Reducer.mean(), geometry=point, scale=100).get('nd')
            })).reduceColumns(ee.Reducer.toList(2), ['dt', 'v']).get('list'),
            'latest_img_exists': history_col.size().gt(0),
            'smap': ee.ImageCollection("NASA/SMAP/SPL4SMGP/008").filterBounds(point).sort('system:time_start', False).first().reduceRegion(reducer=ee.Reducer.mean(), geometry=point, scale=11000)
        })

        try:
            print(f"[GEE] Ultra-Batch request started for ({lat}, {lon})...")
            res = combined_query.getInfo()
            
            # Format History
            history_data = []
            latest_ndvi = 0.5
            raw_history = res.get('history', [])
            
            if raw_history:
                for item in raw_history:
                    # item is [date, val]
                    d_str, v_val = item[0], item[1]
                    if v_val is not None:
                        try:
                            history_data.append({
                                "dt": int(datetime.strptime(str(d_str)[:10], '%Y-%m-%d').timestamp()),
                                "ndvi": round(v_val, 3)
                            })
                        except: pass
            
            if history_data:
                # Latest from history is sorted by sort() in col
                history_data = sorted(history_data, key=lambda x: x['dt'])
                latest_ndvi = history_data[-1]['ndvi']

            # Extract Moisture
            moisture = res.get('smap', {}).get('sm_surface', 0.22)
            
            # Get Thumbnail URL separately (very fast meta-call)
            preview_url = None
            if res.get('latest_img_exists'):
                img = history_col.first()
                # Fast Thumbnail
                preview_url = img.getThumbURL({
                    'dimensions': '320x320',
                    'format': 'png',
                    'region': point.buffer(600).bounds(),
                    'bands': ['B4', 'B3', 'B2'],
                    'min': 0, 'max': 3000, 'gamma': 1.4
                })

            data = {
                "ndvi": round(latest_ndvi, 3),
                "moisture": round(moisture, 3),
                "history": history_data,
                "preview_url": preview_url
            }
            
            # Store in Cache
            GEEService._cache[cache_key] = {'time': time.time(), 'data': data}
            return data

        except Exception as e:
            print(f"[GEE] Ultra-Batch error: {e}")
            return {"ndvi": 0.5, "moisture": 0.2, "history": [], "preview_url": None, "error": str(e)}

    @staticmethod
    def get_blink_ndvi(lat: float, lon: float):
        """
        FASTEST PATH: Current Crop Health Only. Target < 2s.
        - Sentinel-2 TOA
        - No History, No SMAP, No Thumbnail.
        """
        GEEService.initialize()
        if GEEService._initialization_error:
            return {"ndvi": 0.684, "is_mock": True}

        point = ee.Geometry.Point([lon, lat])
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        col = (ee.ImageCollection("COPERNICUS/S2_HARMONIZED")
               .filterBounds(point)
               .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
               .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
               .sort('system:time_start', False)
               .limit(1))

        img = col.first()

        # NDVI Calculation (Server side)
        ndvi = img.normalizedDifference(['B8', 'B4']).rename('ndvi')
        
        # Fast point reduction
        stats = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=point.buffer(30).bounds(),
            scale=10
        ).getInfo()
        
        val = stats.get('ndvi', 0.6)
        return {"ndvi": round(val, 3)}

    @staticmethod
    def get_ndvi_data(lat: float, lon: float, days_back: int = 30):
        # Legacy method (kept for compatibility)
        res = GEEService.get_all_satellite_data(lat, lon)
        return {"current": res['ndvi'], "history": res['history']}

    @staticmethod
    def get_soil_moisture(lat: float, lon: float):
        # Legacy method (kept for compatibility)
        res = GEEService.get_all_satellite_data(lat, lon)
        return res['moisture']

    @staticmethod
    def get_preview_url(lat: float, lon: float):
        # Legacy method (kept for compatibility)
        res = GEEService.get_all_satellite_data(lat, lon)
        return res['preview_url']

# Singleton instance for easy access
gee_service = GEEService()
