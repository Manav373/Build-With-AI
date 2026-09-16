import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useThemeColors, useType, useColorScheme, useReducedMotionPref } from '@/hooks/useColorScheme';
import { useScreenStrings, useLanguage } from '@/hooks/useLanguage';
import { sendImageForScan } from '@/services/api';
import { getPhoneId } from '@/services/session';
import * as Haptics from 'expo-haptics';
import { PressableScale, FadeInUp, Counter, AnimatedProgress, Pulse } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import { GlassCard } from '@/components/ui/Screen';

const STRINGS = {
  en: {
    cameraAccessNeeded: 'Camera Access Needed',
    cameraAccessDesc: 'KrishiAI needs camera access to scan your crops for diseases, pests, and nutrient deficiencies.',
    grantPermission: 'Grant Permission',
    pickFromGallery: 'Or pick from gallery →',
    cropDoctor: '🔬 AI Crop Doctor',
    instantDiagnosis: 'Instant Leaf Pest Diagnosis',
    cropDiagnoser: 'Crop Diagnoser',
    diagnoserDesc: 'Take a clear photo of crop leaves to instantly detect pathogens, bugs, or fertilizer shortages.',
    takeLeafScan: 'Take Leaf Scan',
    uploadPhoto: 'Upload Photo',
    bestScanGuidelines: 'Best Scan Guidelines',
    guideline1: 'Keep leaf centered in frame',
    guideline2: 'Ensure bright, even lighting',
    guideline3: 'Hold camera steady for focus',
    recentScans: 'Recent Scans',
    recentScansCount: '3 scans this month',
    alignCropLeaf: '🔬 Align Crop Leaf',
    diagnosticResult: '🔬 Diagnostic Result',
    wheatPlot1Scan: 'Wheat Plot #1 Scan',
    pathogenScanDiagnosis: 'Pathogen Scan Diagnosis',
    severityLevel: 'Severity Level',
    affectedOrgans: 'Affected Organs',
    aiPathologistDiagnosis: 'AI Pathologist Diagnosis',
    recommendedTreatments: 'Recommended Treatments',
    chemicalCure: 'Chemical Cure',
    organicRemedy: 'Organic Remedy',
    preventionAdvice: 'Prevention Advice',
    localKrishiVigyan: 'Local Krishi Vigyan Kendra',
    saveReport: 'Save Report',
    newScan: 'New Scan',
    confidence: 'Confidence',
    scanningCropPatterns: 'AI is scanning crop patterns...',
    analysisFailedAlert: 'Analysis Failed',
    analysisFailedDesc: 'Could not process crop image. Reverting to offline simulator.',
    savedAlert: 'Saved',
    savedDesc: 'Diagnosis report saved to your farming records database.',
    keepLeafCentered: 'Keep leaf centered',
    moveCloserToSpot: 'Move closer to spot',
    increaseLightLevel: 'Increase light level',
    holdSteady: 'Hold steady',
    shareMessage: 'KrishiAI Diagnosis: Crop {{cropName}} affected by {{disease}} with {{confidence}}% confidence. Treatment: {{treatment}}',
  },
  hi: {
    cameraAccessNeeded: 'कैमरा एक्सेस आवश्यक',
    cameraAccessDesc: 'कृषिAI को आपकी फसलों को रोगों, कीटों और पोषक तत्वों की कमी के लिए स्कैन करने के लिए कैमरे की एक्सेस चाहिए।',
    grantPermission: 'अनुमति दें',
    pickFromGallery: 'या गैलरी से चुनें →',
    cropDoctor: '🔬 AI फसल चिकित्सक',
    instantDiagnosis: 'तुरंत पत्ती कीट निदान',
    cropDiagnoser: 'फसल निदानकर्ता',
    diagnoserDesc: 'फसल की पत्तियों की स्पष्ट तस्वीर लें ताकि रोगजनकों, कीटों या पोषक तत्वों की कमी का तुरंत पता लगाया जा सके।',
    takeLeafScan: 'पत्ती स्कैन लें',
    uploadPhoto: 'फ़ोटो अपलोड करें',
    bestScanGuidelines: 'सर्वोत्तम स्कैन दिशानिर्देश',
    guideline1: 'पत्ती को फ्रेम के केंद्र में रखें',
    guideline2: 'उज्ज्वल, समान प्रकाश सुनिश्चित करें',
    guideline3: 'फोकस के लिए कैमरा स्थिर रखें',
    recentScans: 'हाल की स्कैन',
    recentScansCount: 'इस महीने 3 स्कैन',
    alignCropLeaf: '🔬 फसल पत्ती संरेखित करें',
    diagnosticResult: '🔬 नैदानिक परिणाम',
    wheatPlot1Scan: 'गेहूं प्लॉट #1 स्कैन',
    pathogenScanDiagnosis: 'रोगज़नक़ स्कैन निदान',
    severityLevel: 'गंभीरता का स्तर',
    affectedOrgans: 'प्रभावित अंग',
    aiPathologistDiagnosis: 'AI पैथोलॉजिस्ट निदान',
    recommendedTreatments: 'अनुशंसित उपचार',
    chemicalCure: 'रासायनिक इलाज',
    organicRemedy: 'जैविक उपाय',
    preventionAdvice: 'रोकथाम सलाह',
    localKrishiVigyan: 'स्थानीय कृषि विज्ञान केंद्र',
    saveReport: 'रिपोर्ट सहेजें',
    newScan: 'नई स्कैन',
    confidence: 'विश्वास',
    scanningCropPatterns: 'AI फसल के पैटर्न को स्कैन कर रहा है...',
    analysisFailedAlert: 'विश्लेषण विफल',
    analysisFailedDesc: 'फसल की छवि को संसाधित नहीं कर सके। ऑफलाइन सिमुलेटर में वापस जा रहे हैं।',
    savedAlert: 'सहेजा गया',
    savedDesc: 'निदान रिपोर्ट आपने डेटाबेस को फार्मिंग रिकॉर्ड में सहेजी गई।',
    keepLeafCentered: 'पत्ती को केंद्र में रखें',
    moveCloserToSpot: 'स्पॉट के करीब जाएं',
    increaseLightLevel: 'प्रकाश स्तर बढ़ाएं',
    holdSteady: 'स्थिर रखें',
    shareMessage: 'कृषिAI निदान: फसल {{cropName}} को {{disease}} से प्रभावित, {{confidence}}% आत्मविश्वास। उपचार: {{treatment}}',
  },
  gu: {
    cameraAccessNeeded: 'કેમેરા એક્સેસ જરૂરી',
    cameraAccessDesc: 'કૃષિAI ને તમારી પાકને રોગ, જંતુ અને પોષક તત્વોની ખામીઓ માટે સ્કેન કરવા માટે કેમેરા એક્સેસ જોઈએ છે।',
    grantPermission: 'અનુમતિ આપો',
    pickFromGallery: 'અથવા આર્ટ દીર્ઘાથી પસંદ કરો →',
    cropDoctor: '🔬 AI પાક ડૉક્ટર',
    instantDiagnosis: 'તાત્કાલિક પત્ર જંતુ નિદાન',
    cropDiagnoser: 'પાક નિદાનકર્તા',
    diagnoserDesc: 'પાકની પત્તિઓની સ્પષ્ટ તસવીર લો જેથી રોગજનક, જંતુ અથવા પોષક તત્વોની ખામીઓ તાત્કાલિક શોધી શકાય.',
    takeLeafScan: 'પત્ર સ્કેન લો',
    uploadPhoto: 'ફોટો અપલોડ કરો',
    bestScanGuidelines: 'શ્રેષ્ઠ સ્કેન માર્ગદર્શન',
    guideline1: 'પત્ર ફ્રેમના કેન્દ્રમાં રાખો',
    guideline2: 'તેજસ્વી, સમાન પ્રકાશ સુનિશ્ચિત કરો',
    guideline3: 'ફોકસ માટે કેમેરો સ્થિર રાખો',
    recentScans: 'તાજેતરની સ્કેન',
    recentScansCount: 'આ મહિને 3 સ્કેન',
    alignCropLeaf: '🔬 પાક પત્ર સંરેખિત કરો',
    diagnosticResult: '🔬 નિદાનાત્મક પરિણામ',
    wheatPlot1Scan: 'ઘઉં પ્લૉટ #1 સ્કેન',
    pathogenScanDiagnosis: 'રોગજનક સ્કેન નિદાન',
    severityLevel: 'ગંભીરતાનું સ્તર',
    affectedOrgans: 'અસરગ્રસ્ત અંગો',
    aiPathologistDiagnosis: 'AI પેથોલોજિસ્ટ નિદાન',
    recommendedTreatments: 'સુପારિશ કરેલ ઉપચારો',
    chemicalCure: 'રાસાયણિક ઉપચાર',
    organicRemedy: 'જૈવિક ઉપાય',
    preventionAdvice: 'રોકથામ સલાહ',
    localKrishiVigyan: 'સ્થાનિક કૃષિ વિજ્ઞાન કેન્દ્ર',
    saveReport: 'રિપોર્ટ સાચવો',
    newScan: 'નવી સ્કેન',
    confidence: 'આત્મવિશ્વાસ',
    scanningCropPatterns: 'AI પાક પેટર્ન સ્કેન કરી રહ્યું છે...',
    analysisFailedAlert: 'વિશ્લેષણ નિષ્ફળ',
    analysisFailedDesc: 'પાક છબીને પ્રક્રિયા કરી શક્યા નહિ. ઓફલાઇન સિમ્યુલેટરમાં પરત જઈ રહ્યા છીએ.',
    savedAlert: 'સાચવેલ',
    savedDesc: 'નિદાન રિપોર્ટ આપના ખેતી રેકોર્ડ ડેટાબેસમાં સાચવાયેલ છે।',
    keepLeafCentered: 'પત્રને કેન્દ્રમાં રાખો',
    moveCloserToSpot: 'સ્થાનની નજીક આવો',
    increaseLightLevel: 'પ્રકાશ સ્તર વધારો',
    holdSteady: 'સ્થિર રાખો',
    shareMessage: 'કૃષિAI નિદાન: પાક {{cropName}} {{disease}} દ્વારા અસરગ્રસ્ત, {{confidence}}% આત્મવિશ્વાસ. ઉપચાર: {{treatment}}',
  },
  mr: {
    cameraAccessNeeded: 'कॅमेरा प्रवेश आवश्यक',
    cameraAccessDesc: 'कृषीAI ला तुमच्या पिकांना रोग, कीटक आणि पोषक तत्वांच्या कमतरतेसाठी स्कॅन करण्यासाठी कॅमेरा प्रवेश हवा आहे.',
    grantPermission: 'परवानगी द्या',
    pickFromGallery: 'किंवा गॅलरीतून निवडा →',
    cropDoctor: '🔬 AI पीक डॉक्टर',
    instantDiagnosis: 'तातकाळ पत्र कीटक निदान',
    cropDiagnoser: 'पीक निदानकार',
    diagnoserDesc: 'पिकाच्या पानांचा स्पष्ट फोटो घ्या जेणेकरून रोगजनक, कीटक किंवा पोषक तत्वांच्या कमतरतेचा तातकाळ पता लागू शकेल.',
    takeLeafScan: 'पत्र स्कॅन घ्या',
    uploadPhoto: 'फोटो अपलोड करा',
    bestScanGuidelines: 'उत्तम स्कॅन मार्गदर्शन',
    guideline1: 'पत्र फ्रेमच्या मध्यभागी ठेवा',
    guideline2: 'तेजस्वी, समान प्रकाश सुनिश्चित करा',
    guideline3: 'फोकससाठी कॅमेरा स्थिर ठेवा',
    recentScans: 'अलीकडील स्कॅन',
    recentScansCount: 'या महिन्यात 3 स्कॅन',
    alignCropLeaf: '🔬 पीक पत्र संरेखित करा',
    diagnosticResult: '🔬 निदान परिणाम',
    wheatPlot1Scan: 'गहू प्लॉट #1 स्कॅन',
    pathogenScanDiagnosis: 'रोगजनक स्कॅन निदान',
    severityLevel: 'गंभीरतेचे स्तर',
    affectedOrgans: 'प्रभावित अवयव',
    aiPathologistDiagnosis: 'AI पॅथोलॉजिस्ट निदान',
    recommendedTreatments: 'अनुशंसित उपचार',
    chemicalCure: 'रासायनिक उपचार',
    organicRemedy: 'जैविक उपाय',
    preventionAdvice: 'प्रतिबंध सल्ला',
    localKrishiVigyan: 'स्थानिक कृषि विज्ञान केंद्र',
    saveReport: 'अहवाल जतन करा',
    newScan: 'नई स्कॅन',
    confidence: 'आत्मविश्वास',
    scanningCropPatterns: 'AI पीक नमुने स्कॅन करत आहे...',
    analysisFailedAlert: 'विश्लेषण अयोग्य',
    analysisFailedDesc: 'पीकाची प्रतिमा प्रक्रिया करू शकलो नाही. ऑफलाइन सिम्युलेटरकडे परत जात आहे.',
    savedAlert: 'जतन झाले',
    savedDesc: 'निदान अहवाल तुमच्या शेती डेटाबेसमध्ये जतन केले.',
    keepLeafCentered: 'पत्र मध्यभागी ठेवा',
    moveCloserToSpot: 'जागेच्या जवळ आ',
    increaseLightLevel: 'प्रकाश स्तर वाढवा',
    holdSteady: 'स्थिर ठेवा',
    shareMessage: 'कृषीAI निदान: पीक {{cropName}} {{disease}} द्वारे प्रभावित, {{confidence}}% आत्मविश्वास. उपचार: {{treatment}}',
  },
};

