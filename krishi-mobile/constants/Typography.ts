import { Platform, PixelRatio } from 'react-native';

// The project ships a `declare module 'react-native'` shim (RN types are `any`),
// so we use a local structural alias instead of importing TextStyle as a type.
type Style = Record<string, any>;

/**
 * KrishiAI Typography System
 * ---------------------------------------------------------------------------
 * Goals (from the design brief):
 *   • Readable for elderly farmers, in sunlight, on cheap panels.
 *   • Cross-platform native feel (not iOS-copy, not Android-copy).
 *   • Full Dynamic Type support — respects the OS font-size slider.
 *
 * How to use:
 *   const t = useType();                 // from hooks/useColorScheme
 *   <Text style={t.body}>...</Text>      // already scaled + weighted
 *
 * Or statically (no scaling): Type.body
 *
 * WHY the sizes went up:
 *   The previous scale used 10–13.5px for body/caption/labels. At arm's length
 *   on a 5" phone in a wheat field that is effectively unreadable for a 55+
 *   user. Material's accessibility guidance and Apple HIG both floor body text
 *   near 15–17pt. We move the *minimum readable tier* to 15px and the default
 *   body to 16px, and let Dynamic Type push it further.
 */

// ---------------------------------------------------------------------------
// Font families
// ---------------------------------------------------------------------------
// We keep a single semantic family map. If/when Google Sans or Inter/SF files
// are loaded via expo-font under these keys, everything upgrades at once.
// Until then, `System` resolves to SF Pro on iOS and Roboto on Android — which
// is exactly the "feels native on both, imitates neither" target.
export const FontFamily = {
  // Loaded custom faces (register these names in useFonts()). Falls back to
  // system if the face is absent, so the app never crashes on a missing font.
  displayFace: Platform.select({ ios: undefined, android: 'sans-serif-medium', default: undefined }),
  regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
} as const;

// ---------------------------------------------------------------------------
// Dynamic Type
// ---------------------------------------------------------------------------
// PixelRatio.getFontScale() reflects the user's OS font-size setting.
// We clamp the multiplier so huge accessibility sizes don't shatter layouts,
// but still give a real, respectful boost. Elderly users commonly run 1.15–1.3.
const RAW_SCALE = PixelRatio.getFontScale();
const FONT_SCALE = Math.min(Math.max(RAW_SCALE, 1), 1.35);

/** Scale a point size by the (clamped) OS font scale, rounded to a crisp px. */
export function scaleFont(size: number): number {
  return Math.round(size * FONT_SCALE);
}

// Base (unscaled) definitions — the single source of truth for the hierarchy.
const base = {
  // DISPLAY — hero numbers, splash, celebratory moments
  displayXl: { fontSize: 40, lineHeight: 46, fontWeight: '800', letterSpacing: -1.0 },
  displayLarge: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.6 },
  displayMedium: { fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.4 },

  // HEADLINE / TITLE — screen + card headers
  headline: { fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.3 },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.2 },
  titleSmall: { fontSize: 17, lineHeight: 23, fontWeight: '700', letterSpacing: -0.1 },

  // BODY — the workhorse. 16 default, 15 floor. Never smaller.
  bodyLarge: { fontSize: 17, lineHeight: 25, fontWeight: '500' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  bodySmall: { fontSize: 15, lineHeight: 22, fontWeight: '500' }, // minimum readable tier

  // LABEL / BUTTON — actionable text
  button: { fontSize: 16, lineHeight: 20, fontWeight: '700', letterSpacing: 0.2 },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '700', letterSpacing: 0.1 },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },

  // CAPTION — the smallest we allow, and only for non-essential metadata.
  caption: { fontSize: 13, lineHeight: 17, fontWeight: '600' },

  // NUMBERS / CHART — tabular figures for prices, temps, stats
  numberXl: { fontSize: 48, lineHeight: 52, fontWeight: '800', letterSpacing: -1.5 },
  numberLarge: { fontSize: 32, lineHeight: 36, fontWeight: '800', letterSpacing: -0.8 },
  number: { fontSize: 22, lineHeight: 26, fontWeight: '800', letterSpacing: -0.4 },
} satisfies Record<string, Style>;

export type TypeToken = keyof typeof base;

// Static (unscaled) map — use when you deliberately do not want Dynamic Type
// (rare: e.g. a fixed-width chart axis).
export const Type = base as Record<TypeToken, Style>;

// Build the scaled map. Because RAW_SCALE is read once at module load, this is
// cheap and stable for the session. `useType()` (in the theme hook) returns
// this plus the active text color already merged in.
function buildScaled(): Record<TypeToken, Style> {
  const out = {} as Record<TypeToken, Style>;
  (Object.keys(base) as TypeToken[]).forEach((k) => {
    const s = base[k];
    out[k] = {
      ...s,
      fontSize: scaleFont(s.fontSize as number),
      lineHeight: scaleFont(s.lineHeight as number),
      // Tabular numbers keep digits aligned in price/temperature columns.
      ...(k.startsWith('number') ? { fontVariant: ['tabular-nums'] } : null),
    };
  });
  return out;
}

export const ScaledType = buildScaled();

/** The OS font scale actually in effect (clamped), exposed for layout math. */
export const activeFontScale = FONT_SCALE;
