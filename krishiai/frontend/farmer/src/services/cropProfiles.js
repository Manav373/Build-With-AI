/**
 * KrishiAI Crop Agronomic Knowledge Base
 * Defines physiological moisture thresholds, growth stages,
 * fertilizer schedules, and rain sensitivities for major crops.
 */

export const CROP_PROFILES = {
  wheat: {
    id: 'wheat',
    name: 'Wheat (गेहूं / ઘઉં)',
    variety: 'HD-2967 / Sharbati',
    icon: '🌾',
    category: 'Cereal / Rabi',
    soilType: 'Loamy / Clay Loam',
    waterRequirementMm: '450 - 650 mm',
    criticalMoisture: 28,
    targetMoisture: 65,
    maxMoistureTolerance: 75,
    rainTolerance: 'Moderate — Waterlogging causes yellowing (chlorosis)',
    stages: [
      { 
        id: 'crir', 
        name: 'Crown Root Initiation (CRI)', 
        das: '20-25 DAS', 
        waterCritical: true, 
        fertilizerAction: 'Top-dress 1/3 Nitrogen (Urea 45 kg/acre) along with 1st irrigation',
        advice: 'Most critical stage for irrigation. Water stress at CRI causes 30-40% yield loss.'
      },
      { 
        id: 'tillering', 
        name: 'Tillering Stage', 
        das: '40-45 DAS', 
        waterCritical: true, 
        fertilizerAction: 'Apply 2nd split of Urea (30 kg/acre) + Zinc Sulphate if deficient',
        advice: 'Ensure optimum root zone moisture to promote maximum ear-bearing tillers.'
      },
      { 
        id: 'jointing', 
        name: 'Late Jointing / Booting', 
        das: '60-65 DAS', 
        waterCritical: false, 
        fertilizerAction: 'Foliar spray of 19:19:19 (NPK) or Potassium Nitrate (1%)',
        advice: 'Moderate irrigation. Avoid excess nitrogen which causes vegetative lodging.'
      },
      { 
        id: 'flowering', 
        name: 'Flowering & Anthesis', 
        das: '80-85 DAS', 
        waterCritical: true, 
        fertilizerAction: 'Boron (0.2%) foliar spray for improved grain setting',
        advice: 'Critical for grain number. Avoid dry stress, but do not irrigate during high winds.'
      },
      { 
        id: 'milking', 
        name: 'Milking & Grain Filling', 
        das: '100-105 DAS', 
        waterCritical: true, 
        fertilizerAction: 'No soil fertilizer. Optional Potassium foliar spray to combat terminal heat',
        advice: 'Light irrigation to prevent shrivelled grains caused by sudden temperature rise.'
      },
      { 
        id: 'ripening', 
        name: 'Ripening / Maturity', 
        das: '115-125 DAS', 
        waterCritical: false, 
        fertilizerAction: 'Nil',
        advice: 'Withhold all irrigation 15 days before harvest to facilitate field drying.'
      }
    ]
  },

  rice: {
    id: 'rice',
    name: 'Rice / Paddy (धान / ચોખા)',
    variety: 'Basmati / PR-126',
    icon: '🍚',
    category: 'Cereal / Kharif',
    soilType: 'Heavy Clay / Clayey Loam',
    waterRequirementMm: '1100 - 1500 mm',
    criticalMoisture: 55,
    targetMoisture: 85,
    maxMoistureTolerance: 100,
    rainTolerance: 'High — Semi-aquatic crop, requires standing water in early stages',
    stages: [
      {
        id: 'nursery',
        name: 'Nursery / Seedling',
        das: '0-25 DAS',
        waterCritical: true,
        fertilizerAction: 'DAP (5 kg/100m²) + Zinc in seedbed',
        advice: 'Keep nursery beds moist but avoid submerging young shoots for extended hours.'
      },
      {
        id: 'tillering',
        name: 'Active Tillering',
        das: '25-45 DAS',
        waterCritical: true,
        fertilizerAction: 'Top-dress Urea (35 kg/acre) + MOP (15 kg/acre)',
        advice: 'Maintain shallow standing water (2-3 cm). Aerate field periodically (AWD).'
      },
      {
        id: 'panicle',
        name: 'Panicle Initiation',
        das: '45-65 DAS',
        waterCritical: true,
        fertilizerAction: 'Final split of Urea (25 kg/acre) + Potassium',
        advice: 'Do not allow soil to crack. Peak water absorption period.'
      },
      {
        id: 'flowering',
        name: 'Flowering & Heading',
        das: '65-85 DAS',
        waterCritical: true,
        fertilizerAction: 'Foliar spray of 0:52:34 (MKP 1%) to enhance grain density',
        advice: 'Continuous 4-5 cm standing water required to ensure sterile floret reduction.'
      },
      {
        id: 'grain_filling',
        name: 'Dough / Grain Filling',
        das: '85-105 DAS',
        waterCritical: false,
        fertilizerAction: 'Nil',
        advice: 'Intermittent irrigation. Keep soil saturated without standing flood.'
      },
      {
        id: 'maturity',
        name: 'Maturity / Harvest',
        das: '105-120 DAS',
        waterCritical: false,
        fertilizerAction: 'Nil',
        advice: 'Drain field completely 10-12 days before harvest.'
      }
    ]
  },

  cotton: {
    id: 'cotton',
    name: 'Cotton (कपास / કપાસ)',
    variety: 'Bt Cotton / RCH-659',
    icon: '🌿',
    category: 'Cash Crop / Kharif',
    soilType: 'Deep Black Cotton / Vertisol',
    waterRequirementMm: '600 - 800 mm',
    criticalMoisture: 24,
    targetMoisture: 55,
    maxMoistureTolerance: 65,
    rainTolerance: 'Very Low — Extremely susceptible to waterlogging and root asphyxiation',
    stages: [
      {
        id: 'seedling',
        name: 'Seedling Establishment',
        das: '0-25 DAS',
        waterCritical: false,
        fertilizerAction: 'Basal application: DAP (50 kg) + MOP (25 kg/acre)',
        advice: 'Shallow root system. Avoid over-irrigation to prevent damping off.'
      },
      {
        id: 'squaring',
        name: 'Squaring (Bud Formation)',
        das: '35-55 DAS',
        waterCritical: true,
        fertilizerAction: 'Top-dress Urea (30 kg/acre) + Magnesium Sulphate (10 kg)',
        advice: 'Water stress during squaring triggers square shedding. Maintain moderate moisture.'
      },
      {
        id: 'flowering',
        name: 'Peak Flowering & Boll Setting',
        das: '60-85 DAS',
        waterCritical: true,
        fertilizerAction: 'Foliar spray: 13:0:45 (Potassium Nitrate 1%) + Boron (0.15%)',
        advice: 'Critical water period. Deficit causes severe boll drop.'
      },
      {
        id: 'boll_dev',
        name: 'Boll Development',
        das: '90-120 DAS',
        waterCritical: true,
        fertilizerAction: 'Foliar application of Planofix (NAA) + micronutrients to arrest boll drop',
        advice: 'Irrigate alternate furrows to conserve water and prevent humidity spike.'
      },
      {
        id: 'bursting',
        name: 'Boll Bursting & Picking',
        das: '125-150 DAS',
        waterCritical: false,
        fertilizerAction: 'Nil',
        advice: 'Stop irrigation. Moisture during boll opening stains lint and causes fungal rot.'
      }
    ]
  },

  tomato: {
    id: 'tomato',
    name: 'Tomato (टमाटर / ટામેટા)',
    variety: 'Abhinav / Arka Rakshak',
    icon: '🍅',
    category: 'Horticulture / All-season',
    soilType: 'Well-drained Sandy Loam',
    waterRequirementMm: '400 - 600 mm',
    criticalMoisture: 35,
    targetMoisture: 70,
    maxMoistureTolerance: 75,
    rainTolerance: 'Low — Excessive rain causes fruit cracking and fungal blights',
    stages: [
      {
        id: 'vegetative',
        name: 'Early Vegetative',
        das: '10-25 DAS',
        waterCritical: false,
        fertilizerAction: '19:19:19 via fertigation (3 kg/acre/week)',
        advice: 'Establish strong root ball. Drip irrigation recommended.'
      },
      {
        id: 'flowering',
        name: 'Flowering & Fruit Set',
        das: '30-50 DAS',
        waterCritical: true,
        fertilizerAction: 'Calcium Nitrate (5 kg/acre) + Boron (prevent blossom end rot)',
        advice: 'Keep soil moisture strictly uniform. Moisture fluctuations crack young fruits.'
      },
      {
        id: 'fruiting',
        name: 'Fruit Enlargement',
        das: '55-80 DAS',
        waterCritical: true,
        fertilizerAction: '0:52:34 (MKP) + Potassium Sulphate via fertigation',
        advice: 'Highest water intake stage. Short, frequent irrigation cycles give best fruit size.'
      },
      {
        id: 'harvest',
        name: 'Harvesting Flushes',
        das: '85-110 DAS',
        waterCritical: false,
        fertilizerAction: 'Light booster of 13:0:45 after each picking flush',
        advice: 'Do not irrigate 24 hours prior to picking to improve transit shelf life.'
      }
    ]
  },

  maize: {
    id: 'maize',
    name: 'Maize / Corn (मक्का / મકાઈ)',
    variety: 'DKC-9108 / Pioneer',
    icon: '🌽',
    category: 'Cereal / Kharif & Rabi',
    soilType: 'Deep Loamy Alluvial',
    waterRequirementMm: '500 - 700 mm',
    criticalMoisture: 30,
    targetMoisture: 65,
    maxMoistureTolerance: 70,
    rainTolerance: 'Moderate — Cannot tolerate standing water during knee-high stage',
    stages: [
      {
        id: 'knee_high',
        name: 'Knee-High Stage',
        das: '25-35 DAS',
        waterCritical: false,
        fertilizerAction: 'Top-dress Urea (40 kg/acre) alongside earthing up',
        advice: 'Rapid vegetative expansion. Avoid ponding.'
      },
      {
        id: 'tasseling',
        name: 'Tasseling & Pollination',
        das: '50-60 DAS',
        waterCritical: true,
        fertilizerAction: 'Zinc foliar spray + light Nitrogen booster',
        advice: 'Extremely critical. Moisture stress desensitizes pollen and empties cobs.'
      },
      {
        id: 'silking',
        name: 'Silking & Cob Formation',
        das: '65-75 DAS',
        waterCritical: true,
        fertilizerAction: 'MOP (20 kg/acre) for grain weight',
        advice: 'Full soil capacity irrigation. Every dry day at silking reduces yield by 7%.'
      },
      {
        id: 'dough',
        name: 'Grain Dough Stage',
        das: '80-95 DAS',
        waterCritical: false,
        fertilizerAction: 'Nil',
        advice: 'Light irrigation until kernel denting completes.'
      }
    ]
  },

  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane (गन्ना / શેરડી)',
    variety: 'Co-0238 / Co-86032',
    icon: '🎋',
    category: 'Perennial Cash Crop',
    soilType: 'Deep Clay Loam',
    waterRequirementMm: '1500 - 2200 mm',
    criticalMoisture: 42,
    targetMoisture: 75,
    maxMoistureTolerance: 85,
    rainTolerance: 'High — Deep root system, tolerant to brief flooding',
    stages: [
      {
        id: 'formative',
        name: 'Formative / Tillering',
        das: '60-120 DAS',
        waterCritical: true,
        fertilizerAction: 'Urea (60 kg) + SSP (100 kg) + MOP (40 kg/acre)',
        advice: 'Irrigate every 8-10 days. Moisture stress restricts tiller count.'
      },
      {
        id: 'grand_growth',
        name: 'Grand Growth Period',
        das: '120-250 DAS',
        waterCritical: true,
        fertilizerAction: 'Final Nitrogen top-dress before earthing up',
        advice: 'Peak cane elongation. High water consumption.'
      },
      {
        id: 'maturity',
        name: 'Ripening / Sugar Accumulation',
        das: '270-360 DAS',
        waterCritical: false,
        fertilizerAction: 'Nil',
        advice: 'Withhold irrigation 20 days prior to crushing to maximize Brix sugar content.'
      }
    ]
  }
};

const STORAGE_KEY_CROP = 'krishiai_active_crop_profile';

export const DEFAULT_CROP_CONFIG = {
  cropId: 'wheat',
  stageId: 'crir',
  soilType: 'Loamy Alluvial',
  sowingDate: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
  fieldAreaAcres: 2.5,
  isConfigured: false
};

export function getSavedCropProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CROP);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CROP_CONFIG, ...parsed, isConfigured: true };
    }
  } catch (e) {
    console.warn('Failed to read crop profile from storage:', e);
  }
  return DEFAULT_CROP_CONFIG;
}

export function saveCropProfile(profile) {
  try {
    const data = { ...profile, isConfigured: true, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY_CROP, JSON.stringify(data));
    return data;
  } catch (e) {
    console.warn('Failed to save crop profile:', e);
    return profile;
  }
}
