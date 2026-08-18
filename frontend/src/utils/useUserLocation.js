import { useState, useEffect, useCallback } from 'react';

// Extensive District → State mapping for India
const DISTRICT_TO_STATE = {
  // Maharashtra
  "Pune": "Maharashtra", "Nashik": "Maharashtra", "Nagpur": "Maharashtra",
  "Aurangabad": "Maharashtra", "Solapur": "Maharashtra", "Kolhapur": "Maharashtra",
  "Ahmednagar": "Maharashtra", "Satara": "Maharashtra", "Sangli": "Maharashtra",
  "Ratnagiri": "Maharashtra", "Sindhudurg": "Maharashtra", "Raigad": "Maharashtra",
  "Thane": "Maharashtra", "Mumbai": "Maharashtra", "Palghar": "Maharashtra",
  "Dhule": "Maharashtra", "Nandurbar": "Maharashtra", "Jalgaon": "Maharashtra",
  "Buldhana": "Maharashtra", "Akola": "Maharashtra", "Washim": "Maharashtra",
  "Amravati": "Maharashtra", "Wardha": "Maharashtra", "Yavatmal": "Maharashtra",
  "Nanded": "Maharashtra", "Hingoli": "Maharashtra", "Parbhani": "Maharashtra",
  "Latur": "Maharashtra", "Osmanabad": "Maharashtra", "Beed": "Maharashtra",
  "Chandrapur": "Maharashtra", "Gadchiroli": "Maharashtra", "Gondia": "Maharashtra",
  "Bhandara": "Maharashtra", "Jalna": "Maharashtra",
  // Uttar Pradesh
  "Agra": "Uttar Pradesh", "Aligarh": "Uttar Pradesh", "Allahabad": "Uttar Pradesh",
  "Lucknow": "Uttar Pradesh", "Varanasi": "Uttar Pradesh", "Kanpur Nagar": "Uttar Pradesh",
  "Meerut": "Uttar Pradesh", "Ghaziabad": "Uttar Pradesh", "Mathura": "Uttar Pradesh",
  "Bareilly": "Uttar Pradesh", "Moradabad": "Uttar Pradesh", "Muzaffarnagar": "Uttar Pradesh",
  "Gorakhpur": "Uttar Pradesh", "Jhansi": "Uttar Pradesh", "Saharanpur": "Uttar Pradesh",
  // Madhya Pradesh
  "Bhopal": "Madhya Pradesh", "Indore": "Madhya Pradesh", "Jabalpur": "Madhya Pradesh",
  "Gwalior": "Madhya Pradesh", "Ujjain": "Madhya Pradesh", "Ratlam": "Madhya Pradesh",
  "Sagar": "Madhya Pradesh", "Satna": "Madhya Pradesh", "Rewa": "Madhya Pradesh",
  "Chhindwara": "Madhya Pradesh", "Hoshangabad": "Madhya Pradesh",
  // Punjab
  "Amritsar": "Punjab", "Ludhiana": "Punjab", "Jalandhar": "Punjab",
  "Patiala": "Punjab", "Bathinda": "Punjab", "Barnala": "Punjab",
  "Fatehgarh Sahib": "Punjab", "Gurdaspur": "Punjab", "Hoshiarpur": "Punjab",
  "Kapurthala": "Punjab", "Moga": "Punjab", "Muktsar": "Punjab",
  "Nawanshahr": "Punjab", "Rupnagar": "Punjab", "Sangrur": "Punjab",
  "Faridkot": "Punjab", "Firozepur": "Punjab", "Tarn Taran": "Punjab",
  // Rajasthan
  "Jaipur": "Rajasthan", "Jodhpur": "Rajasthan", "Kota": "Rajasthan",
  "Bikaner": "Rajasthan", "Ajmer": "Rajasthan", "Udaipur": "Rajasthan",
  "Alwar": "Rajasthan", "Bharatpur": "Rajasthan", "Sikar": "Rajasthan",
  "Churu": "Rajasthan", "Barmer": "Rajasthan", "Jaisalmer": "Rajasthan",
  // Gujarat
  "Ahmadabad": "Gujarat", "Surat": "Gujarat", "Vadodara": "Gujarat",
  "Rajkot": "Gujarat", "Bhavnagar": "Gujarat", "Anand": "Gujarat",
  "Gandhinagar": "Gujarat", "Junagadh": "Gujarat", "Jamnagar": "Gujarat",
  "Kachchh": "Gujarat", "Mehsana": "Gujarat", "Amreli": "Gujarat",
  "Bharuch": "Gujarat", "Navsari": "Gujarat", "Valsad": "Gujarat",
  "Porbandar": "Gujarat",
  // Karnataka
  "Bengaluru Urban": "Karnataka", "Bangalore Rural": "Karnataka",
  "Mysore": "Karnataka", "Hubli": "Karnataka", "Dharwad": "Karnataka",
  "Belgaum": "Karnataka", "Gulbarga": "Karnataka", "Mangalore": "Karnataka",
  "Udupi": "Karnataka", "Hassan": "Karnataka", "Tumkur": "Karnataka",
  "Davangere": "Karnataka", "Shimoga": "Karnataka", "Bellary": "Karnataka",
  "Bijapur": "Karnataka", "Raichur": "Karnataka", "Bidar": "Karnataka",
  "Koppal": "Karnataka", "Gadag": "Karnataka", "Haveri": "Karnataka",
  "Chikmagalur": "Karnataka", "Mandya": "Karnataka", "Kodagu": "Karnataka",
  // Andhra Pradesh / Telangana
  "Hyderabad": "Telangana", "Warangal": "Telangana", "Karimnagar": "Telangana",
  "Nizamabad": "Telangana", "Nalgonda": "Telangana", "Mahbubnagar": "Telangana",
  "Rangareddi": "Telangana", "Medak": "Telangana",
  "Visakhapatanam": "Andhra Pradesh", "East Godavari": "Andhra Pradesh",
  "West Godavari": "Andhra Pradesh", "Krishna": "Andhra Pradesh",
  "Guntur": "Andhra Pradesh", "Kurnool": "Andhra Pradesh", "Kadapa": "Andhra Pradesh",
  "Anantapur": "Andhra Pradesh", "Chittoor": "Andhra Pradesh",
  "Spsr Nellore": "Andhra Pradesh", "Srikakulam": "Andhra Pradesh",
  "Vizianagaram": "Andhra Pradesh",
  // Tamil Nadu
  "Chennai": "Tamil Nadu", "Coimbatore": "Tamil Nadu", "Madurai": "Tamil Nadu",
  "Tiruchirappalli": "Tamil Nadu", "Salem": "Tamil Nadu", "Tirunelveli": "Tamil Nadu",
  "Vellore": "Tamil Nadu", "Erode": "Tamil Nadu", "Tiruppur": "Tamil Nadu",
  "Dindigul": "Tamil Nadu", "Thanjavur": "Tamil Nadu", "Tiruvannamalai": "Tamil Nadu",
  "Dharmapuri": "Tamil Nadu", "Krishnagiri": "Tamil Nadu", "Namakkal": "Tamil Nadu",
  "Nagapattinam": "Tamil Nadu", "Cuddalore": "Tamil Nadu", "Villupuram": "Tamil Nadu",
  "Perambalur": "Tamil Nadu", "Ariyalur": "Tamil Nadu", "Ramanathapuram": "Tamil Nadu",
  "Virudhunagar": "Tamil Nadu", "Kanchipuram": "Tamil Nadu",
  "Kanniyakumari": "Tamil Nadu", "Sivaganga": "Tamil Nadu", "Theni": "Tamil Nadu",
  "Tuticorin": "Tamil Nadu", "Pudukkottai": "Tamil Nadu",
  // Kerala
  "Thiruvananthapuram": "Kerala", "Kollam": "Kerala", "Pathanamthitta": "Kerala",
  "Alappuzha": "Kerala", "Kottayam": "Kerala", "Idukki": "Kerala",
  "Ernakulam": "Kerala", "Thrissur": "Kerala", "Palakkad": "Kerala",
  "Malappuram": "Kerala", "Kozhikode": "Kerala", "Wayanad": "Kerala",
  "Kannur": "Kerala", "Kasaragod": "Kerala",
  // West Bengal
  "Kolkata": "West Bengal", "Howrah": "West Bengal", "Hooghly": "West Bengal",
  "Burdwan": "West Bengal", "Bardhaman": "West Bengal", "Murshidabad": "West Bengal",
  "Nadia": "West Bengal", "Maldah": "West Bengal", "Darjeeling": "West Bengal",
  "Jalpaiguri": "West Bengal", "Birbhum": "West Bengal", "Bankura": "West Bengal",
  "Purulia": "West Bengal", "Medinipur East": "West Bengal",
  "Medinipur West": "West Bengal", "24 Paraganas North": "West Bengal",
  "24 Paraganas South": "West Bengal",
  // Bihar
  "Patna": "Bihar", "Gaya": "Bihar", "Bhagalpur": "Bihar", "Muzaffarpur": "Bihar",
  "Darbhanga": "Bihar", "Saran": "Bihar", "Munger": "Bihar", "Nalanda": "Bihar",
  "Madhubani": "Bihar", "Sitamarhi": "Bihar", "Samastipur": "Bihar",
  // Haryana
  "Ambala": "Haryana", "Hisar": "Haryana", "Panipat": "Haryana",
  "Rohtak": "Haryana", "Sonipat": "Haryana", "Faridabad": "Haryana",
  "Gurgaon": "Haryana", "Karnal": "Haryana", "Kurukshetra": "Haryana",
  "Jind": "Haryana", "Bhiwani": "Haryana", "Mahendragarh": "Haryana",
  "Sirsa": "Haryana", "Fatehabad": "Haryana", "Kaithal": "Haryana",
  "Rewari": "Haryana", "Jhajjar": "Haryana", "Mewat": "Haryana",
  "Panchkula": "Haryana", "Palwal": "Haryana",
  // Odisha
  "Bhubaneswar": "Odisha", "Cuttack": "Odisha", "Sambalpur": "Odisha",
  "Rourkela": "Odisha", "Brahmapur": "Odisha", "Puri": "Odisha",
  "Sundargarh": "Odisha", "Ganjam": "Odisha", "Mayurbhanj": "Odisha",
  // Jharkhand
  "Ranchi": "Jharkhand", "Dhanbad": "Jharkhand", "Bokaro": "Jharkhand",
  "Giridih": "Jharkhand", "Hazaribagh": "Jharkhand",
  // Himachal Pradesh
  "Shimla": "Himachal Pradesh", "Kangra": "Himachal Pradesh",
  "Mandi": "Himachal Pradesh", "Solan": "Himachal Pradesh",
  "Kullu": "Himachal Pradesh", "Hamirpur": "Himachal Pradesh",
  // Uttarakhand
  "Dehradun": "Uttarakhand", "Haridwar": "Uttarakhand", "Nainital": "Uttarakhand",
  "Pauri Garhwal": "Uttarakhand", "Almora": "Uttarakhand",
  // Assam
  "Kamrup Metro": "Assam", "Kamrup": "Assam", "Nagaon": "Assam",
  "Jorhat": "Assam", "Darrang": "Assam", "Sonitpur": "Assam",
  "Dibrugarh": "Assam", "Cachar": "Assam", "Barpeta": "Assam",
  // Jammu & Kashmir
  "Srinagar": "Jammu & Kashmir", "Jammu": "Jammu & Kashmir",
  "Anantnag": "Jammu & Kashmir", "Baramulla": "Jammu & Kashmir",
  // Chhattisgarh
  "Raipur": "Chhattisgarh", "Bilaspur": "Chhattisgarh", "Durg": "Chhattisgarh",
  "Korba": "Chhattisgarh", "Rajnandgaon": "Chhattisgarh",
  // Goa
  "North Goa": "Goa", "South Goa": "Goa",
};

