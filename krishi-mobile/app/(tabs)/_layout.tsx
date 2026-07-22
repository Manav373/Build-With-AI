import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, View, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme, useThemeColors } from '@/hooks/useColorScheme';
import { useUIStrings } from '@/hooks/useLanguage';
import { MoreDropUp } from '@/components/ui/MoreDropUp';

// Custom Tab Bar Component - Floating Liquid Glass Capsule with Center Action Button (iOS Style)
function CustomTabBar({ state, descriptors, navigation, menuOpen, onToggleMenu }: any) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ui = useUIStrings();

  // Translated tab labels keyed by route name
  const tabLabels: Record<string, string> = {
    index: ui.tab_home,
    market: ui.tab_market,
    scan: ui.tab_scan,
    voice: ui.tab_voice,
    more: ui.tab_more,
  };

  // We display 5 tabs: Home, Market, Scan (Center), Voice, More
  const visibleRoutes = state.routes.slice(0, 5);

  return (
    <View style={[
      styles.tabBarWrapper,
      { bottom: Platform.OS === 'ios' ? insets.bottom + 8 : 16 }
    ]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 100 : 90}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: scheme === 'dark' ? 'rgba(18, 30, 23, 0.55)' : 'rgba(255, 255, 255, 0.62)',
            borderColor: scheme === 'dark' ? 'rgba(120, 220, 170, 0.18)' : 'rgba(255, 255, 255, 0.65)',
          }
        ]}
      >
        {/* Specular sheen on the upper side — the "liquid glass" highlight */}
        <View style={[
          styles.glassSheen,
          {
            backgroundColor: scheme === 'dark' ? 'rgba(160, 240, 200, 0.22)' : 'rgba(255, 255, 255, 0.9)',
          }
        ]} pointerEvents="none" />

        {visibleRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = tabLabels[route.name] ?? options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            // "More" button opens the menu instead of navigating
            if (route.name === 'more') {
              onToggleMenu();
              Haptics.selectionAsync?.().catch(() => {});
              return;
            }

            // "Voice" pushes the full-screen assistant so back returns here
            if (route.name === 'voice') {
              Haptics.selectionAsync?.().catch(() => {});
              router.push('/voice-assistant' as any);
              return;
            }

            Haptics.selectionAsync?.().catch(() => {});
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const activeColor = scheme === 'dark' ? '#4ade80' : '#0e7a3d';
          const inactiveColor = scheme === 'dark' ? '#799a84' : '#6b7f72';
          const isCenterAction = route.name === 'scan';
          const isMoreButton = route.name === 'more';

          if (isCenterAction) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={({ pressed, hovered }: any) => [
                  styles.centerActionItem,
                  {
                    transform: [{ scale: pressed ? 0.92 : hovered ? 1.08 : 1 }],
                    cursor: Platform.select({ web: 'pointer', default: undefined }),
                  }
                ]}>
                <View style={[
                  styles.centerActionButton,
                  {
                    backgroundColor: scheme === 'dark' ? '#10b981' : '#0e7a3d',
                    borderColor: colors.background,
                    shadowColor: scheme === 'dark' ? '#10b981' : '#0e7a3d',
                  }
                ]}>
                  {options.tabBarIcon?.({
                    color: '#ffffff',
                    size: 24,
                  })}
                </View>
                <Text style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? activeColor : inactiveColor,
                    fontWeight: isFocused ? '700' : '500',
                    marginTop: 3,
                  }
                ]}>
                  {label}
                </Text>
              </Pressable>
            );
          }

          if (isMoreButton) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={({ pressed, hovered }: any) => [
                  styles.tabItem,
                  {
                    opacity: menuOpen ? 1 : hovered ? 0.85 : 0.6,
                    transform: [{ scale: pressed ? 0.94 : hovered ? 1.05 : 1 }],
                    cursor: Platform.select({ web: 'pointer', default: undefined }),
                  } as any
                ]}>
                <View style={[
                  styles.iconContainer,
                  menuOpen && {
                    backgroundColor: scheme === 'dark' ? 'rgba(74, 222, 128, 0.08)' : 'rgba(14, 122, 61, 0.06)'
                  }
                ]}>
                  {options.tabBarIcon?.({
                    color: menuOpen ? activeColor : inactiveColor,
                    size: 21,
                  })}
                </View>
                <Text style={[
                  styles.tabLabel,
                  {
                    color: menuOpen ? activeColor : inactiveColor,
                    fontWeight: menuOpen ? '700' : '500',
                  }
                ]}>
                  {label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed, hovered }: any) => [
                styles.tabItem,
                ({
                  opacity: isFocused ? 1 : hovered ? 0.85 : 0.6,
                  transform: [{ scale: pressed ? 0.94 : hovered ? 1.05 : 1 }],
                  cursor: Platform.select({ web: 'pointer', default: undefined }),
                } as any)
              ]}>
              <View style={[
                styles.iconContainer,
                isFocused && {
                  backgroundColor: scheme === 'dark' ? 'rgba(74, 222, 128, 0.08)' : 'rgba(14, 122, 61, 0.06)'
                }
              ]}>
                {options.tabBarIcon?.({
                  color: isFocused ? activeColor : inactiveColor,
                  size: 21,
                })}
              </View>
              <Text style={[
                styles.tabLabel,
                {
                  color: isFocused ? activeColor : inactiveColor,
                  fontWeight: isFocused ? '700' : '500',
                }
              ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: 'transparent',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 66,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'visible',
  },
  glassSheen: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    borderRadius: 1,
    opacity: 0.8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  centerActionItem: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20, // pulls center action up
  },
  centerActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  iconContainer: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.1,
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            menuOpen={menuOpen}
            onToggleMenu={() => setMenuOpen((v: boolean) => !v)}
          />
        )}
        screenOptions={{
          tabBarActiveTintColor: '#4ade80',
          tabBarInactiveTintColor: '#666',
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="storefront.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="camera.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="voice"
        options={{
          title: 'Voice',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="mic.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      {/* Hide these from tab bar */}
      <Tabs.Screen name="crops" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>

      {/* Drop-up overlay rendered at screen level so it covers the full viewport */}
      <MoreDropUp visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}
