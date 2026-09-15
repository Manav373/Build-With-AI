import React from 'react';
import { View, Pressable, StyleSheet, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors, useColorScheme } from '@/hooks/useColorScheme';
import { useUIStrings, UIStrings } from '@/hooks/useLanguage';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';

interface MenuItem {
  id: string;
  icon: string;
  labelKey: keyof UIStrings;
  color: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'crops', icon: 'leaf', labelKey: 'menu_crops', color: '#4ade80', route: '/(tabs)/crops' },
  { id: 'irrigation', icon: 'droplet', labelKey: 'menu_irrigation', color: '#06b6d4', route: '/irrigation' },
  { id: 'chat', icon: 'message-circle', labelKey: 'menu_chat', color: '#3b82f6', route: '/(tabs)/chat' },
  { id: 'profile', icon: 'user', labelKey: 'menu_profile', color: '#8b5cf6', route: '/(tabs)/profile' },
  { id: 'weather', icon: 'cloud', labelKey: 'menu_weather', color: '#0ea5e9', route: '/weather' },
  { id: 'predict', icon: 'trending-up', labelKey: 'menu_predict', color: '#a855f7', route: '/predict' },
  { id: 'schemes', icon: 'award', labelKey: 'menu_schemes', color: '#ec4899', route: '/schemes' },
  { id: 'community', icon: 'users', labelKey: 'menu_community', color: '#f59e0b', route: '/community' },
  { id: 'satellite', icon: 'globe', labelKey: 'menu_satellite', color: '#10b981', route: '/satellite' },
  { id: 'settings', icon: 'settings', labelKey: 'menu_settings', color: '#94a3b8', route: '/settings' },
];

interface MoreDropUpProps {
  visible: boolean;
  onClose: () => void;
}

export function MoreDropUp({ visible, onClose }: MoreDropUpProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const ui = useUIStrings();
  const dark = scheme === 'dark';

  if (!visible) return null;

  const handleItemPress = (route: string) => {
    onClose();
    Haptics.selectionAsync?.().catch(() => {});
    router.push(route as any);
  };

  const bottomOffset = (Platform.OS === 'ios' ? insets.bottom + 8 : 16) + 66 + 14;

  const panelInner = (
    <>
      {/* Grabber handle */}
      <View style={[styles.grabber, { backgroundColor: dark ? 'rgba(160, 240, 200, 0.25)' : 'rgba(20, 83, 45, 0.18)' }]} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{ui.quick_tools}</Text>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={[styles.closeButton, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(20,83,45,0.06)' }]}
        >
          <Feather name="x" size={15} color={dark ? '#a3c2ae' : '#4d6054'} />
        </Pressable>
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        {MENU_ITEMS.map((item, index) => (
          <View key={item.id} style={styles.gridCell}>
            <FadeInUp index={index}>
              <GridTile
                item={item}
                label={ui[item.labelKey]}
                dark={dark}
                textColor={colors.text}
                onPress={() => handleItemPress(item.route)}
              />
            </FadeInUp>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false}>
      <View
        style={[styles.scrim, { backgroundColor: dark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(11, 22, 16, 0.35)' }]}
        pointerEvents="none"
      />

      <Pressable
        pointerEvents="auto"
        style={[styles.panelContainer, { bottom: bottomOffset }]}
        onPress={(e: any) => e.stopPropagation()}
      >
        {Platform.OS === 'android' ? (
          <View
            style={[
              styles.panel,
              {
                backgroundColor: dark ? 'rgba(14, 24, 18, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: dark ? 'rgba(120, 220, 170, 0.22)' : 'rgba(255, 255, 255, 0.7)',
              },
            ]}
          >
            <View style={[styles.sheen, { backgroundColor: dark ? 'rgba(160, 240, 200, 0.18)' : 'rgba(255, 255, 255, 0.9)' }]} pointerEvents="none" />
            {panelInner}
          </View>
        ) : (
          <BlurView
            intensity={Platform.OS === 'ios' ? 60 : 44}
            tint={dark ? 'dark' : 'light'}
            style={[
              styles.panel,
              {
                backgroundColor: dark ? 'rgba(14, 24, 18, 0.78)' : 'rgba(255, 255, 255, 0.72)',
                borderColor: dark ? 'rgba(120, 220, 170, 0.22)' : 'rgba(255, 255, 255, 0.7)',
                ...(Platform.OS === 'web'
                  ? ({ backdropFilter: 'blur(24px) saturate(1.4)' } as any)
                  : null),
              },
            ]}
          >
            <View style={[styles.sheen, { backgroundColor: dark ? 'rgba(160, 240, 200, 0.18)' : 'rgba(255, 255, 255, 0.9)' }]} pointerEvents="none" />
            {panelInner}
          </BlurView>
        )}
      </Pressable>
    </Pressable>
  );
}

function GridTile({
  item,
  label,
  dark,
  textColor,
  onPress,
}: {
  item: MenuItem;
  label: string;
  dark: boolean;
  textColor: string;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} style={styles.gridTile} haptic="light">
      <View
        style={[
          styles.iconChip,
          {
            backgroundColor: item.color + (dark ? '1f' : '17'),
            borderColor: item.color + (dark ? '38' : '26'),
          },
        ]}
      >
        <Feather name={item.icon as any} size={22} color={item.color} />
      </View>
      <Text style={[styles.gridLabel, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  panelContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 14,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    borderRadius: 1,
    opacity: 0.85,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  gridCell: {
    width: '33.33%',
    alignItems: 'center',
  },
  gridTile: {
    alignItems: 'center',
    gap: 7,
    width: 92,
    overflow: 'hidden',
  },
  iconChip: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    textAlign: 'center',
  },
});
