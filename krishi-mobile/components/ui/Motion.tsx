import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
  interpolate,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColors, useReducedMotionPref } from '@/hooks/useColorScheme';
import { DesignTokens } from '@/constants/DesignTokens';

// RN types are shimmed to `any` in this project; use structural aliases.
type ViewStyle = Record<string, any>;
type StyleProp<T> = T | T[] | null | undefined;
type AccessibilityRole = string;
// Reanimated's Animated.View is typed loosely here; cast to accept a11y props.
const AView = Animated.View as any;

/**
 * KrishiAI Motion Primitives
 * ---------------------------------------------------------------------------
 * Reanimated 3 was installed but unused. These are the reusable building blocks
 * that replace spinners, add life to the UI, and stay calm & intentional.
 *
 * EVERY primitive honors "Reduce Motion": when the OS flag is on (or a user
 * enables it), animations collapse to instant/opacity-only. Motion is delight,
 * never a barrier.
 */

// ===========================================================================
// Skeleton + Shimmer  (replaces ActivityIndicator / spinners)
// ===========================================================================
interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** A single shimmering placeholder block. Compose several to mock a card. */
export function Skeleton({ width = '100%', height = 16, radius = DesignTokens.radius.small, style }: SkeletonProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const progress = useSharedValue(0.4);

  useEffect(() => {
    if (reduced) {
      progress.value = 0.5; // static, mid-opacity — still reads as "loading"
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [reduced]);

  const animStyle = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0.4, 1], [0.4, 0.85]) }));

  return (
    <AView
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width: width as any, height, borderRadius: radius, backgroundColor: colors.surfaceElevated }, animStyle, style]}
    />
  );
}

/** A ready-made card skeleton — drop in while a screen's data loads. */
export function SkeletonCard() {
  const colors = useThemeColors();
  return (
    <View style={[styles.skelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.skelRow}>
        <Skeleton width={44} height={44} radius={12} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width={'60%'} height={14} />
          <Skeleton width={'40%'} height={12} />
        </View>
      </View>
      <Skeleton width={'100%'} height={12} />
      <Skeleton width={'85%'} height={12} />
    </View>
  );
}

// ===========================================================================
// PressableScale  (premium tactile press for any tappable)
// ===========================================================================
interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  scaleTo?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: { disabled?: boolean; selected?: boolean; checked?: boolean };
}

/**
 * The tactile foundation for buttons, cards, tiles. Springs down on press-in,
 * back on release, fires a haptic. Reduced-motion → no scale, haptic still fires
 * (haptics are an accessibility aid, not "motion").
 */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  style,
  disabled,
  haptic = 'light',
  scaleTo = 0.96,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
}: PressableScaleProps) {
  const reduced = useReducedMotionPref();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const fireHaptic = () => {
    if (haptic === 'none') return;
    const map = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    } as const;
    Haptics.impactAsync(map[haptic]).catch(() => {});
  };

  return (
    <AView style={animStyle}>
      <Pressable
        disabled={disabled}
        onPressIn={() => {
          if (!reduced) scale.value = withSpring(scaleTo, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          if (!reduced) scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        onPress={() => {
          if (disabled) return;
          fireHaptic();
          onPress?.();
        }}
        onLongPress={onLongPress}
        style={style}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled, ...accessibilityState }}
      >
        {children}
      </Pressable>
    </AView>
  );
}

// ===========================================================================
// FadeInUp + Stagger  (list / section entrance)
// ===========================================================================
interface FadeInUpProps {
  children: React.ReactNode;
  index?: number;        // position in a list → staggered delay
  delay?: number;        // explicit delay override (ms)
  distance?: number;     // px to travel upward
  style?: StyleProp<ViewStyle>;
}

/**
 * Content rises + fades in. Give each item its `index` and they cascade.
 * Reduced-motion → appears instantly at full opacity (no transform).
 */
export function FadeInUp({ children, index = 0, delay, distance = 14, style }: FadeInUpProps) {
  const reduced = useReducedMotionPref();
  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      p.value = 1;
      return;
    }
    const d = delay ?? Math.min(index * 60, 400); // cap cascade so long lists don't lag
    p.value = withDelay(d, withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));
  }, [reduced]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: interpolate(p.value, [0, 1], [distance, 0]) }],
  }));

  return <AView style={[animStyle, style]}>{children}</AView>;
}

// ===========================================================================
// VoiceWave  (actually animated — replaces the static UiWaveAnimation)
// ===========================================================================
interface VoiceWaveProps {
  active?: boolean;
  color?: string;
  bars?: number;
  height?: number;
}

