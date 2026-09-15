/**
 * KrishiAI Color Palette
 * Premium agriculture-themed design system — light-mode-first
 */

const tintColorLight = '#15803d';
const tintColorDark = '#4ade80';

export const Colors = {
  light: {
    text: '#0b1610',
    textSecondary: '#2f4337', 
    textMuted: '#4d6054',
    background: '#f2f6f3', // softer organic background
    surface: '#ffffff',
    surfaceElevated: '#eaf2eb', // slightly more tinted for layering
    tint: '#0e7a3d',
    accent: '#10b981', // vibrant emerald
    accentSoft: 'rgba(16, 185, 129, 0.08)',
    green: '#14532d',
    greenLight: '#a7f3d0',
    yellow: '#d97706',
    border: 'rgba(20, 83, 45, 0.06)', // soft green-tinted border
    borderStrong: 'rgba(20, 83, 45, 0.12)',
    icon: '#4b6152',
    tabIconDefault: '#6b7f72', 
    tabIconSelected: '#0e7a3d',
    tabBar: 'rgba(255, 255, 255, 0.85)', // translucent
    tabBarBorder: 'rgba(20, 83, 45, 0.06)',
    card: '#ffffff',
    cardHover: '#f5faf7',
    danger: '#e11d48', // rose-red
    warning: '#ea580c',
    info: '#2563eb',
    success: '#10b981',
    overlay: 'rgba(11, 22, 16, 0.35)',
    // Liquid glass tokens — translucent surfaces with edge highlights
    glassSurface: 'rgba(255, 255, 255, 0.62)',
    glassSurfaceStrong: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.65)',
    glassHighlight: 'rgba(255, 255, 255, 0.9)',
    glassShadow: 'rgba(15, 40, 25, 0.10)',
    gradient: {
      primary: ['#0f5132', '#198754'] as const,
      accent: ['#10b981', '#059669'] as const,
      warm: ['#f59e0b', '#ea580c'] as const,
      success: ['#10b981', '#047857'] as const,
      danger: ['#f43f5e', '#be123c'] as const,
      header: ['#ffffff', '#eaf6ed'] as const,
      glass: ['rgba(255, 255, 255, 0.85)', 'rgba(240, 248, 243, 0.7)'] as const,
      hero: ['#e6fcf0', '#d1fae5', '#a7f3d0'] as const,
      ambient: ['rgba(16,185,129,0.14)', 'rgba(16,185,129,0.0)'] as const,
    },
  },
  dark: {
    text: '#e6f4ea',
    textSecondary: '#a3c2ae', 
    textMuted: '#799a84',
    background: '#040906', // premium dark olive/emerald charcoal
    surface: '#0b130f',
    surfaceElevated: '#121e17',
    tint: '#34d399',
    accent: '#34d399', // bright mint/emerald
    accentSoft: 'rgba(52, 211, 153, 0.09)',
    green: '#10b981',
    greenLight: '#d1fae5',
    yellow: '#fbbf24',
    border: 'rgba(52, 211, 153, 0.1)', // subtle mint border
    borderStrong: 'rgba(52, 211, 153, 0.2)',
    icon: '#86efac',
    tabIconDefault: '#6e8b78', 
    tabIconSelected: '#34d399',
    tabBar: 'rgba(11, 19, 15, 0.85)',
    tabBarBorder: 'rgba(52, 211, 153, 0.1)',
    card: '#0b130f',
    cardHover: '#121e17',
    danger: '#fb7185',
    warning: '#f59e0b',
    info: '#60a5fa',
    success: '#34d399',
    overlay: 'rgba(0, 0, 0, 0.75)',
    // Liquid glass tokens — deep translucent panes with mint edge glow
    glassSurface: 'rgba(18, 30, 23, 0.55)',
    glassSurfaceStrong: 'rgba(18, 30, 23, 0.78)',
    glassBorder: 'rgba(120, 220, 170, 0.18)',
    glassHighlight: 'rgba(160, 240, 200, 0.22)',
    glassShadow: 'rgba(0, 0, 0, 0.5)',
    gradient: {
      primary: ['#064e3b', '#0f766e'] as const,
      accent: ['#34d399', '#059669'] as const,
      warm: ['#f59e0b', '#d97706'] as const,
      success: ['#34d399', '#059669'] as const,
      danger: ['#fb7185', '#e11d48'] as const,
      header: ['#040906', '#0b130f'] as const,
      glass: ['rgba(11, 19, 15, 0.82)', 'rgba(4, 9, 6, 0.7)'] as const,
      hero: ['#0b130f', '#121e17', '#172f23'] as const,
      ambient: ['rgba(52,211,153,0.12)', 'rgba(52,211,153,0.0)'] as const,
    },
  },

  /**
   * HIGH-CONTRAST LIGHT
   * For low-vision users and bright-sunlight field use. Text goes pure-dark,
   * borders become opaque and heavier, muted text is eliminated (folded up to
   * a fully-passing tone). Same keys as `light` so any screen works unchanged.
   */
  lightHC: {
    text: '#000000',
    textSecondary: '#14311f',
    textMuted: '#2f4a3a', // ~8:1 — no "muted" tier is allowed to fail in HC
    background: '#ffffff',
    surface: '#ffffff',
    surfaceElevated: '#f2f6f3',
    tint: '#0b5e2a',
    accent: '#0b5e2a',
    accentSoft: 'rgba(11, 94, 42, 0.10)',
    green: '#0b5e2a',
    greenLight: '#0b5e2a',
    yellow: '#8a5a00',
    border: 'rgba(0, 0, 0, 0.55)',
    borderStrong: 'rgba(0, 0, 0, 0.85)',
    icon: '#14311f',
    tabIconDefault: '#2f4a3a',
    tabIconSelected: '#0b5e2a',
    tabBar: '#ffffff',
    tabBarBorder: 'rgba(0, 0, 0, 0.7)',
    card: '#ffffff',
    cardHover: '#eef4f0',
    danger: '#b00000',
    warning: '#8a5a00',
    info: '#0b3ea8',
    success: '#0b5e2a',
    overlay: 'rgba(0, 0, 0, 0.55)',
    // HC: glass surfaces go opaque for readability
    glassSurface: '#ffffff',
    glassSurfaceStrong: '#ffffff',
    glassBorder: 'rgba(0, 0, 0, 0.55)',
    glassHighlight: 'rgba(0, 0, 0, 0.1)',
    glassShadow: 'rgba(0, 0, 0, 0.25)',
    gradient: {
      primary: ['#0b5e2a', '#0b5e2a'] as const,
      accent: ['#0b5e2a', '#0b5e2a'] as const,
      warm: ['#8a5a00', '#8a5a00'] as const,
      success: ['#0b5e2a', '#0b5e2a'] as const,
      danger: ['#b00000', '#b00000'] as const,
      header: ['#ffffff', '#ffffff'] as const,
      glass: ['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.98)'] as const,
      hero: ['#ffffff', '#f2f6f3', '#eef4f0'] as const,
      ambient: ['rgba(11,94,42,0.08)', 'rgba(11,94,42,0.0)'] as const,
    },
  },

  /**
   * HIGH-CONTRAST DARK
   * Pure-white text on near-black, opaque bright borders. Mirrors `dark` keys.
   */
  darkHC: {
    text: '#ffffff',
    textSecondary: '#d6f5de',
    textMuted: '#a8d8b3', // ~9:1 on near-black
    background: '#000000',
    surface: '#04120a',
    surfaceElevated: '#0a2010',
    tint: '#7cf6a3',
    accent: '#7cf6a3',
    accentSoft: 'rgba(124, 246, 163, 0.14)',
    green: '#7cf6a3',
    greenLight: '#7cf6a3',
    yellow: '#ffd24a',
    border: 'rgba(255, 255, 255, 0.55)',
    borderStrong: 'rgba(255, 255, 255, 0.85)',
    icon: '#d6f5de',
    tabIconDefault: '#a8d8b3',
    tabIconSelected: '#7cf6a3',
    tabBar: '#000000',
    tabBarBorder: 'rgba(255, 255, 255, 0.6)',
    card: '#04120a',
    cardHover: '#0a2010',
    danger: '#ff8a8a',
    warning: '#ffd24a',
    info: '#8ab8ff',
    success: '#7cf6a3',
    overlay: 'rgba(0, 0, 0, 0.85)',
    // HC: glass surfaces go opaque for readability
    glassSurface: '#04120a',
    glassSurfaceStrong: '#04120a',
    glassBorder: 'rgba(255, 255, 255, 0.55)',
    glassHighlight: 'rgba(255, 255, 255, 0.25)',
    glassShadow: 'rgba(0, 0, 0, 0.6)',
    gradient: {
      primary: ['#0b5e2a', '#0e7a37'] as const,
      accent: ['#7cf6a3', '#4ade80'] as const,
      warm: ['#ffd24a', '#f59e0b'] as const,
      success: ['#7cf6a3', '#4ade80'] as const,
      danger: ['#ff8a8a', '#ff8a8a'] as const,
      header: ['#000000', '#04120a'] as const,
      glass: ['rgba(4,18,10,0.96)', 'rgba(10,32,16,0.94)'] as const,
      hero: ['#04120a', '#0a2010', '#0e2a16'] as const,
      ambient: ['rgba(124,246,163,0.10)', 'rgba(124,246,163,0.0)'] as const,
    },
  },
};

export type ColorScheme = keyof typeof Colors;

