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

const ID_KEY = 'krishi.session.id';
let cachedId: string | null = null;

function generateId(): string {
  return 'km-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Stable per-install anonymous id. Safe to call repeatedly. */
export async function getPhoneId(): Promise<string> {
  if (cachedId) return cachedId;
  try {
    const saved = await storage?.getItem(ID_KEY);
    if (saved) {
      cachedId = saved;
      return saved;
    }
  } catch { /* fall through to generate */ }
  cachedId = generateId();
  storage?.setItem(ID_KEY, cachedId).catch(() => {});
  return cachedId;
}
