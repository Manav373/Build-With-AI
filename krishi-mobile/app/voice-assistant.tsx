import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage, useScreenStrings } from '@/hooks/useLanguage';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { VoiceWave, Pulse } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import { sendChatMessage } from '@/services/api';
import { getPhoneId } from '@/services/session';
import { useLocation } from '@/hooks/useLocation';

const { width } = Dimensions.get('window');

const STRINGS = {
  en: {
    offlineIndicator: 'Offline Voice Active',
    krishiAIAnswer: 'KrishiAI Answer',
    listeningBase: "Listening... 'When should I harvest my wheat?'",
    listeningHi: "सुन रहा हूँ... 'गेहूं की कटाई कब करें?'",
    listeningGu: "સાંભળી રહ્યું છે... 'ઘઉંની લણણી ક્યારે કરવી?'",
    listeningMr: "ऐकत आहे... 'गव्हाची कापणी कधी करावी?'",
    transcriptBase: "'When should I harvest my wheat?'",
    listening: 'Listening...',
    thinkingReply: 'Your wheat crops are at maturity. Keep soil dry. Harvest is recommended in the next 3 to 5 days, during clear sunny conditions.',
    tapMic: 'Tap mic to speak',
    langEN: 'EN',
    langHI: 'हिंदी',
    langGU: 'ગુજરાતી',
    langMR: 'मराठी',
  },
  hi: {
    offlineIndicator: 'ऑफलाइन वॉयस सक्रिय',
    krishiAIAnswer: 'कृषिAI उत्तर',
    listeningBase: "सुन रहा हूँ... 'गेहूं की कटाई कब करें?'",
    listeningHi: "सुन रहा हूँ... 'गेहूं की कटाई कब करें?'",
    listeningGu: "સાંભળી રહ્યું છે... 'ઘઉંની લણણી ક્યારે કરવી?'",
    listeningMr: "ऐकत आहे... 'गव्हाची कापणी कधी करावी?'",
    transcriptBase: "'गेहूं की कटाई कब करें?'",
    listening: 'सुन रहा हूँ...',
    thinkingReply: 'आपकी गेहूं की फसल परिपक्व अवस्था में है। मिट्टी को सूखा रखें। अगले 3 से 5 दिनों में, स्पष्ट धूप की स्थिति में कटाई की सिफारिश की जाती है।',
    tapMic: 'बोलने के लिए माइक टैप करें',
    langEN: 'EN',
    langHI: 'हिंदी',
    langGU: 'ગુજરાતી',
    langMR: 'मराठी',
  },
  gu: {
    offlineIndicator: 'ઓફલાઇન વૉઇસ સક્રિય',
    krishiAIAnswer: 'કૃષિAI જવાબ',
    listeningBase: "સાંભળી રહ્યું છે... 'ઘઉંની લણણી ક્યારે કરવી?'",
    listeningHi: "સાંભળી રહ્યું છે... 'હિંદી પ્રશ્ન'",
    listeningGu: "સાંભળી રહ્યું છે... 'ઘઉંની લણણી ક્યારે કરવી?'",
    listeningMr: "સાંભળી રહ્યું છે... 'માર્ટી પ્રશ્ન'",
    transcriptBase: "'ઘઉંની લણણી ક્યારે કરવી?'",
    listening: 'સાંભળી રહ્યું છે...',
    thinkingReply: 'તમારી ઘઉંની પાક પરિપક્વતા પર છે. જમીનને શુષ્ક રાખો. આગલા 3 થી 5 દિવસમાં, સ્પષ્ટ સૂર્યપ્રકાશ સ્થિતિમાં લણણીની ભલમણ કરવામાં આવે છે.',
    tapMic: 'બોલવા માટે માઇક ટ્যાપ કરો',
    langEN: 'EN',
    langHI: 'હિંદી',
    langGU: 'ગુજરાતી',
    langMR: 'મરાઠી',
  },
  mr: {
    offlineIndicator: 'ऑफलाइन व्हॉइस सक्रिय',
    krishiAIAnswer: 'कृषीAI उत्तर',
    listeningBase: "ऐकत आहे... 'गव्हाची कापणी कधी करावी?'",
    listeningHi: "ऐकत आहे... 'हिंदी प्रश्न'",
    listeningGu: "ऐकत आहे... 'गुजराती प्रश्न'",
    listeningMr: "ऐकत आहे... 'गव्हाची कापणी कधी करावी?'",
    transcriptBase: "'गव्हाची कापणी कधी करावी?'",
    listening: 'ऐकत आहे...',
    thinkingReply: 'तुमची गव्हाची पिक परिपक्व स्थितीत आहे. जमिनी सुकीच ठेवा. पुढील 3 ते 5 दिवसात, स्पष्ट सूर्यप्रकाशात कापणीची शिफारस केली जाते.',
    tapMic: 'बोलण्यासाठी मायक टॅप करा',
    langEN: 'EN',
    langHI: 'हिंदी',
    langGU: 'ગુજરાતી',
    langMR: 'मराठी',
  },
};

