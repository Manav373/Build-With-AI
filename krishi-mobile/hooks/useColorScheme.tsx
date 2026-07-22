import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  useColorScheme as _useSystemColorScheme,
  AccessibilityInfo,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { ScaledType } from '@/constants/Typography';
import type { TypeToken } from '@/constants/Typography';

// RN types are shimmed to `any` in this project; use a structural alias.
type TextStyle = Record<string, any>;

/**
 * KrishiAI Theme Engine
 * ---------------------------------------------------------------------------
 * BACKWARD COMPATIBILITY IS SACRED:
 *   Every existing screen calls `useColorScheme()` and expects `'light' | 'dark'`.
 *   That export is preserved *exactly* — it still returns a plain 'light' | 'dark'
 *   so no screen breaks. `useThemeToggle()` keeps its old { theme, toggleTheme,
 *   setTheme } shape too.
 *
 * New capabilities (opt-in via new hooks):
 *   • Theme preference: 'system' | 'light' | 'dark' (system follows the OS)
 *   • High-contrast mode, layered on top of light/dark → lightHC / darkHC
 *   • Reduced-motion: mirrors the OS setting, drives the Motion primitives
 *   • Optional persistence via @react-native-async-storage IF installed —
 *     otherwise it degrades silently (no crash, just no persistence).
 */

export type Theme = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorKey = keyof typeof Colors; // 'light' | 'dark' | 'lightHC' | 'darkHC'

// ---------------------------------------------------------------------------
// Optional AsyncStorage (never a hard dependency)
// ---------------------------------------------------------------------------
type Storage = {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
};
let storage: Storage | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  storage = require('@react-native-async-storage/async-storage').default as Storage;
} catch {
  storage = null; // graceful: preferences simply won't persist across launches
}
const PREF_KEY = 'krishi.theme.pref';
const HC_KEY = 'krishi.theme.hc';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface ThemeContextType {
  theme: Theme;                 // resolved 'light' | 'dark'
  colorKey: ColorKey;           // active Colors[...] table (incl. HC)
  preference: ThemePreference;  // user's choice
  highContrast: boolean;
  reducedMotion: boolean;
  setPreference: (p: ThemePreference) => void;
  setHighContrast: (v: boolean) => void;
  toggleTheme: () => void;      // legacy convenience: light <-> dark
  setTheme: (t: Theme) => void; // legacy alias → setPreference
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colorKey: 'light',
  preference: 'system',
  highContrast: false,
  reducedMotion: false,
  setPreference: () => {},
  setHighContrast: () => {},
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = _useSystemColorScheme(); // 'light' | 'dark' | null
  // Default preference is 'light' to preserve the app's current launch look.
  // Change to 'system' once you're happy for it to follow the OS at first run.
  const [preference, setPreferenceState] = useState<ThemePreference>('light');
  const [highContrast, setHighContrastState] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load persisted prefs once.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!storage) return;
      try {
        const [p, hc] = await Promise.all([storage.getItem(PREF_KEY), storage.getItem(HC_KEY)]);
        if (!alive) return;
        if (p === 'system' || p === 'light' || p === 'dark') setPreferenceState(p);
        if (hc === '1') setHighContrastState(true);
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Mirror the OS "Reduce Motion" setting.
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v: any) => mounted && setReducedMotion(!!v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v: any) =>
      setReducedMotion(!!v),
    );
    return () => {
      mounted = false;
      (sub as any)?.remove?.();
    };
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    storage?.setItem(PREF_KEY, p).catch(() => {});
  }, []);

  const setHighContrast = useCallback((v: boolean) => {
    setHighContrastState(v);
    storage?.setItem(HC_KEY, v ? '1' : '0').catch(() => {});
  }, []);

  const theme: Theme = useMemo(() => {
    if (preference === 'system') return systemScheme === 'dark' ? 'dark' : 'light';
    return preference;
  }, [preference, systemScheme]);

  const colorKey: ColorKey = useMemo(() => {
    if (highContrast) return theme === 'dark' ? 'darkHC' : 'lightHC';
    return theme;
  }, [theme, highContrast]);

  const toggleTheme = useCallback(() => {
    setPreference(theme === 'light' ? 'dark' : 'light');
  }, [theme, setPreference]);

  const setTheme = useCallback((t: Theme) => setPreference(t), [setPreference]);

  const value = useMemo(
    () => ({
      theme,
      colorKey,
      preference,
      highContrast,
      reducedMotion,
      setPreference,
      setHighContrast,
      toggleTheme,
      setTheme,
    }),
    [theme, colorKey, preference, highContrast, reducedMotion, setPreference, setHighContrast, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ---------------------------------------------------------------------------
// LEGACY HOOK — unchanged signature. DO NOT change the return type.
//   const scheme = useColorScheme(); const colors = Colors[scheme];  // still valid
// ---------------------------------------------------------------------------
export function useColorScheme(): Theme {
  return useContext(ThemeContext).theme;
}

// ---------------------------------------------------------------------------
// NEW HOOKS
// ---------------------------------------------------------------------------

/** Full theme controls + a11y flags. Legacy fields (theme/toggleTheme/setTheme) kept. */
export function useThemeToggle() {
  const ctx = useContext(ThemeContext);
  return {
    theme: ctx.theme,
    preference: ctx.preference,
    highContrast: ctx.highContrast,
    reducedMotion: ctx.reducedMotion,
    setPreference: ctx.setPreference,
    setHighContrast: ctx.setHighContrast,
    toggleTheme: ctx.toggleTheme,
    setTheme: ctx.setTheme,
  };
}

/**
 * HC-aware color table. Prefer this in new/migrated screens:
 *   const colors = useThemeColors();
 * Returns the high-contrast palette automatically when HC is on, with the same
 * key set as Colors.light / Colors.dark.
 */
export function useThemeColors() {
  const { colorKey } = useContext(ThemeContext);
  return Colors[colorKey];
}

/** OS "reduce motion" flag. Drives the Motion.tsx primitives. */
export function useReducedMotionPref(): boolean {
  return useContext(ThemeContext).reducedMotion;
}

/**
 * Typography hook: Dynamic-Type-scaled styles with the active text color merged.
 *
 *   const t = useType();
 *   <Text style={t.title}>Weather</Text>                              // default text color
 *   <Text style={[t.body, { color: colors.textSecondary }]}>...</Text> // override color
 *
 * NOTE: each token is a PLAIN style object (not a function). React Native's
 * style flattener ignores anything that isn't an object, so returning objects —
 * and composing color overrides with an array — is the correct, safe pattern.
 * A convenience `tc(token, color)` helper is also returned for terse overrides.
 */
export function useType() {
  const colors = useThemeColors();
  return useMemo(() => {
    const tokens = Object.keys(ScaledType) as TypeToken[];
    const out = {} as Record<TypeToken, TextStyle> & { tc: (token: TypeToken, color?: string) => TextStyle };
    tokens.forEach((tk) => {
      out[tk] = { ...ScaledType[tk], color: colors.text };
    });
    // Terse colored variant: t.tc('body', colors.textSecondary)
    out.tc = (token: TypeToken, color?: string) => ({ ...ScaledType[token], color: color ?? colors.text });
    return out;
  }, [colors]);
}
