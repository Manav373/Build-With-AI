import { Platform } from 'react-native';

/**
 * KrishiAI Design Tokens
 * Material 3 Expressive and Google Gemini inspired parameters
 */

export const DesignTokens = {
  // Spacing System (8pt base grid)
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    huge: 48,
    massive: 64,
    giant: 96,
  },

  // Border Radius Tokens
  radius: {
    small: 8,
    medium: 12,
    large: 18,
    extraLarge: 24,
    pill: 9999,
    circular: 9999,
  },

  // Shadow & Elevation System (cross-platform compatible shadows)
  shadow: {
    level1: Platform.select({
      web: {
        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.18)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      },
    }),
    level2: Platform.select({
      web: {
        boxShadow: '0px 2px 2.62px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2.62,
        elevation: 3,
      },
    }),
    level3: Platform.select({
      web: {
        boxShadow: '0px 4px 4.62px rgba(0, 0, 0, 0.23)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.23,
        shadowRadius: 4.62,
        elevation: 6,
      },
    }),
    level4: Platform.select({
      web: {
        boxShadow: '0px 8px 8.62px rgba(0, 0, 0, 0.28)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 8.62,
        elevation: 12,
      },
    }),
    hero: Platform.select({
      web: {
        boxShadow: '0px 4px 10px rgba(16, 185, 129, 0.15)',
      },
      default: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
      },
    }),
  },

  // Typography Scale (Google Sans / Roboto styled sizes)
  typography: {
    displayXl: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '900' as const,
      letterSpacing: -1.0,
    },
    displayLarge: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '800' as const,
      letterSpacing: -0.5,
    },
    displayMedium: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '800' as const,
      letterSpacing: -0.5,
    },
    headline: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '800' as const,
      letterSpacing: -0.3,
    },
    title: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700' as const,
      letterSpacing: -0.2,
    },
    bodyLarge: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500' as const,
    },
    bodyMedium: {
      fontSize: 13.5,
      lineHeight: 19.5,
      fontWeight: '500' as const,
    },
    labelLarge: {
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: '700' as const,
      letterSpacing: 0.2,
    },
    labelMedium: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '700' as const,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
    },
    numbersXl: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '900' as const,
      letterSpacing: -1.5,
    },
  },

  // Domain Color Palettes
  domains: {
    weather: {
      temp: '#f59e0b',
      rain: '#3b82f6',
      humidity: '#10b981',
      warning: '#ef4444',
    },
    crops: {
      healthy: '#10b981',
      alert: '#ef4444',
      harvest: '#fbbf24',
    },
    govt: {
      primary: '#166534',
      badge: '#059669',
    },
    market: {
      high: '#10b981',
      low: '#ef4444',
      average: '#475569',
    },
    community: {
      expert: '#2E7D32',
      regular: '#3b82f6',
    },
  },
};