/**
 * Live audio-style bars for the voice assistant. Each bar breathes on its own
 * phase so it looks organic, not mechanical. When inactive (or reduced-motion),
 * bars rest at a low, calm height.
 */
export function VoiceWave({ active = true, color, bars = 5, height = 40 }: VoiceWaveProps) {
  const colors = useThemeColors();
  const c = color ?? colors.accent;
  return (
    <View style={[styles.waveWrap, { height }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: bars }).map((_, i) => (
        <WaveBar key={i} index={i} active={active} color={c} maxHeight={height} total={bars} />
      ))}
    </View>
  );
}

function WaveBar({ index, active, color, maxHeight, total }: { index: number; active: boolean; color: string; maxHeight: number; total: number }) {
  const reduced = useReducedMotionPref();
  const h = useSharedValue(0.25);

  useEffect(() => {
    cancelAnimation(h);
    if (!active || reduced) {
      h.value = withTiming(0.25, { duration: 250 });
      return;
    }
    // Center bars swing taller; each bar has a slightly different duration/phase.
    const center = (total - 1) / 2;
    const closeness = 1 - Math.abs(index - center) / (center || 1); // 0..1
    const peak = 0.5 + closeness * 0.5;
    const dur = 340 + index * 70;
    h.value = withDelay(
      index * 90,
      withRepeat(withSequence(
        withTiming(peak, { duration: dur, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: dur, easing: Easing.inOut(Easing.ease) }),
      ), -1, true),
    );
    return () => cancelAnimation(h);
  }, [active, reduced]);

  const animStyle = useAnimatedStyle(() => ({ height: `${h.value * 100}%` }));

  return <AView style={[styles.waveBar, { backgroundColor: color, minHeight: maxHeight * 0.2 }, animStyle]} />;
}

// ===========================================================================
// Pulse  (gentle attention pulse — e.g. "live" dot, recording ring)
// ===========================================================================
export function Pulse({ children, active = true, style }: { children: React.ReactNode; active?: boolean; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotionPref();
  const s = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(s);
    if (!active || reduced) {
      s.value = 1;
      return;
    }
    s.value = withRepeat(withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(s);
  }, [active, reduced]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <AView style={[animStyle, style]}>{children}</AView>;
}

// ===========================================================================
// Counter  (count-up number — for stats, prices, scores, XP)
// ===========================================================================
interface CounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<ViewStyle>;
  /** Format the interpolated number yourself (overrides prefix/suffix/decimals). */
  format?: (n: number) => string;
}

/**
 * Rolls from 0 → `value` on mount (and whenever `value` changes). Great for a
 * health score, mandi price, or XP total landing with a little life.
 * Reduced-motion → shows the final value instantly.
 */
export function Counter({ value, duration = 900, decimals = 0, prefix = '', suffix = '', style, format }: CounterProps) {
  const reduced = useReducedMotionPref();
  const progress = useSharedValue(reduced ? value : 0);
  const [display, setDisplay] = useState(() => fmt(value, decimals, prefix, suffix, format));

  useEffect(() => {
    if (reduced) {
      setDisplay(fmt(value, decimals, prefix, suffix, format));
      progress.value = value;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) });
    return () => cancelAnimation(progress);
  }, [value, reduced]);

  useAnimatedReaction(
    () => progress.value,
    (v) => runOnJS(setDisplay)(fmt(v, decimals, prefix, suffix, format)),
  );

  return <Text style={style as any}>{display}</Text>;
}

function fmt(n: number, decimals: number, prefix: string, suffix: string, format?: (n: number) => string) {
  if (format) return format(n);
  return `${prefix}${n.toFixed(decimals)}${suffix}`;
}

