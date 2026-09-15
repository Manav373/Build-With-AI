import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider as AppThemeProvider, useColorScheme } from '@/hooks/useColorScheme';
import { LanguageProvider } from '@/hooks/useLanguage';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();

  const isWebDesktop = Platform.OS === 'web' && windowWidth > 600;

  const appContent = (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {isWebDesktop ? (
        <View style={styles.webContainer}>
          <View style={styles.phoneFrame}>
            <View style={styles.screenWrapper}>
              {appContent}
            </View>
          </View>
        </View>
      ) : (
        appContent
      )}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <LanguageProvider>
        <RootLayoutContent />
      </LanguageProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0c0f12', // soft slate olive dark backdrop
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw' as any,
    height: '100vh' as any,
  },
  phoneFrame: {
    width: 393,
    height: 852,
    borderRadius: 50,
    borderWidth: 12,
    borderColor: '#1e293b',
    overflow: 'hidden',
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 24,
  },
  screenWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
});
