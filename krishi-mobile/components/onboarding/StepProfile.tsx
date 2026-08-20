import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LanguageKey, Translations } from '@/constants/Translations';
import { STATES, CROP_LIST } from '@/constants/Config';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

interface StepProfileProps {
  language: LanguageKey;
  scheme: 'light' | 'dark';
  profile: {
    fullName: string;
    village: string;
    district: string;
    state: string;
    farmSize: string;
    cropType: string;
    experience: string;
    pastCrops: string;
  };
  googleUser: { name: string; email: string } | null;
  onChangeProfile: (field: string, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function StepProfile({
  language,
  scheme,
  profile,
  googleUser,
  onChangeProfile,
  onNext,
  onPrev,
}: StepProfileProps) {
  const colors = Colors[scheme];
  const t = Translations[language];

  // Dropdown visibility states
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      // Fallback mock image on web / simulator failure
      setAvatarUri('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=200');
    }
  };

  const handleSelectState = (stateName: string) => {
    onChangeProfile('state', stateName);
    setShowStateDropdown(false);
  };

  const handleSelectCrop = (cropName: string) => {
    onChangeProfile('cropType', cropName);
    setShowCropDropdown(false);
  };

  // Past crops stored as a comma-separated list; chips toggle membership
  const pastCropList = profile.pastCrops ? profile.pastCrops.split(',') : [];

  const handleTogglePastCrop = (cropName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const next = pastCropList.includes(cropName)
      ? pastCropList.filter(c => c !== cropName)
      : [...pastCropList, cropName];
    onChangeProfile('pastCrops', next.join(','));
  };

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    callback();
  };

  const isFormValid = profile.fullName.trim().length > 2 && profile.state !== '';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => handlePress(onPrev)}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.titleText, { color: colors.text }]}>{t.profile_title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Onboarding Progress Indicator (80% Complete) */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Profile Setup</Text>
          <Text style={[styles.progressPercent, { color: colors.accent }]}>80% Complete</Text>
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceElevated }]}>
          <View style={[styles.progressBarFill, { backgroundColor: colors.accent }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Google account banner — name/email pulled in, farm details still required */}
        {googleUser && (
          <View style={[styles.googleBanner, { backgroundColor: colors.accentSoft ?? `${colors.accent}18`, borderColor: colors.accent }]}>
            <Feather name="check-circle" size={18} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.googleBannerTitle, { color: colors.text }]}>{t.google_fetched}</Text>
              <Text style={[styles.googleBannerEmail, { color: colors.textSecondary }]}>{googleUser.email}</Text>
            </View>
          </View>
        )}

        {/* Profile Avatar Upload */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={[styles.avatarFrame, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong }]}
            onPress={handlePickImage}
            activeOpacity={0.85}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Feather name="user" size={48} color={colors.textMuted} />
            )}
            <View style={[styles.avatarCameraBadge, { backgroundColor: colors.accent }]}>
              <Feather name="camera" size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: colors.textMuted }]}>Add farm photo or portrait</Text>
        </View>

        {/* Inputs Form */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.full_name} *</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.surface, borderColor: colors.borderStrong, color: colors.text }]}
              placeholder="e.g., Rajesh Kumar"
              placeholderTextColor={colors.textMuted}
              value={profile.fullName}
              onChangeText={(val: string) => onChangeProfile('fullName', val)}
            />
          </View>

          {/* Village */}
          <View style={styles.inputGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.village}</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.surface, borderColor: colors.borderStrong, color: colors.text }]}
              placeholder="e.g., Rampur"
              placeholderTextColor={colors.textMuted}
              value={profile.village}
              onChangeText={(val: string) => onChangeProfile('village', val)}
            />
          </View>

          {/* District */}
          <View style={styles.inputGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.district}</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.surface, borderColor: colors.borderStrong, color: colors.text }]}
              placeholder="e.g., Karnal"
              placeholderTextColor={colors.textMuted}
              value={profile.district}
              onChangeText={(val: string) => onChangeProfile('district', val)}
            />
          </View>

          {/* State Dropdown Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.state} *</Text>
            <TouchableOpacity
              style={[styles.dropdownTrigger, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}
              onPress={() => setShowStateDropdown(!showStateDropdown)}
              activeOpacity={0.8}
            >
              <Text style={{ color: profile.state ? colors.text : colors.textMuted, fontWeight: '700' }}>
                {profile.state || 'Select State'}
              </Text>
              <Feather name={showStateDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {showStateDropdown && (
              <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
                <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                  {STATES.map(stateName => (
                    <TouchableOpacity
                      key={stateName}
                      style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                      onPress={() => handleSelectState(stateName)}
                    >
                      <Text style={[styles.dropdownItemText, { color: colors.text }]}>{stateName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Primary Crop Dropdown Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.crop_type}</Text>
            <TouchableOpacity
              style={[styles.dropdownTrigger, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}
              onPress={() => setShowCropDropdown(!showCropDropdown)}
              activeOpacity={0.8}
            >
              <Text style={{ color: profile.cropType ? colors.text : colors.textMuted, fontWeight: '700' }}>
                {profile.cropType || 'Select Crop'}
              </Text>
              <Feather name={showCropDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {showCropDropdown && (
              <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
                <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                  {CROP_LIST.map(cropName => (
                    <TouchableOpacity
                      key={cropName}
                      style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                      onPress={() => handleSelectCrop(cropName)}
                    >
                      <Text style={[styles.dropdownItemText, { color: colors.text }]}>{cropName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Farm Size & Experience side-by-side */}
          <View style={styles.rowFields}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.farm_size}</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.surface, borderColor: colors.borderStrong, color: colors.text }]}
                placeholder="Acres"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={profile.farmSize}
                onChangeText={(val: string) => onChangeProfile('farmSize', val)}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.experience}</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.surface, borderColor: colors.borderStrong, color: colors.text }]}
                placeholder="Years"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={profile.experience}
                onChangeText={(val: string) => onChangeProfile('experience', val)}
              />
            </View>
          </View>

          {/* Crops grown in past few years — multi-select chips */}
          <View style={styles.inputGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.past_crops}</Text>
            <View style={styles.chipWrap}>
              {CROP_LIST.map(cropName => {
                const selected = pastCropList.includes(cropName);
                return (
                  <TouchableOpacity
                    key={cropName}
                    style={[
                      styles.cropChip,
                      {
                        backgroundColor: selected ? colors.accent : colors.surface,
                        borderColor: selected ? colors.accent : colors.borderStrong,
                      },
                    ]}
                    onPress={() => handleTogglePastCrop(cropName)}
                    activeOpacity={0.8}
                  >
                    {selected && <Feather name="check" size={13} color="#ffffff" />}
                    <Text style={[styles.cropChipText, { color: selected ? '#ffffff' : colors.text }]}>
                      {cropName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, { opacity: isFormValid ? 1 : 0.65 }]}
          onPress={() => handlePress(onNext)}
          disabled={!isFormValid}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueBtnText}>{t.continue_btn}</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  progressSection: {
    marginTop: 16,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    width: '80%', // 80% Complete
  },
  scrollContent: {
    paddingVertical: 20,
    gap: 24,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatarFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
    position: 'relative',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  fieldInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownTrigger: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownList: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    maxHeight: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdownScroll: {
    paddingHorizontal: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 16,
  },
  googleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  googleBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  googleBannerEmail: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  cropChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    width: '100%',
    paddingTop: 8,
  },
  continueBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  continueGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
