import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { DesignTokens } from '@/constants/DesignTokens';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';

// RN types are shimmed to `any` in this project — use structural aliases.
type ViewStyle = Record<string, any>;
type StyleProp<T> = T | T[] | null | undefined;
const AView = Animated.View as any;
const AScroll = Animated.ScrollView as any;

/**
 * KrishiAI Screen System
 * ---------------------------------------------------------------------------
 * The single iOS-grade design language shared by every screen. It gives us:
 *   • A large title that gracefully collapses into a compact, frosted nav bar
 *     as the user scrolls (the signature iOS "large title" behaviour).
 *   • One consistent set of building blocks — SectionTitle, ListRow, StatTile,
 *     GlassCard, IconBadge — so 40 screens can't drift apart.
 *   • Built-in safe-area, back button, right-actions, and staggered entrance.
 *
 * Everything respects the theme engine (light / dark / high-contrast) and the
 * Motion primitives already honour Reduce Motion.
 */

// ===========================================================================
// Screen  (compound container: collapsing large-title header + animated scroll)
// ===========================================================================
export interface ScreenProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  back?: boolean;                 // show a back chevron on the left
  onBack?: () => void;
  right?: React.ReactNode;        // right-aligned header actions
  children: React.ReactNode;
  /** Set false for screens that manage their own scrolling (e.g. chat, camera). */
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra bottom padding beyond the safe area (clears the tab bar + breathing room). */
  bottomInset?: number;
  /** Stagger children entrance automatically (each direct child fades up). */
  stagger?: boolean;
  refreshControl?: React.ReactNode;
}

export function Screen({
  title,
  subtitle,
  emoji,
  back,
  onBack,
  right,
  children,
  scroll = true,
  contentStyle,
  bottomInset,
  stagger = true,
  refreshControl,
}: ScreenProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const effectiveBottom = bottomInset ?? 92;
  // On web/simulator the safe-area inset is 0 — keep the header comfortably
  // below the device notch/speaker with a minimum breathing space.
  const topInset = Math.max(insets.top, 18);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const body = stagger ? <StaggerChildren>{children}</StaggerChildren> : children;
  const c: any = colors;
  const ambient = c.gradient?.ambient ?? ['transparent', 'transparent'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ambient top glow — gives the whole screen a soft, lit-from-above depth */}
      <LinearGradient colors={ambient} style={styles.ambientGlow} pointerEvents="none" />
      {scroll ? (
        <AScroll
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl as any}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topInset + LARGE_HEADER_HEIGHT, paddingBottom: insets.bottom + effectiveBottom },
            contentStyle,
          ]}
        >
          {body}
        </AScroll>
      ) : (
        <View style={[styles.staticBody, { paddingTop: topInset + COMPACT_HEADER_HEIGHT }]}>{body}</View>
      )}

      <CollapsingHeader
        title={title}
        subtitle={subtitle}
        emoji={emoji}
        back={back}
        onBack={onBack}
        right={right}
        scrollY={scrollY}
        staticMode={!scroll}
        topInset={topInset}
      />
    </View>
  );
}

const LARGE_HEADER_HEIGHT = 128;
const COMPACT_HEADER_HEIGHT = 52;
const COLLAPSE_DISTANCE = 60;