export default function VoiceAssistantScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const router = useRouter();
  const { location } = useLocation();

  // Assistant States
  const { language: globalLang } = useLanguage();
  const s = useScreenStrings(STRINGS as any);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('listening');
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'gu' | 'mr'>(
    globalLang === 'hi' || globalLang === 'gu' || globalLang === 'mr' ? globalLang : 'en'
  );
  const [transcript, setTranscript] = useState(s.listeningBase);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [phoneId, setPhoneId] = useState<string>('');

  // Animations
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  const thinkingRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getPhoneId().then(setPhoneId).catch(() => setPhoneId('user_demo_123'));
  }, []);

  useEffect(() => {
    let animLoop: any;
    if (status === 'listening') {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse1, { toValue: 1.6, duration: 1500, useNativeDriver: true }),
            Animated.timing(pulse1, { toValue: 1.0, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(pulse2, { toValue: 1.8, duration: 1500, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1.0, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(800),
            Animated.timing(pulse3, { toValue: 2.0, duration: 1500, useNativeDriver: true }),
            Animated.timing(pulse3, { toValue: 1.0, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
      animLoop.start();
    } else {
      pulse1.setValue(1);
      pulse2.setValue(1);
      pulse3.setValue(1);
    }
    return () => animLoop?.stop();
  }, [status]);

  useEffect(() => {
    let rotateLoop: any;
    if (status === 'thinking') {
      rotateLoop = Animated.loop(
        Animated.timing(thinkingRotate, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      );
      rotateLoop.start();
    } else {
      thinkingRotate.setValue(0);
    }
    return () => rotateLoop?.stop();
  }, [status]);

  // Simulate speaking trigger after 3s of listening
  useEffect(() => {
    if (status === 'listening') {
      const timer = setTimeout(() => {
        setStatus('thinking');
        setTranscript(s.transcriptBase);

        // Thinking state, then call API
        setTimeout(async () => {
          if (!phoneId) {
            setStatus('speaking');
            setAiReply(s.thinkingReply);
            return;
          }
          try {
            const response = await sendChatMessage(
              phoneId,
              s.transcriptBase.replace(/^'|'$/g, ''),
              location?.lat ?? undefined,
              location?.lon ?? undefined,
              []
            );
            const replyText = response.response ?? response.reply ?? response.message ?? s.thinkingReply;
            setStatus('speaking');
            setAiReply(replyText);
          } catch {
            setStatus('speaking');
            setAiReply(s.thinkingReply);
          }
        }, 1500);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [status, s, phoneId, location]);

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (status === 'speaking' || status === 'thinking') {
      setStatus('listening');
      setAiReply(null);
      setTranscript(s.listening);
    } else if (status === 'listening') {
      setStatus('idle');
      setTranscript(s.tapMic);
    } else {
      setStatus('listening');
      setTranscript(s.listening);
    }
  };

  const handleLangSelect = (code: 'en' | 'hi' | 'gu' | 'mr') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedLang(code);
    if (code === 'hi') setTranscript(s.listeningHi);
    else if (code === 'gu') setTranscript(s.listeningGu);
    else if (code === 'mr') setTranscript(s.listeningMr);
    else setTranscript(s.listeningBase);
  };

  const rotation = thinkingRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Immersive Background */}
      <LinearGradient
        colors={scheme === 'dark' ? ['#050e07', '#0d2212', '#050e07'] : ['#f0fdf4', '#e8f5e9', '#ffffff']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            if ((router as any).canGoBack?.() === false) {
              router.replace('/(tabs)' as any);
            } else {
              router.back();
            }
          }}
          activeOpacity={0.8}
        >
          <Feather name="x" size={20} color={colors.text} />
        </TouchableOpacity>
        
        {/* Offline indicator */}
        <View style={[styles.offlineBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Feather name="zap" size={12} color={colors.accent} />
          <Text numberOfLines={1} style={[styles.offlineText, { color: colors.textSecondary }]}>{s.offlineIndicator}</Text>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Language row */}
      <View style={styles.langRow}>
        {(['en', 'hi', 'gu', 'mr'] as const).map(lang => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.langChip,
              {
                backgroundColor: selectedLang === lang ? colors.accent : colors.surface,
                borderColor: selectedLang === lang ? 'transparent' : colors.border,
              },
            ]}
            onPress={() => handleLangSelect(lang)}
            activeOpacity={0.8}
          >
            <Text style={[styles.langChipText, { color: selectedLang === lang ? '#ffffff' : colors.text }]}>
              {lang === 'en' ? s.langEN : lang === 'hi' ? s.langHI : lang === 'gu' ? s.langGU : s.langMR}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Center Voice Wave & Mic Pulsing area */}
      <View style={styles.waveContainer}>
        {status === 'listening' && (
          <Pulse active style={styles.rippleLayer}>
            <>
              <Animated.View style={[styles.ripple, { borderColor: `${colors.accent}30`, transform: [{ scale: pulse3 }] }]} />
              <Animated.View style={[styles.ripple, { borderColor: `${colors.accent}40`, transform: [{ scale: pulse2 }] }]} />
              <Animated.View style={[styles.ripple, { borderColor: `${colors.accent}50`, transform: [{ scale: pulse1 }] }]} />
            </>
          </Pulse>
        )}

        {status === 'thinking' && (
          <Pulse active style={styles.rippleLayer}>
            <Animated.View style={[styles.thinkingCircle, { borderColor: colors.warning, transform: [{ rotate: rotation }] }]}>
              <LinearGradient
                colors={['#f59e0b', 'transparent']}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          </Pulse>
        )}

        <TouchableOpacity
          style={[
            styles.micBtn,
            {
              backgroundColor: status === 'speaking' ? colors.green : status === 'thinking' ? colors.warning : colors.accent,
              shadowColor: colors.accent,
            },
          ]}
          onPress={handleMicPress}
          activeOpacity={0.9}
        >
          {status === 'thinking' ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            <Feather 
              name={status === 'speaking' ? 'volume-2' : status === 'listening' ? 'mic' : 'mic-off'} 
              size={36} 
              color="#ffffff" 
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Transcript and Response Panel */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 24 }]}>
        {/* User live transcript */}
        <Text style={[styles.transcriptText, { color: colors.text }]}>
          {transcript}
        </Text>

        {/* AI Response Card */}
        {aiReply && (
          <LinearGradient
            colors={scheme === 'dark' ? ['#0d2212', '#07180b'] : ['#ffffff', '#f8faf7']}
            style={[styles.replyCard, { borderColor: colors.border }]}
          >
            <View style={styles.replyHeader}>
              <View style={styles.replyBrand}>
                <Text style={{ fontSize: 16 }}>🌾</Text>
                <Text numberOfLines={1} style={[styles.replyBrandText, { color: colors.text }]}>{s.krishiAIAnswer}</Text>
              </View>
              <View style={styles.replyControls}>
                <TouchableOpacity
                  style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setIsMuted(!isMuted);
                  }}
                >
                  <Feather name={isMuted ? 'volume-x' : 'volume-2'} size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.replyText, { color: colors.text }]}>{aiReply}</Text>
          </LinearGradient>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    flexShrink: 1,
  },
  offlineText: { fontSize: 11, fontWeight: '700' },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  langChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  langChipText: { fontSize: 13, fontWeight: '700' },
  waveContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rippleLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  thinkingCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  micBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    ...DesignTokens.shadow.level3,
  },
  bottomPanel: {
    paddingHorizontal: 24,
    gap: 20,
  },
  transcriptText: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 28,
    marginVertical: 10,
  },
  replyCard: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    gap: 12,
    ...DesignTokens.shadow.level1,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  replyBrand: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  replyBrandText: { fontSize: 14, fontWeight: '800', flexShrink: 1 },
  replyControls: { flexDirection: 'row', gap: 8 },
  controlBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
});
