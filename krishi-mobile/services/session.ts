/**
 * Session identity for backend calls.
 * The backend keys conversations/scans by `phone_id`. We generate a stable
 * anonymous id per install, persisted via the same optional-AsyncStorage
 * pattern used by the theme and language engines.
 */

type Storage = {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
};
let storage: Storage | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  storage = require('@react-native-async-storage/async-storage').default as Storage;
} catch {
  storage = null;
}

const memoryStore: Record<string, string> = {};

const getItem = async (k: string): Promise<string | null> => {
  if (storage) {
    try {
      const val = await storage.getItem(k);
      if (val !== null) return val;
    } catch {}
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(k);
    } catch {}
  }
  return memoryStore[k] || null;
};

const setItem = async (k: string, v: string): Promise<void> => {
  if (storage) {
    try {
      await storage.setItem(k, v);
    } catch {}
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(k, v);
    } catch {}
  }
  memoryStore[k] = v;
};

const ID_KEY = 'krishi.session.id';
const PROFILE_KEY = 'krishi.user.profile';
const COORDS_KEY = 'krishi.user.coords';

let cachedId: string | null = null;
let cachedProfile: UserProfile | null = null;
let cachedCoords: UserCoords | null = null;

function generateId(): string {
  return 'km-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Stable per-install anonymous id. Safe to call repeatedly. */
export async function getPhoneId(): Promise<string> {
  if (cachedId) return cachedId;
  try {
    const saved = await getItem(ID_KEY);
    if (saved) {
      cachedId = saved;
      return saved;
    }
  } catch { /* fall through to generate */ }
  cachedId = generateId();
  setItem(ID_KEY, cachedId).catch(() => {});
  return cachedId;
}

export interface UserProfile {
  fullName: string;
  village: string;
  district: string;
  state: string;
  farmSize: string;
  cropType: string;
  experience: string;
  pastCrops: string;
  phone?: string;
}

export interface UserCoords {
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  district?: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (cachedProfile) return cachedProfile;
  try {
    const raw = await getItem(PROFILE_KEY);
    if (raw) {
      cachedProfile = JSON.parse(raw);
      return cachedProfile;
    }
  } catch {}
  return null;
}

export async function saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const existing = (await getUserProfile()) || {
    fullName: 'Farmer',
    village: '',
    district: 'Karnal',
    state: 'Haryana',
    farmSize: '5',
    cropType: 'Wheat',
    experience: '5',
    pastCrops: 'Wheat,Rice',
  };
  const updated: UserProfile = { ...existing, ...profile };
  cachedProfile = updated;
  await setItem(PROFILE_KEY, JSON.stringify(updated));
  return updated;
}

export async function getUserCoords(): Promise<UserCoords | null> {
  if (cachedCoords) return cachedCoords;
  try {
    const raw = await getItem(COORDS_KEY);
    if (raw) {
      cachedCoords = JSON.parse(raw);
      return cachedCoords;
    }
  } catch {}
  return null;
}

export async function saveUserCoords(coords: UserCoords): Promise<void> {
  cachedCoords = coords;
  await setItem(COORDS_KEY, JSON.stringify(coords));
}