// Popular village → district mapping for village search
const VILLAGE_TO_DISTRICT = {
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
};

/**
 * Returns state name for a district or empty string.
 */
export function getStateForDistrict(district) {
  return DISTRICT_TO_STATE[district] || '';
}

/**
 * Resolves a village name to its parent district.
 * Returns the district name or null.
 */
export function resolveVillageToDistrict(village) {
  const key = Object.keys(VILLAGE_TO_DISTRICT).find(
    v => v.toLowerCase() === village.toLowerCase()
  );
  return key ? VILLAGE_TO_DISTRICT[key] : null;
}

/**
 * Fuzzy-match a place name against the district list.
 * Returns the best matching district name or null.
 */
export function fuzzyMatchDistrict(placeName, districtList) {
  if (!placeName) return null;
  const lc = placeName.toLowerCase().trim();

  // Exact match first
  const exact = districtList.find(d => d.toLowerCase() === lc);
  if (exact) return exact;

  // Check village → district mapping
  const fromVillage = resolveVillageToDistrict(placeName);
  if (fromVillage) return fromVillage;

  // Partial match: district name contains the place name or vice versa
  const partial = districtList.find(d =>
    d.toLowerCase().includes(lc) || lc.includes(d.toLowerCase())
  );
  if (partial) return partial;

  // Word-level match: match any word in the place name against district names
  const words = lc.split(/\s+/);
  const wordMatch = districtList.find(d =>
    words.some(w => w.length > 3 && d.toLowerCase().includes(w))
  );
  return wordMatch || null;
}

