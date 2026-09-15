import json
import os
import httpx
from typing import Optional, Dict, Any

# Path to our district database
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "mlData.json")

# Popular village → district mapping for village search
VILLAGE_TO_DISTRICT = {
  "Baramati": "Pune", "Wai": "Satara", "Mahabaleshwar": "Satara",
  "Alibag": "Raigad", "Panvel": "Raigad", "Lonavala": "Pune",
  "Shirdi": "Ahmednagar", "Igatpuri": "Nashik", "Yeola": "Nashik",
  "Amreli Town": "Amreli", "Rajkot Rural": "Rajkot",
  "Anand Town": "Anand", "Nadiad": "Kheda",
  "Ludhiana Rural": "Ludhiana", "Moga Town": "Moga",
  "Phagwara": "Kapurthala", "Pathankot Town": "Pathankot",
  "Dharamsala": "Kangra", "Palampur": "Kangra",
  "Manali": "Kullu", "Kasol": "Kullu",
  "Raebareli Town": "Rae Bareli", "Unnao Town": "Unnao",
  "Bahraich Town": "Bahraich",
  "Wardha Town": "Wardha", "Yavatmal Town": "Yavatmal",
  "Buldhana Town": "Buldhana",
  "Bellary Town": "Bellary", "Hubli": "Dharwad",
  "Hassan Town": "Hassan", "Mandya Town": "Mandya",
  "Alappuzha Town": "Alappuzha", "Kottayam Town": "Kottayam",
  "Thrissur Town": "Thrissur", "Palakkad Town": "Palakkad",
  "Nagercoil": "Kanniyakumari", "Tirunelveli Town": "Tirunelveli",
  "Dindigul Town": "Dindigul",
}

class LocationService:
    def __init__(self):
        self.districts = []
        self._load_data()

    def _load_data(self):
        try:
            with open(DATA_PATH, "r") as f:
                data = json.load(f)
                self.districts = data.get("districts", [])
        except Exception as e:
            print(f"Error loading mlData.json in backend: {json.dumps(str(e))}")

    def fuzzy_match_district(self, place_name: str) -> Optional[str]:
        if not place_name:
            return None
        
        lc = place_name.lower().strip()
        
        # 1. Exact match
        for d in self.districts:
            if d.lower() == lc:
                return d
        
        # 2. Village mapping
        for v, dist in VILLAGE_TO_DISTRICT.items():
            if v.lower() == lc:
                return dist

        # 3. Partial match
        for d in self.districts:
            dl = d.lower()
            if dl in lc or lc in dl:
                return d
        
        # 4. Word match
        words = lc.split()
        for d in self.districts:
            dl = d.lower()
            for w in words:
                if len(w) > 4 and w in dl:
                    return d
                    
        return None

    async def resolve_from_coords(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        try:
            # Call Nominatim (OpenStreetMap)
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&addressdetails=1"
            headers = {"User-Agent": "KrishiAI-Backend-Location-Resolver/1.1"}
            async with httpx.AsyncClient() as client:
                res = await client.get(url, headers=headers, timeout=8.0)
                if res.status_code != 200:
                    return None
                
                data = res.json()
                addr = data.get("address", {})
                
                village = addr.get("village") or addr.get("suburb") or addr.get("neighbourhood")
                taluka = addr.get("subdistrict") or addr.get("tehsil") or addr.get("taluka")
                district = addr.get("district") or addr.get("county") or addr.get("state_district")
                city = addr.get("city") or addr.get("town") or district or "Unknown"
                state = addr.get("state", "Unknown")
                pincode = addr.get("postcode")

                # Match district against our internal list for validation
                matched_district = self.fuzzy_match_district(district or city)
                
                return {
                    "village": village,
                    "taluka": taluka,
                    "district": matched_district or district,
                    "city": city,
                    "state": state,
                    "pincode": pincode,
                    "lat": lat,
                    "lon": lon,
                    "method": "gps",
                    "display_name": data.get("display_name")
                }
            return None
        except Exception as e:
            print(f"Backend resolve_from_coords error: {e}")
            return None

    async def resolve_from_ip(self, ip: str) -> Optional[Dict[str, Any]]:
        try:
            # Use ipapi.co
            url = f"https://ipapi.co/{ip}/json/"
            async with httpx.AsyncClient() as client:
                res = await client.get(url, timeout=5.0)
                if res.status_code != 200:
                    return None
                
                data = res.json()
                city = data.get("city")
                region = data.get("region")
                
                matched = self.fuzzy_match_district(city) or self.fuzzy_match_district(region)
                if matched:
                    return {
                        "district": matched,
                        "state": region,
                        "lat": data.get("latitude"),
                        "lon": data.get("longitude"),
                        "method": "ip"
                    }
            return None
        except Exception as e:
            print(f"Backend resolve_from_ip error: {e}")
            return None

location_service = LocationService()