function CollapsingHeader({
  title,
  subtitle,
  emoji,
  back,
  onBack,
  right,
  scrollY,
  staticMode,
  topInset,
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
  back?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  scrollY: { value: number };
  staticMode?: boolean;
  topInset: number;
}) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const t = useType();
  const router = useRouter();

  // Frosted background + hairline fade in as the user scrolls past the title.
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: staticMode ? 1 : interpolate(scrollY.value, [0, COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  // Large title fades/slides up and shrinks away.
  const largeTitleStyle = useAnimatedStyle(() => ({
    opacity: staticMode ? 0 : interpolate(scrollY.value, [0, COLLAPSE_DISTANCE * 0.8], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: staticMode ? 0 : interpolate(scrollY.value, [0, COLLAPSE_DISTANCE], [0, -12], Extrapolation.CLAMP) },
    ],
  }));

  // Compact centered title fades in as the large one leaves.
  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: staticMode ? 1 : interpolate(scrollY.value, [COLLAPSE_DISTANCE * 0.5, COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  const handleBack = () => {
    if (onBack) return onBack();
    // Guard: if there's no history (deep link / redirect), land on Home instead
    if ((router as any).canGoBack?.() === false) {
      router.replace('/(tabs)' as any);
      return;
    }
    router.back();
  };
  const blurTint = scheme === 'dark' ? 'dark' : 'light';

  return (
    <View style={[styles.headerRoot, { paddingTop: topInset }]} pointerEvents="box-none">
      {/* Frosted chrome that reveals on scroll — covers only the compact nav bar. */}
      <AView style={[styles.chrome, { height: topInset + COMPACT_HEADER_HEIGHT }, chromeStyle]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint={blurTint} style={StyleSheet.absoluteFill as any} />
        ) : Platform.OS === 'web' ? (
          <View
            style={[
              StyleSheet.absoluteFill as any,
              { backgroundColor: (colors as any).glassSurfaceStrong ?? colors.surface },
              { backdropFilter: 'blur(20px) saturate(1.5)', WebkitBackdropFilter: 'blur(20px) saturate(1.5)' } as any,
            ]}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill as any, { backgroundColor: colors.surface }]} />
        )}
        <View style={[styles.headerHairline, { backgroundColor: colors.border }]} />
      </AView>

      {/* Compact bar: back • centered title • right actions */}
      <View style={[styles.compactBar, { height: COMPACT_HEADER_HEIGHT }]} pointerEvents="box-none">
        <View style={styles.compactSide}>
          {back && (
            <PressableScale
              onPress={handleBack}
              haptic="light"
              style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Feather name="chevron-left" size={22} color={colors.text} />
            </PressableScale>
          )}
        </View>

        <AView style={[styles.compactTitleWrap, compactTitleStyle]} pointerEvents="none">
          <Text style={[t.titleSmall, { textAlign: 'center' }]} numberOfLines={1}>
            {emoji ? `${emoji} ` : ''}{title}
          </Text>
        </AView>

        <View style={[styles.compactSide, { alignItems: 'flex-end' }]}>
          <View style={styles.rightRow}>{right}</View>
        </View>
      </View>

      {/* Large title that lives below the compact bar until scrolled away */}
      {!staticMode && (
        <AView style={[styles.largeTitleWrap, largeTitleStyle]} pointerEvents="none">
          <Text style={[t.displayMedium, { color: colors.text }]} numberOfLines={1} accessibilityRole="header">
            {emoji ? `${emoji} ` : ''}{title}
          </Text>
          {subtitle ? <Text style={[t.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>{subtitle}</Text> : null}
        </AView>
      )}
    </View>
  );
}

/** Wrap immediate children in staggered FadeInUp entrances. */
function StaggerChildren({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <>
      {items.map((child, i) => (
        <FadeInUp key={(child as any)?.key ?? i} index={i}>
          {child}
        </FadeInUp>
      ))}
    </>
  );
}

// ===========================================================================
// SectionTitle
// ===========================================================================
export function SectionTitle({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  const colors = useThemeColors();
  const t = useType();
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[t.overline, { color: colors.textMuted }]}>{children}</Text>
      {action ? (
        <PressableScale onPress={onAction} haptic="light" accessibilityRole="button" accessibilityLabel={action}>
          <Text style={[t.label, { color: colors.accent }]}>{action}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

// ===========================================================================
// GlassCard  (the standard elevated surface — iOS liquid-glass treatment)
// ===========================================================================
export function GlassCard({
  children,
  style,
  onPress,
  accent,
  padding = 18,
  /** true = real translucent liquid glass (blur pane). false = solid card. */
  liquid = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accent?: boolean;
  padding?: number;
  liquid?: boolean;
}) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const c: any = colors;
  const glassBg = c.glassSurface ?? colors.card;
  const glassBorder = accent ? colors.accent : (c.glassBorder ?? colors.border);
  const highlight = c.glassHighlight ?? 'rgba(255,255,255,0.4)';

  const inner = liquid ? (
    <View
      style={[
        styles.glassCard,
        styles.glassClip,
        {
          borderColor: glassBorder,
          borderWidth: accent ? 1.5 : 1,
          ...DesignTokens.shadow.level2,
          backgroundColor: glassBg,
        },
        Platform.OS === 'web' ? ({ backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)' } as any) : null,
        style,
      ]}
    >
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={scheme === 'dark' ? 28 : 44}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill as any}
        />
      )}
      {/* Specular top-edge highlight — the "liquid" sheen */}
      <View style={[styles.glassSheen, { backgroundColor: highlight }]} pointerEvents="none" />
      <View style={{ padding }}>{children}</View>
    </View>
  ) : (
    <View
      style={[
        styles.glassCard,
        {
          padding,
          backgroundColor: colors.card,
          borderColor: accent ? colors.accent : colors.border,
          borderWidth: accent ? 1.5 : 1,
          ...DesignTokens.shadow.level1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return (
      <PressableScale onPress={onPress} haptic="light">
        {inner}
      </PressableScale>
    );
  }
  return inner;
}

// ===========================================================================
// IconBadge  (rounded tinted icon container)
// ===========================================================================
export function IconBadge({ icon, color, size = 40, iconSize = 18 }: { icon: any; color: string; size?: number; iconSize?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: `${color}1c`, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon} size={iconSize} color={color} />
    </View>
  );
}

// ===========================================================================
// ListRow  (icon • label/subtitle • chevron or trailing node)
// ===========================================================================
export function ListRow({
  icon,
  iconColor,
  label,
  subtitle,
  onPress,
  trailing,
  danger,
  divider,
}: {
  icon?: any;
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
  divider?: boolean;
}) {
  const colors = useThemeColors();
  const t = useType();
  const tint = danger ? colors.danger : iconColor ?? colors.accent;
  return (
    <>
      <PressableScale onPress={onPress} haptic="light" scaleTo={0.98} accessibilityRole="button" accessibilityLabel={label}>
        <View style={styles.listRow}>
          {icon ? <IconBadge icon={icon} color={tint} size={38} iconSize={17} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={[t.bodyStrong, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
            {subtitle ? <Text style={[t.caption, { color: colors.textMuted, marginTop: 1 }]}>{subtitle}</Text> : null}
          </View>
          {trailing ?? <Feather name="chevron-right" size={18} color={colors.textMuted} />}
        </View>
      </PressableScale>
      {divider ? <View style={[styles.rowDivider, { backgroundColor: colors.border }]} /> : null}
    </>
  );
}

// ===========================================================================
// StatTile  (compact metric card)
// ===========================================================================
export function StatTile({
  icon,
  iconColor,
  value,
  label,
  onPress,
}: {
  icon?: any;
  iconColor?: string;
  value: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  const t = useType();
  const content = (
    <View style={[styles.statTile, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level1 }]}>
      {icon ? <Feather name={icon} size={20} color={iconColor ?? colors.accent} /> : null}
      <Text style={[t.number, { color: colors.text }]}>{value}</Text>
      <Text style={[t.caption, { color: colors.textSecondary, textAlign: 'center' }]}>{label}</Text>
    </View>
  );
  return onPress ? (
    <PressableScale onPress={onPress} haptic="light" style={{ flex: 1 }}>
      {content}
    </PressableScale>
  ) : (
    <View style={{ flex: 1 }}>{content}</View>
  );
}

// ===========================================================================
// HeaderIconButton  (for the `right` slot)
// ===========================================================================
export function HeaderIconButton({ icon, onPress, badge, label }: { icon: any; onPress?: () => void; badge?: boolean; label?: string }) {
  const colors = useThemeColors();
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Feather name={icon} size={20} color={colors.text} />
      {badge ? <View style={[styles.badgeDot, { backgroundColor: colors.danger, borderColor: colors.surface }]} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 16 },
  staticBody: { flex: 1 },
  headerRoot: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
  chrome: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerHairline: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1 },
  compactBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, overflow: 'hidden' },
  compactSide: { width: 96, justifyContent: 'center' },
  compactTitleWrap: { flex: 1, alignItems: 'center', overflow: 'hidden' },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  largeTitleWrap: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8, overflow: 'hidden' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeDot: { position: 'absolute', top: 9, right: 9, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 4 },
  glassCard: { borderRadius: DesignTokens.radius.extraLarge, borderWidth: 1 },
  glassClip: { overflow: 'hidden' },
  glassSheen: { position: 'absolute', top: 0, left: 14, right: 14, height: 1, borderRadius: 1, opacity: 0.85 },
  ambientGlow: { position: 'absolute', top: -80, left: -60, right: -60, height: 340 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, minHeight: 56, overflow: 'hidden' },
  rowDivider: { height: 1, marginLeft: 52 },
  statTile: {
    borderRadius: DesignTokens.radius.large,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
});