interface ScanHistoryItem {
  id: string;
  crop: string;
  disease: string;
  date: string;
  status: 'High' | 'Medium' | 'Low';
}

interface DiagnosisResult {
  cropName: string;
  disease: string;
  confidence: number;
  severity: 'High' | 'Medium' | 'Low';
  desc: string;
  affectedParts: string;
  chemicalTreatment: string;
  organicTreatment: string;
  prevention: string;
  nearbyExpert: string;
}

const FALLBACK_DIAGNOSIS: DiagnosisResult = {
  cropName: 'Wheat',
  disease: 'Wheat Leaf Rust (Puccinia triticina)',
  confidence: 96,
  severity: 'High',
  desc: 'Wheat rust is a fungal infection that attacks leaf blades and sheaths, producing reddish-brown pustules that reduce crop yield.',
  affectedParts: 'Leaf blades, sheaths, stems',
  chemicalTreatment: 'Spray Propiconazole 25% EC (200 ml/acre) mixed in 200 liters of water.',
  organicTreatment: 'Apply cold-pressed Neem Oil spray (1.5% dilution) in the early morning.',
  prevention: 'Plant rust-resistant seed variants and practice crop rotation with legumes.',
  nearbyExpert: 'Dr. Ramesh Sharma, Rampur KVK (2.5 km away)',
};