// ===========================================================================
// AnimatedBar  (chart bar that grows from 0 → target on mount)
// ===========================================================================
interface AnimatedBarProps {
  /** Final fill as a fraction 0..1 (e.g. 0.92) OR an absolute px height via `heightPx`. */
  fraction?: number;
  heightPx?: number;
  index?: number;          // stagger delay across a row of bars
  vertical?: boolean;      // true = grows up (column chart), false = grows right (bar)
  color?: string;
  gradient?: readonly string[];
  width?: number;
  radius?: number;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * A single bar/column that springs up (or across) to its target on mount.
 * Compose several with incrementing `index` for a cascading chart reveal.
 * Reduced-motion → renders at full size immediately.
 */
export function AnimatedBar({
  fraction = 1,
  heightPx,
  index = 0,
  vertical = true,
  color,
  gradient,
  width = 24,
  radius = 8,
  trackColor,
  style,
  children,
}: AnimatedBarProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const grow = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      grow.value = 1;
      return;
    }
    grow.value = 0;
    grow.value = withDelay(index * 80, withSpring(1, { damping: 16, stiffness: 120 }));
    return () => cancelAnimation(grow);
  }, [fraction, heightPx, reduced]);

  const animStyle = useAnimatedStyle(() => {
    const frac = Math.max(0, Math.min(1, fraction));
    if (vertical) {
      return { height: heightPx != null ? grow.value * heightPx : (`${grow.value * frac * 100}%` as any) };
    }
    return { width: heightPx != null ? grow.value * heightPx : (`${grow.value * frac * 100}%` as any) };
  });

  const barBg = color ?? colors.accent;
  const fillStyle = {
    backgroundColor: gradient ? undefined : barBg,
    borderRadius: radius,
    // Cross-axis must be fixed so an absolute-fill gradient child has a box to fill.
    ...(vertical ? { width: '100%' } : { height: '100%' }),
  } as ViewStyle;

  return (
    <View
      style={[
        vertical
          ? { width, flex: heightPx != null ? undefined : 1, justifyContent: 'flex-end', borderRadius: radius }
          : { height: width, borderRadius: radius },
        trackColor ? { backgroundColor: trackColor, overflow: 'hidden' } : null,
        style,
      ]}
    >
      <AView style={[fillStyle, animStyle, gradient ? { overflow: 'hidden' } : null]}>{children}</AView>
    </View>
  );
}

// ===========================================================================
// AnimatedProgress  (horizontal progress track — XP, confidence, completion)
// ===========================================================================
export function AnimatedProgress({
  fraction,
  index = 0,
  height = 8,
  color,
  trackColor,
  style,
}: {
  fraction: number;
  index?: number;
  height?: number;
  color?: string;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const grow = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      grow.value = 1;
      return;
    }
    grow.value = 0;
    grow.value = withDelay(index * 80, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    return () => cancelAnimation(grow);
  }, [fraction, reduced]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${grow.value * Math.max(0, Math.min(1, fraction)) * 100}%` as any,
  }));

  return (
    <View style={[{ height, borderRadius: height, backgroundColor: trackColor ?? colors.surfaceElevated, overflow: 'hidden' }, style]}>
      <AView style={[{ height: '100%', borderRadius: height, backgroundColor: color ?? colors.accent }, animStyle]} />
    </View>
  );
}

// ===========================================================================
// TypingDots  (animated "AI is thinking…" — replaces ActivityIndicator)
// ===========================================================================
export function TypingDots({ color, size = 7 }: { color?: string; size?: number }) {
  const colors = useThemeColors();
  const c = color ?? colors.accent;
  return (
    <View style={styles.dotsWrap} accessibilityLabel="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <TypingDot key={i} index={i} color={c} size={size} />
      ))}
    </View>
  );
}

function TypingDot({ index, color, size }: { index: number; color: string; size: number }) {
  const reduced = useReducedMotionPref();
  const v = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      v.value = 0.5;
      return;
    }
    v.value = withDelay(index * 160, withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true));
    return () => cancelAnimation(v);
  }, [reduced]);
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(v.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(v.value, [0, 1], [2, -3]) }],
  }));
  return <AView style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, animStyle]} />;
}


// ===========================================================================
// ProgressRing (Web crisp SVG, Native layout-safe concentric borders)
// ===========================================================================
export function ProgressRing({ value, size = 56, strokeWidth = 5, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const colors = useThemeColors();
  const percentage = Math.max(0, Math.min(100, value));
  
  if (Platform.OS === 'web') {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const SVGComponent = 'svg' as any;
    const CircleComponent = 'circle' as any;
    
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <SVGComponent width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <CircleComponent
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.surfaceElevated}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <CircleComponent
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </SVGComponent>
        <Text style={{ fontSize: size * 0.24, fontWeight: '800', color: colors.text }}>
          {percentage}%
        </Text>
      </View>
    );
  }
  
  // Native fallback
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <View style={[StyleSheet.absoluteFillObject, { borderRadius: size / 2, borderWidth: strokeWidth, borderColor: 'transparent', borderTopColor: color, borderRightColor: color, transform: [{ rotate: `${(percentage / 100) * 360 - 45}deg` }] }]} />
      <Text style={{ fontSize: size * 0.24, fontWeight: '800', color: colors.text }}>
        {percentage}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  skelCard: {
    padding: 16,
    borderRadius: DesignTokens.radius.extraLarge,
    borderWidth: 1,
    gap: 12,
  },
  skelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waveWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  waveBar: { width: 4, borderRadius: 2 },
  dotsWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
