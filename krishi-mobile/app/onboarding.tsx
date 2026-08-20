import React, { useState, useRef } from 'react';
import { StyleSheet, View, Animated, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme as useDeviceColorScheme, useThemeColors, useThemeToggle } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';

// Step components
import StepSplash from '@/components/onboarding/StepSplash';
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepFeatures from '@/components/onboarding/StepFeatures';
import StepLanguage from '@/components/onboarding/StepLanguage';
import StepPermissions from '@/components/onboarding/StepPermissions';
import StepAuth from '@/components/onboarding/StepAuth';
import StepOTP from '@/components/onboarding/StepOTP';
import StepProfile from '@/components/onboarding/StepProfile';
import StepPersonalization from '@/components/onboarding/StepPersonalization';
import StepSuccess from '@/components/onboarding/StepSuccess';

/**
 * Step order (language-first flow):
 *  1 Splash → 2 Language → 3 Welcome (Login / Sign Up)
 *  Sign Up: → 4 Features → 5 Permissions → 6 Auth → 7 OTP → 8 Profile → 9 Personalization → 10 Success → Dashboard
 *  Login:   → 6 Auth → 7 OTP → Dashboard
 *  Google:  → 8 Profile (name/email prefilled; land + past crops still asked) → 9 → 10 → Dashboard
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const deviceScheme = useDeviceColorScheme();
  const { setPreference } = useThemeToggle();
  const { language, setLanguage } = useLanguage();

  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [scheme, setScheme] = useState<'light' | 'dark'>(deviceScheme === 'dark' ? 'dark' : 'light');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string } | null>(null);

  const [profile, setProfile] = useState({
    fullName: '',
    village: '',
    district: '',
    state: '',
    farmSize: '',
    cropType: '',
    experience: '',
    pastCrops: '',
  });

  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Animation Refs — fade + horizontal slide between steps
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const stepRef = useRef(1);

  const transitionToStep = (nextStep: number) => {
    const forward = nextStep > stepRef.current;
    stepRef.current = nextStep;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: forward ? -48 : 48, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setCurrentStep(nextStep);
      slideAnim.setValue(forward ? 48 : -48);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStep < 10) {
      transitionToStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      transitionToStep(currentStep - 1);
    }
  };

  const handleGoToStep = (step: number) => {
    transitionToStep(step);
  };

  const handleToggleTheme = () => {
    setScheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleUpdateProfile = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleCrop = (cropName: string) => {
    setSelectedCrops(prev =>
      prev.includes(cropName) ? prev.filter(c => c !== cropName) : [...prev, cropName]
    );
  };

  const handleToggleGoal = (goalName: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalName) ? prev.filter(g => g !== goalName) : [...prev, goalName]
    );
  };

  const handleFinishOnboarding = () => {
    setPreference(scheme);
    router.replace('/(tabs)');
  };

  // Welcome screen: Sign Up walks the full flow, Login jumps straight to auth
  const handleSignUp = () => {
    setAuthMode('signup');
    transitionToStep(4);
  };

  const handleLogin = () => {
    setAuthMode('login');
    transitionToStep(6);
  };

  // Mock Google sign-in: fetch name/email from the Google account,
  // skip OTP, but still collect farm details (land, past crops) on the Profile step
  const handleGoogleAuth = () => {
    const mockGoogleAccount = { name: 'Manav Panchal', email: 'manav@gmail.com' };
    setGoogleUser(mockGoogleAccount);
    if (!profile.fullName) {
      setProfile(prev => ({ ...prev, fullName: mockGoogleAccount.name }));
    }
    transitionToStep(8);
  };

  // After OTP: returning users go straight to the dashboard,
  // new users continue to profile setup
  const handleOTPVerified = () => {
    if (authMode === 'login') {
      handleFinishOnboarding();
    } else {
      transitionToStep(8);
    }
  };

  // Render Step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepSplash
            language={language}
            scheme={scheme}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <StepLanguage
            language={language}
            scheme={scheme}
            onChangeLanguage={setLanguage}
            onNext={handleNext}
            onPrev={handlePrev}
            hideBack
          />
        );
      case 3:
        return (
          <StepWelcome
            language={language}
            scheme={scheme}
            onToggleTheme={handleToggleTheme}
            onSignUp={handleSignUp}
            onLogin={handleLogin}
            onGoToStep={handleGoToStep}
            onContinueAsGuest={handleFinishOnboarding}
          />
        );
      case 4:
        return (
          <StepFeatures
            language={language}
            scheme={scheme}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 5:
        return (
          <StepPermissions
            language={language}
            scheme={scheme}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 6:
        return (
          <StepAuth
            language={language}
            scheme={scheme}
            mode={authMode}
            phoneNumber={phoneNumber}
            onChangePhoneNumber={setPhoneNumber}
            onNext={handleNext}
            onPrev={handlePrev}
            onGoogleAuth={handleGoogleAuth}
            onContinueAsGuest={handleFinishOnboarding}
          />
        );
      case 7:
        return (
          <StepOTP
            language={language}
            scheme={scheme}
            phoneNumber={phoneNumber}
            onNext={handleOTPVerified}
            onPrev={handlePrev}
            onGoToStep={handleGoToStep}
          />
        );
      case 8:
        return (
          <StepProfile
            language={language}
            scheme={scheme}
            profile={profile}
            googleUser={googleUser}
            onChangeProfile={handleUpdateProfile}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 9:
        return (
          <StepPersonalization
            language={language}
            scheme={scheme}
            selectedCrops={selectedCrops}
            selectedGoals={selectedGoals}
            onChangeCrops={handleToggleCrop}
            onChangeGoals={handleToggleGoal}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 10:
        return (
          <StepSuccess
            language={language}
            scheme={scheme}
            onFinish={handleFinishOnboarding}
          />
        );
      default:
        return null;
    }
  };

  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Animated.View
        style={[
          styles.animatedContainer,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}
      >
        {renderStepContent()}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
});