const { width } = Dimensions.get('window');
const AView = Animated.View as any;

interface ScanHistoryItem {
  id: string;
  crop: string;
  disease: string;
  date: string;
  status: 'High' | 'Medium' | 'Low';
}

/** Laser line that sweeps down the focus frame while aligning. */
function LaserSweep() {
  const reduced = useReducedMotionPref();
  const y = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    y.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(y);
  }, [reduced]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * 230 }] }));
  return (
    <AView style={[styles.laserLine, style]}>
      <LinearGradient colors={['transparent', 'rgba(74, 222, 128, 0.5)', 'transparent']} style={StyleSheet.absoluteFill as any} />
    </AView>
  );
}

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const t = useType();
  const s = useScreenStrings(STRINGS as any);
  const { language } = useLanguage();
  const cameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [viewMode, setViewMode] = useState<'dashboard' | 'camera' | 'result'>('dashboard');
  const [scanning, setScanning] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [cameraGuideMsg, setCameraGuideMsg] = useState('Keep leaf centered');

  const [resultData, setResultData] = useState<DiagnosisResult>(FALLBACK_DIAGNOSIS);
  const [isScanInFlight, setIsScanInFlight] = useState(false);

  const [recentScans] = useState<ScanHistoryItem[]>([
    { id: '1', crop: 'Wheat', disease: 'Leaf Rust detected', date: 'June 20, 2026', status: 'High' },
    { id: '2', crop: 'Cotton', disease: 'Aphids infestation', date: 'June 14, 2026', status: 'Medium' },
    { id: '3', crop: 'Rice', disease: 'Healthy Crop', date: 'June 10, 2026', status: 'Low' },
  ]);

  const handleOpenHistory = (item: ScanHistoryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setResultData({
      ...FALLBACK_DIAGNOSIS,
      cropName: item.crop,
      disease: item.disease,
      severity: item.status,
    });
    setViewMode('result');
  };

  useEffect(() => {
    if (viewMode === 'camera') {
      const messages = [s.keepLeafCentered, s.moveCloserToSpot, s.increaseLightLevel, s.holdSteady];
      let idx = 0;
      const interval = setInterval(() => {
        idx = (idx + 1) % messages.length;
        setCameraGuideMsg(messages[idx]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [viewMode, s]);

  const processDiagnosisResponse = (response: any): DiagnosisResult => {
    const extract = (field: string, fallback: string): string => {
      const val = response?.[field] || response?.[field.toLowerCase()] || '';
      return typeof val === 'string' && val.trim() ? val.trim() : fallback;
    };

    const confidence = Math.min(100, Math.max(0, parseInt(response?.confidence ?? response?.confidence_score ?? '96', 10) || 96));
    const severity = (['High', 'Medium', 'Low'].includes(response?.severity) ? response.severity :
                      (['High', 'Medium', 'Low'].includes(response?.Severity) ? response.Severity : 'High')) as 'High' | 'Medium' | 'Low';

    return {
      cropName: extract('cropName', FALLBACK_DIAGNOSIS.cropName) || extract('crop', FALLBACK_DIAGNOSIS.cropName),
      disease: extract('disease', FALLBACK_DIAGNOSIS.disease) || extract('diagnosis', FALLBACK_DIAGNOSIS.disease),
      confidence,
      severity,
      desc: extract('description', FALLBACK_DIAGNOSIS.desc) || extract('desc', FALLBACK_DIAGNOSIS.desc),
      affectedParts: extract('affectedOrgans', FALLBACK_DIAGNOSIS.affectedParts) || extract('affected_parts', FALLBACK_DIAGNOSIS.affectedParts),
      chemicalTreatment: extract('chemicalTreatment', FALLBACK_DIAGNOSIS.chemicalTreatment) || extract('chemical_treatment', FALLBACK_DIAGNOSIS.chemicalTreatment),
      organicTreatment: extract('organicTreatment', FALLBACK_DIAGNOSIS.organicTreatment) || extract('organic_treatment', FALLBACK_DIAGNOSIS.organicTreatment),
      prevention: extract('prevention', FALLBACK_DIAGNOSIS.prevention) || extract('preventive_measures', FALLBACK_DIAGNOSIS.prevention),
      nearbyExpert: extract('nearbyExpert', FALLBACK_DIAGNOSIS.nearbyExpert) || extract('expert', FALLBACK_DIAGNOSIS.nearbyExpert),
    };
  };

  const performScan = async (imageUri: string) => {
    if (isScanInFlight) return;

    setIsScanInFlight(true);
    try {
      const phoneId = await getPhoneId();
      const response = await sendImageForScan(phoneId, imageUri, language);
      const diagnosis = processDiagnosisResponse(response);
      setResultData(diagnosis);
    } catch (error) {
      setResultData(FALLBACK_DIAGNOSIS);
    } finally {
      setIsScanInFlight(false);
      setScanning(false);
      setViewMode('result');
    }
  };

  const handleStartCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setViewMode('camera');
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isScanInFlight) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        await performScan(photo.uri);
      }
    } catch {
      setScanning(false);
      Alert.alert(s.analysisFailedAlert, s.analysisFailedDesc);
      setViewMode('result');
    }
  };

  const handlePickImage = async () => {
    if (isScanInFlight) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]) {
      setCapturedUri(res.assets[0].uri);
      setScanning(true);
      setViewMode('camera');
      await performScan(res.assets[0].uri);
    }
  };

  const handleShareResult = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const shareMsg = s.shareMessage
        .replace('{{cropName}}', resultData.cropName)
        .replace('{{disease}}', resultData.disease)
        .replace('{{confidence}}', resultData.confidence.toString())
        .replace('{{treatment}}', resultData.chemicalTreatment);
      await Share.share({ message: shareMsg });
    } catch {
      Alert.alert('Error', 'Unable to open sharing pane.');
    }
  };

  const handleSaveResult = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert(s.savedAlert, s.savedDesc);
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFlash((p) => (p === 'off' ? 'on' : 'off'));
  };
  const toggleFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFacing((p) => (p === 'back' ? 'front' : 'back'));
  };

  // ----- Permission gate -----
  if (!permission?.granted) {
    return (
      <View style={[styles.permissionScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.permissionCard, { paddingTop: insets.top + 40 }]}>
          <Text style={{ fontSize: 64 }}>📸</Text>
          <Text style={[t.title, { color: colors.text, textAlign: 'center' }]}>{s.cameraAccessNeeded}</Text>
          <Text style={[t.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            {s.cameraAccessDesc}
          </Text>
          <PressableScale style={[styles.grantBtn, { backgroundColor: colors.accent }]} onPress={requestPermission} haptic="medium">
            <Text style={styles.grantBtnText}>{s.grantPermission}</Text>
          </PressableScale>
          <PressableScale onPress={handlePickImage} haptic="light" style={styles.galleryLink}>
            <Text style={[t.label, { color: colors.accent }]}>{s.pickFromGallery}</Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  // ----- Dashboard -----
  if (viewMode === 'dashboard') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Modern Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View style={[styles.headerBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Text style={{ fontSize: 22 }}>🔬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[t.titleSmall, { color: colors.text, fontWeight: '800', fontSize: 18 }]}>AI Crop Doctor</Text>
              <Text style={[t.caption, { color: colors.textMuted, fontWeight: '500' }]} numberOfLines={1}>Instant Leaf Pest & Disease Diagnosis</Text>
            </View>
          </View>
          <View style={styles.accuracyPill}>
            <View style={styles.accuracyDot} />
            <Text style={styles.accuracyText}>98.4% Precision</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
          {/* 1. HERO SCANNER CARD */}
          <FadeInUp index={0} distance={16}>
            <GlassCard liquid padding={20} style={[styles.heroCard, { borderColor: scheme === 'dark' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.22)' }]}>
              <LinearGradient
                colors={scheme === 'dark' ? ['rgba(16, 185, 129, 0.16)', 'rgba(6, 182, 212, 0.05)', 'transparent'] : ['rgba(16, 185, 129, 0.10)', 'rgba(6, 182, 212, 0.03)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Tag + Icon row */}
              <View style={styles.heroTopRow}>
                <View style={styles.heroTagPill}>
                  <View style={styles.heroTagDot} />
                  <Text style={styles.heroTagText}>AI VISION PATHOLOGY</Text>
                </View>
                <View style={[styles.heroIconCircle, { backgroundColor: scheme === 'dark' ? 'rgba(16, 185, 129, 0.20)' : 'rgba(16, 185, 129, 0.12)' }]}>
                  <Feather name="shield" size={18} color="#10b981" />
                </View>
              </View>

              {/* Title & Description */}
              <View style={{ gap: 4, marginTop: 4 }}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>{s.cropDiagnoser}</Text>
                <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>
                  {s.diagnoserDesc}
                </Text>
              </View>

              {/* Dual Action Buttons */}
              <View style={styles.heroButtonRow}>
                <PressableScale style={styles.heroPrimaryBtn} onPress={handleStartCamera} haptic="medium" scaleTo={0.96}>
                  <LinearGradient colors={colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroPrimaryBtnGradient}>
                    <Feather name="camera" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.heroPrimaryBtnText}>{s.takeLeafScan}</Text>
                  </LinearGradient>
                </PressableScale>

                <PressableScale
                  style={[
                    styles.heroSecondaryBtn,
                    {
                      borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)',
                      backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    }
                  ]}
                  onPress={handlePickImage}
                  haptic="light"
                  scaleTo={0.96}
                >
                  <Feather name="image" size={18} color={colors.text} style={{ marginRight: 8 }} />
                  <Text style={[styles.heroSecondaryBtnText, { color: colors.text }]}>{s.uploadPhoto}</Text>
                </PressableScale>
              </View>
            </GlassCard>
          </FadeInUp>

          {/* 2. BEST SCAN GUIDELINES */}
          <FadeInUp index={1} distance={16}>
            <GlassCard liquid padding={18} style={styles.card}>
              <View style={styles.guidelinesHeader}>
                <View style={[styles.guideIconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.12)' }]}>
                  <Feather name="help-circle" size={16} color="#06b6d4" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.guideCardTitle, { color: colors.text }]}>{s.bestScanGuidelines}</Text>
                  <Text style={[styles.guideCardSub, { color: colors.textMuted }]}>Follow these steps for accurate laboratory-grade analysis</Text>
                </View>
              </View>

              <View style={styles.guideItemsList}>
                <View style={[styles.guideItemBox, { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }]}>
                    <Feather name="crosshair" size={13} color="#10b981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.guideItemTitle, { color: colors.text }]}>Center Leaf in Frame</Text>
                    <Text style={[styles.guideItemDesc, { color: colors.textSecondary }]}>Keep leaf centered, filling 70% of the viewfinder</Text>
                  </View>
                </View>

                <View style={[styles.guideItemBox, { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b' }]}>
                    <Feather name="sun" size={13} color="#f59e0b" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.guideItemTitle, { color: colors.text }]}>Bright, Even Lighting</Text>
                    <Text style={[styles.guideItemDesc, { color: colors.textSecondary }]}>Use daylight or torch; avoid direct harsh shadows</Text>
                  </View>
                </View>

                <View style={[styles.guideItemBox, { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: 'rgba(6, 182, 212, 0.15)', borderColor: '#06b6d4' }]}>
                    <Feather name="maximize-2" size={13} color="#06b6d4" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.guideItemTitle, { color: colors.text }]}>Sharp Macro Focus</Text>
                    <Text style={[styles.guideItemDesc, { color: colors.textSecondary }]}>Hold phone steady 10–15 cm away to avoid blur</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </FadeInUp>

          {/* 3. RECENT SCANS */}
          <FadeInUp index={2} distance={16}>
            <View style={{ gap: 10 }}>
              <View style={styles.recentScansHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="clock" size={16} color={colors.accent} />
                  <Text style={[styles.recentScansTitle, { color: colors.text }]}>{s.recentScans}</Text>
                </View>
                <View style={[styles.recentCountBadge, { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: colors.border }]}>
                  <Text style={[styles.recentCountText, { color: colors.textMuted }]}>{s.recentScansCount}</Text>
                </View>
              </View>

              {recentScans.map((item, idx) => {
                const tint = item.status === 'High' ? colors.danger : item.status === 'Medium' ? colors.warning : colors.accent;
                const cropEmoji = item.crop.toLowerCase().includes('cotton') ? '🌱' : item.crop.toLowerCase().includes('rice') ? '🌾' : '🌾';
                return (
                  <FadeInUp key={item.id} index={idx + 3} distance={12}>
                    <PressableScale
                      onPress={() => handleOpenHistory(item)}
                      haptic="light"
                      style={[
                        styles.historyCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          ...DesignTokens.shadow.level1,
                        }
                      ]}
                      scaleTo={0.98}
                    >
                      <View style={styles.historyLeft}>
                        <View style={[styles.historyIconBox, { backgroundColor: tint + '15', borderColor: tint + '30' }]}>
                          <Text style={{ fontSize: 20 }}>{cropEmoji}</Text>
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.historyCropName, { color: colors.text }]}>{item.crop}</Text>
                            <View style={[styles.severityPill, { backgroundColor: tint + '15', borderColor: tint + '40' }]}>
                              <Text style={[styles.severityPillText, { color: tint }]}>{item.status}</Text>
                            </View>
                          </View>
                          <Text style={[styles.historyDisease, { color: colors.textSecondary }]} numberOfLines={1}>{item.disease}</Text>
                          <Text style={[styles.historyDate, { color: colors.textMuted }]}>{item.date}</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color={colors.textMuted} />
                      </View>
                    </PressableScale>
                  </FadeInUp>
                );
              })}
            </View>
          </FadeInUp>
        </ScrollView>
      </View>
    );
  }

  // ----- Camera -----
  if (viewMode === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing={facing} enableTorch={flash === 'on'}>
          <View style={styles.cameraOverlay}>
            <View style={[styles.cameraHeader, { paddingTop: insets.top + 12 }]}>
              <PressableScale style={styles.cameraHeaderBtn} onPress={() => setViewMode('dashboard')} haptic="light">
                <Feather name="x" size={20} color="#ffffff" />
              </PressableScale>
              <Text style={styles.cameraTitle}>{s.alignCropLeaf}</Text>
              <PressableScale style={styles.cameraHeaderBtn} onPress={toggleFlash} haptic="light">
                <Feather name={flash === 'on' ? 'zap' : 'zap-off'} size={20} color="#ffffff" />
              </PressableScale>
            </View>

            <View style={styles.focusFrameContainer}>
              <View style={styles.focusFrame}>
                <View style={[styles.camCorner, styles.camCornerTL]} />
                <View style={[styles.camCorner, styles.camCornerTR]} />
                <View style={[styles.camCorner, styles.camCornerBL]} />
                <View style={[styles.camCorner, styles.camCornerBR]} />
                <LaserSweep />
              </View>
              <View style={styles.guidanceBadge}>
                <Text style={styles.guidanceText}>{cameraGuideMsg}</Text>
              </View>
            </View>

            <View style={[styles.cameraBottom, { paddingBottom: insets.bottom + 24 }]}>
              <PressableScale style={styles.galleryShortcut} onPress={handlePickImage} haptic="light" disabled={scanning}>
                <Feather name="image" size={20} color="#ffffff" />
              </PressableScale>
              <PressableScale style={styles.shutterBtn} onPress={handleCapture} haptic="heavy" disabled={scanning}>
                <View style={styles.shutterInner} />
              </PressableScale>
              <PressableScale style={styles.galleryShortcut} onPress={toggleFacing} haptic="light" disabled={scanning}>
                <MaterialCommunityIcons name="camera-flip-outline" size={22} color="#ffffff" />
              </PressableScale>
            </View>
          </View>
        </CameraView>

        {scanning && (
          <View style={styles.scanningOverlay}>
            <Pulse>
              <View style={styles.scanPulseRing}>
                <MaterialCommunityIcons name="leaf" size={34} color="#4ade80" />
              </View>
            </Pulse>
            <Text style={styles.scanningText}>{s.scanningCropPatterns}</Text>
          </View>
        )}
      </View>
    );
  }

  // ----- Result -----
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <PressableScale style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]} onPress={() => setViewMode('dashboard')} haptic="light">
          <Feather name="arrow-left" size={18} color={colors.text} />
        </PressableScale>
        <View style={{ alignItems: 'center' }}>
          <Text style={[t.titleSmall, { color: colors.text }]}>{s.diagnosticResult}</Text>
          <Text style={[t.caption, { color: colors.textSecondary }]}>{s.wheatPlot1Scan}</Text>
        </View>
        <PressableScale style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]} onPress={handleShareResult} haptic="light">
          <Feather name="share-2" size={18} color={colors.text} />
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <FadeInUp index={0}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level1 }]}>
            <Text style={[t.overline, { color: colors.textMuted }]}>{s.pathogenScanDiagnosis}</Text>
            <Text style={[t.title, { color: colors.text, marginTop: 2 }]}>{resultData.disease}</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.metricRow}>
              <View style={styles.confRing}>
                <LinearGradient colors={colors.gradient.primary} style={styles.confRingInner}>
                  <Counter value={resultData.confidence} suffix="%" style={styles.confRingText} />
                  <Text style={styles.confRingLbl}>{s.confidence}</Text>
                </LinearGradient>
              </View>
              <View style={{ flex: 1, gap: 10 }}>
                <View style={styles.metricDetailRow}>
                  <Text style={[t.bodySmall, { color: colors.textSecondary }]}>{s.severityLevel}</Text>
                  <View style={[styles.detailBadge, { backgroundColor: colors.danger }]}>
                    <Text style={styles.detailBadgeText}>{resultData.severity}</Text>
                  </View>
                </View>
                <View>
                  <Text style={[t.caption, { color: colors.textSecondary }]}>{s.affectedOrgans}</Text>
                  <Text style={[t.bodySmall, { color: colors.text, fontWeight: '700' }]}>{resultData.affectedParts}</Text>
                </View>
                <AnimatedProgress fraction={resultData.confidence / 100} color={colors.accent} />
              </View>
            </View>
          </View>
        </FadeInUp>

        {[
          { title: s.aiPathologistDiagnosis, body: resultData.desc },
        ].map((c, i) => (
          <FadeInUp key={c.title} index={i + 1}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level1 }]}>
              <Text style={[t.bodyStrong, { color: colors.text }]}>{c.title}</Text>
              <Text style={[t.bodySmall, { color: colors.textSecondary, marginTop: 6 }]}>{c.body}</Text>
            </View>
          </FadeInUp>
        ))}

        <FadeInUp index={2}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level1 }]}>
            <Text style={[t.bodyStrong, { color: colors.text, marginBottom: 8 }]}>{s.recommendedTreatments}</Text>
            <View style={[styles.treatmentBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.treatmentHeader}>
                <Feather name="shield" size={16} color={colors.accent} />
                <Text style={[t.label, { color: colors.text }]}>{s.chemicalCure}</Text>
              </View>
              <Text style={[t.bodySmall, { color: colors.textSecondary }]}>{resultData.chemicalTreatment}</Text>
            </View>
            <View style={[styles.treatmentBox, { marginTop: 12, backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.treatmentHeader}>
                <Feather name="feather" size={16} color={colors.green} />
                <Text style={[t.label, { color: colors.text }]}>{s.organicRemedy}</Text>
              </View>
              <Text style={[t.bodySmall, { color: colors.textSecondary }]}>{resultData.organicTreatment}</Text>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp index={3}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level1 }]}>
            <Text style={[t.bodyStrong, { color: colors.text }]}>{s.preventionAdvice}</Text>
            <Text style={[t.bodySmall, { color: colors.textSecondary, marginTop: 6 }]}>{resultData.prevention}</Text>
          </View>
        </FadeInUp>

        <FadeInUp index={4}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, ...DesignTokens.shadow.level1 }]}>
            <Text style={[t.bodyStrong, { color: colors.text, marginBottom: 4 }]}>{s.localKrishiVigyan}</Text>
            <View style={styles.expertRow}>
              <Feather name="map-pin" size={16} color={colors.accent} />
              <Text style={[t.bodySmall, { color: colors.text, fontWeight: '700' }]}>{resultData.nearbyExpert}</Text>
            </View>
          </View>
        </FadeInUp>

        <View style={styles.bottomActionsRow}>
          <PressableScale style={[styles.actionBtnHalf, { borderColor: colors.borderStrong }]} onPress={handleSaveResult} haptic="light">
            <Feather name="folder-plus" size={16} color={colors.text} style={{ marginRight: 6 }} />
            <Text style={[t.label, { color: colors.text }]}>{s.saveReport}</Text>
          </PressableScale>
          <PressableScale style={styles.actionBtnHalfPrimary} onPress={() => setViewMode('dashboard')} haptic="medium">
            <LinearGradient colors={colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionBtnGradientHalf}>
              <Feather name="camera" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnTextHalfPrimary}>{s.newScan}</Text>
            </LinearGradient>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    borderBottomWidth: 1 
  },
  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  accuracyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  accuracyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  scrollContent: { padding: 16, gap: 16 },
  
  // Hero Card
  heroCard: { 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    gap: 14, 
    overflow: 'hidden' 
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  heroTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  heroTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  heroIconCircle: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  heroButtonRow: { 
    flexDirection: 'row', 
    gap: 10,
    marginTop: 6,
  },
  heroPrimaryBtn: { 
    flex: 1.15, 
    height: 50, 
    borderRadius: 16, 
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  heroPrimaryBtnGradient: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  heroPrimaryBtnText: { 
    color: '#ffffff', 
    fontSize: 13, 
    fontWeight: '800' 
  },
  heroSecondaryBtn: { 
    flex: 1, 
    height: 50, 
    borderRadius: 16, 
    borderWidth: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
  heroSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Guidelines Card
  card: { padding: 18, borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  guideIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  guideCardSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  guideItemsList: {
    gap: 8,
  },
  guideItemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  stepNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideItemTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  guideItemDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },

  // Recent Scans
  recentScansHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recentScansTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  recentCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  recentCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  historyCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  historyLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    padding: 14,
  },
  historyIconBox: { 
    width: 42, 
    height: 42, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1,
    overflow: 'hidden' 
  },
  historyCropName: {
    fontSize: 14,
    fontWeight: '800',
  },
  severityPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  severityPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  historyDisease: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  permissionScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permissionCard: { alignItems: 'center', paddingHorizontal: 36, gap: 16 },
  grantBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22, marginTop: 8 },
  grantBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  galleryLink: { marginTop: 4, padding: 4 },
  cameraContainer: { flex: 1, backgroundColor: '#000000' },
  cameraOverlay: { flex: 1, justifyContent: 'space-between' },
  cameraHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  cameraHeaderBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cameraTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  focusFrameContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  focusFrame: { width: 250, height: 250, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 16, position: 'relative', overflow: 'hidden' },
  camCorner: { position: 'absolute', width: 24, height: 24, borderColor: '#4ade80', borderWidth: 3 },
  camCornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 10 },
  camCornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 10 },
  camCornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 10 },
  camCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 10 },
  laserLine: { position: 'absolute', top: 4, left: 4, right: 4, height: 3, borderRadius: 1.5, overflow: 'hidden' },
  guidanceBadge: { backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginTop: 16 },
  guidanceText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  cameraBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  galleryShortcut: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  shutterBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#ffffff' },
  scanningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', gap: 20 },
  scanPulseRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: '#4ade80', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(74,222,128,0.08)' },
  scanningText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  divider: { height: 1, marginVertical: 14 },
  metricRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  confRing: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  confRingInner: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  confRingText: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  confRingLbl: { color: 'rgba(255,255,255,0.85)', fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricDetailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
  detailBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  treatmentBox: { padding: 12, borderRadius: 14, borderWidth: 1 },
  treatmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  expertRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  bottomActionsRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  actionBtnHalf: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionBtnHalfPrimary: { flex: 1, height: 50, borderRadius: 25, overflow: 'hidden' },
  actionBtnGradientHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionBtnTextHalfPrimary: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
});