/**
 * Custom hook: detect user's location and resolve to district.
 * Tries: GPS → Nominatim reverse geocode → IP geolocation → null.
 * Returns: { district, state, lat, lon, loading, error, method }
 */
export function useUserLocation(districtList) {
  const [location, setLocation] = useState({
    district: null, state: null, lat: null, lon: null,
    loading: true, error: null, method: null
  });

  const resolveFromCoords = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) throw new Error('Geocode failed');
      const data = await res.json();
      const addr = data.address || {};
      const candidates = [
        addr.county, addr.state_district, addr.district,
        addr.city, addr.town, addr.village, addr.suburb,
      ].filter(Boolean);

      for (const cand of candidates) {
        const matched = fuzzyMatchDistrict(cand, districtList);
        if (matched) {
          return {
            district: matched,
            state: DISTRICT_TO_STATE[matched] || addr.state || '',
            lat, lon, method: 'gps'
          };
        }
      }
      // Could not match — return state at least
      return { district: null, state: addr.state || '', lat, lon, method: 'gps_partial' };
    } catch {
      return null;
    }
  }, [districtList]);

  const resolveFromIP = useCallback(async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error('IP lookup failed');
      const data = await res.json();
      const city = data.city || '';
      const region = data.region || '';
      const matched = fuzzyMatchDistrict(city, districtList) ||
        fuzzyMatchDistrict(region, districtList);
      if (matched) {
        return {
          district: matched,
          state: DISTRICT_TO_STATE[matched] || region,
          lat: data.latitude, lon: data.longitude, method: 'ip'
        };
      }
      return null;
    } catch {
      return null;
    }
  }, [districtList]);

  useEffect(() => {
    if (!districtList?.length) return;

    // Check localStorage cache (valid for 1 hour)
    try {
      const cached = JSON.parse(localStorage.getItem('krishiai_location') || 'null');
      if (cached && Date.now() - cached.ts < 3600000) {
        setLocation({ ...cached, loading: false, error: null });
        return;
      }
    } catch { }

    const refreshLoc = useCallback(() => {
      localStorage.removeItem('krishiai_location');
      setLocation({
        district: null, state: null, lat: null, lon: null,
        loading: true, error: null, method: null
      });
      // The useEffect will trigger again because districtList is likely stable 
      // but the run function will be redefined if dependencies change.
      // Actually we need a trigger.
      setTrigger(t => t + 1);
    }, []);

    const [trigger, setTrigger] = useState(0);

    useEffect(() => {
      if (!districtList?.length) return;
      // ... cache logic removed from inside run but kept in the outer hook ...
      const run = async () => {
        // (logic same as before but without internal cache check)
        // Try GPS first
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude: lat, longitude: lon } = pos.coords;
              const result = await resolveFromCoords(lat, lon);
              if (result?.district) {
                const loc = { ...result, loading: false, error: null };
                setLocation(loc);
                localStorage.setItem('krishiai_location', JSON.stringify({ ...loc, ts: Date.now() }));
                return;
              }
              const ipResult = await resolveFromIP();
              if (ipResult) {
                const loc = { ...ipResult, loading: false, error: null };
                setLocation(loc);
                localStorage.setItem('krishiai_location', JSON.stringify({ ...loc, ts: Date.now() }));
              } else {
                setLocation(prev => ({ ...prev, loading: false, error: 'Matches failed' }));
              }
            },
            async () => {
              const ipResult = await resolveFromIP();
              if (ipResult) {
                const loc = { ...ipResult, loading: false, error: null };
                setLocation(loc);
                localStorage.setItem('krishiai_location', JSON.stringify({ ...loc, ts: Date.now() }));
              } else {
                setLocation(prev => ({ ...prev, loading: false, error: 'GPS denied' }));
              }
            },
            { timeout: 8000 }
          );
        } else {
          const ipResult = await resolveFromIP();
          if (ipResult) {
            const loc = { ...ipResult, loading: false, error: null };
            setLocation(loc);
            localStorage.setItem('krishiai_location', JSON.stringify({ ...loc, ts: Date.now() }));
          }
        }
      };
      run();
    }, [districtList, resolveFromCoords, resolveFromIP, trigger]);
    return { ...location, refreshLoc }
  };
