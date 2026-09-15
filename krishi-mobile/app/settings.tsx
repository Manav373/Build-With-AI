import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType, useThemeToggle } from '@/hooks/useColorScheme';
import { useLanguage, useUIStrings } from '@/hooks/useLanguage';
import { Languages, LanguageKey } from '@/constants/Translations';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, SectionTitle, GlassCard, ListRow } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { Switch } from '@/components/ui/FormPrimitives';

export default function SettingsScreen() {
  const { theme: scheme, toggleTheme } = useThemeToggle();
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();
  const isDarkMode = scheme === 'dark';

  const [notifications, setNotifications] = useState(true);
  const [voiceAssist, setVoiceAssist] = useState(true);
  const { language: activeLang, setLanguage } = useLanguage();
  const ui = useUIStrings();
  const [applyingLang, setApplyingLang] = useState(false);
  const go = (r: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); router.push(r as any); };

  const changeLanguage = (code: LanguageKey) => {
    if (code === activeLang || applyingLang) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setApplyingLang(true);
    // Brief overlay so the whole-app text swap feels intentional, not glitchy
    setTimeout(() => {
      setLanguage(code);
      setTimeout(() => setApplyingLang(false), 450);
    }, 250);
  };

  const handleClearCache = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert('Clear Cache', 'Reclaim disk space used by offline maps and mandi caches?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Cleared', 'Cache cleared successfully.') },
    ]);
  };

  return (
    <>
    <Screen title={ui.settings_title} emoji="⚙️" subtitle={ui.settings_subtitle} back>
      {/* Profile Card */}
      <FadeInUp index={0}>
        <GlassCard>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.green }]}>
              <Feather name="user" size={22} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[t.bodyStrong, { color: colors.text }]}>Farmer Profile</Text>
              <Text style={[t.caption, { color: colors.textSecondary, marginTop: 1 }]}>pro.farmer@krishiai.in</Text>
            </View>
          </View>
        </GlassCard>
      </FadeInUp>

      <SectionTitle>{ui.sec_ecosystem}</SectionTitle>
      <FadeInUp index={1}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            <ListRow icon="home" iconColor={colors.accent} label={ui.row_farms} onPress={() => go('/farms')} divider />
            <ListRow icon="cpu" iconColor={colors.info} label={ui.row_ai} onPress={() => go('/ai-personalization')} divider />
            <ListRow icon="alert-triangle" iconColor={colors.danger} label={ui.row_sos} danger onPress={() => go('/emergency')} divider />
            <ListRow icon="refresh-cw" iconColor={colors.green} label={ui.row_sync} onPress={() => go('/sync-status')} />
          </View>
        </GlassCard>
      </FadeInUp>

      <SectionTitle>{ui.sec_preferences}</SectionTitle>
      <FadeInUp index={2}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            <ListRow icon="moon" iconColor="#8b5cf6" label={ui.row_dark} subtitle={ui.row_dark_sub} trailing={<Switch value={isDarkMode} onValueChange={toggleTheme} />} divider />
            <ListRow icon="bell" iconColor={colors.warning} label={ui.row_alerts} subtitle={ui.row_alerts_sub} trailing={<Switch value={notifications} onValueChange={setNotifications} />} divider />
            <ListRow icon="volume-2" iconColor={colors.accent} label={ui.row_voice} subtitle={ui.row_voice_sub} trailing={<Switch value={voiceAssist} onValueChange={setVoiceAssist} />} />
          </View>
        </GlassCard>
      </FadeInUp>

      <SectionTitle>{ui.sec_security}</SectionTitle>
      <FadeInUp index={3}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            <ListRow icon="lock" iconColor="#3b82f6" label={ui.row_privacy} onPress={() => go('/privacy-security')} divider />
            <ListRow icon="info" iconColor="#64748b" label={ui.row_about} onPress={() => go('/about')} divider />
            <ListRow icon="trash-2" iconColor={colors.danger} label={ui.row_cache} danger onPress={handleClearCache} />
          </View>
        </GlassCard>
      </FadeInUp>

      <SectionTitle>{ui.sec_language}</SectionTitle>
      <FadeInUp index={4}>
        <GlassCard padding={4}>
          <View style={{ paddingHorizontal: 14 }}>
            {Languages.map((lang, index) => {
              const on = activeLang === lang.code;
              const displayName = lang.code === 'en' ? lang.name : `${lang.nativeName} (${lang.name})`;
              return (
                <View key={lang.code}>
                  <PressableScale onPress={() => changeLanguage(lang.code)} haptic="light" style={styles.langRow} accessibilityLabel={displayName}>
                    <Text style={[t.body, { color: on ? colors.accent : colors.text, fontWeight: on ? '800' : '600' }]}>{displayName}</Text>
                    {on && <Feather name="check" size={18} color={colors.accent} />}
                  </PressableScale>
                  {index < Languages.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              );
            })}
          </View>
        </GlassCard>
      </FadeInUp>
    </Screen>

    {/* Language-applying overlay */}
    {applyingLang && (
      <View style={[styles.langOverlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.langOverlayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[t.bodyStrong, { color: colors.text, textAlign: 'center' }]}>{ui.applying_language}</Text>
        </View>
      </View>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, gap: 12 },
  divider: { height: 1 },
  langOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  langOverlayCard: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    gap: 14,
    minWidth: 200,
  },
});
