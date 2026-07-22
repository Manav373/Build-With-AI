import React, { useState } from 'react';
import { View, Text, StyleSheet, Share, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DesignTokens } from '@/constants/DesignTokens';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    screenTitle: 'AI Recommendations',
    screenSubtitle: 'Expandable Recommendation Cards',
    notifications: 'Notifications',
    irrigationTitle: '🌧️ Delay Wheat Irrigation by 48 Hours',
    irrigationDesc: 'Storm warning on June 23 will provide natural soil moisture. Holds off watering to avoid waterlogged roots.',
    irrigationExplanation: 'Flooding crops right before a downpour leads to soil compaction and oxygen starvation in the root zone. Waiting saves water and protects root health.',
    fertilizerTitle: '🌾 Apply Nitrogen Fertilizer on June 25',
    fertilizerDesc: 'Optimal dry soil conditions post-rain will maximize nitrogen absorption and green canopy growth.',
    fertilizerExplanation: 'Slightly damp soil (post-rain) allows urea granules to dissolve slowly and penetrate the soil evenly, preventing gas volatility loss.',
    pestTitle: '🐛 Spray Neem Oil in Plot B (Vegetables)',
    pestDesc: 'NDVI scans indicate yellowing on borders, likely early aphid colonization. Apply organic sprays.',
    pestExplanation: 'Neem oil acts as a natural feeding deterrent and disruptor of insect growth hormones, containing early aphid colonies before they spread.',
    mandiTitle: '💰 Sell Wheat Grains at Karnal Mandi',
    mandiDesc: 'APMC rates surged to ₹2,420/Q due to short supply. Current prices are +12% above seasonal average.',
    mandiExplanation: 'Demand is peaking as government reserves open procurement windows. Prices are projected to adjust down by 4% next week as fresh shipments arrive.',
    saved: 'Advisory saved to your personalized farming schedule.',
    whyExplanation: 'Why',
    hide: 'Hide',
    save: 'Save',
    aiReasoning: '🔬 AI Reasoning',
    errorSharing: 'Could not open sharing drawer.',
  },
  hi: {
    screenTitle: 'AI सिफारिशें',
    screenSubtitle: 'विस्तार योग्य सिफारिश कार्ड',
    notifications: 'सूचनाएं',
    irrigationTitle: '🌧️ गेहूं की सिंचाई 48 घंटे विलंबित करें',
    irrigationDesc: '23 जून को तूफान की चेतावनी प्राकृतिक मिट्टी की नमी प्रदान करेगी। जलभराव जड़ों से बचने के लिए सिंचाई में देरी करता है।',
    irrigationExplanation: 'जलभराव से पहले फसलों को भिगोने से मिट्टी का संहनन और जड़ क्षेत्र में ऑक्सीजन की कमी होती है। प्रतीक्षा पानी बचाता है और जड़ स्वास्थ्य की रक्षा करता है।',
    fertilizerTitle: '🌾 25 जून को नाइट्रोजन उर्वरक लागू करें',
    fertilizerDesc: 'बारिश के बाद इष्टतम सूखी मिट्टी की स्थिति नाइट्रोजन अवशोषण और हरी छतरी वृद्धि को अधिकतम करेगी।',
    fertilizerExplanation: 'थोड़ी नम मिट्टी (बारिश के बाद) यूरिया के दानों को धीरे-धीरे घुलने और मिट्टी में समान रूप से प्रवेश करने की अनुमति देती है, गैस अस्थिरता हानि को रोकती है।',
    pestTitle: '🐛 प्लॉट बी (सब्जियों) में नीम का तेल स्प्रे करें',
    pestDesc: 'NDVI स्कैन सीमाओं पर पीलापन इंगित करता है, संभवतः प्रारंभिक एफिड उपनिवेशन। जैविक स्प्रे लागू करें।',
    pestExplanation: 'नीम का तेल कीट वृद्धि हार्मोन के एक प्राकृतिक भोजन निरोध और विघ्नकर्ता के रूप में कार्य करता है, प्रारंभिक एफिड कॉलोनियों को फैलने से पहले रोकता है।',
    mandiTitle: '💰 करनाल मंडी में गेहूं के अनाज बेचें',
    mandiDesc: 'APMC की दरें आपूर्ति की कमी के कारण ₹2,420/क्यू तक बढ़ गईं। वर्तमान कीमतें मौसमी औसत से +12% हैं।',
    mandiExplanation: 'सरकार जैसे-जैसे सरकार के भंडार खरीद की खिड़कियां खोलते हैं, मांग बढ़ रही है। ताजे शिपमेंट के आने के साथ कीमतें अगले हफ्ते 4% कम होने का अनुमान है।',
    saved: 'सलाह आपकी व्यक्तिगत खेती की समय सारणी में सहेजी गई है।',
    whyExplanation: 'क्यों',
    hide: 'छुपाएं',
    save: 'बचाएं',
    aiReasoning: '🔬 AI तर्क',
    errorSharing: 'साझा करने वाली दराज खोल नहीं सकी।',
  },
  gu: {
    screenTitle: 'AI ભલામણો',
    screenSubtitle: 'વિસ્તૃત ભલામણ કાર્ડ',
    notifications: 'સૂચનાઓ',
    irrigationTitle: '🌧️ ઘઉંની સિંચાઇ 48 કલાક વિલંબે',
    irrigationDesc: '23 જુન પર તોફાનની ચેતવણી પ્રાકૃતિક માટી ભેજ પ્રદાન કરશે. જલભરાવ મૂળોથી બચવા માટે સિંચાઇ બંધ રાખે છે.',
    irrigationExplanation: 'વરસાદ પહેલાં ફસલોને પ્લાવવું માટી સંકોચન અને મૂળ ક્ષેત્રમાં ઓક્સીજન ભુખ્યતા તરફ દોરી જાય છે. રાહ જોવું પાણી બચાય છે અને મૂળ સ્વાસ્થ્યની રક્ષા કરે છે.',
    fertilizerTitle: '🌾 25 જુન પર નાઇટ્રોજન ખાતર લાગુ કરો',
    fertilizerDesc: 'વરસાદ પછીની શ્રેષ્ઠ સુકી માટી સ્થિતિ નાઇટ્રોજન શોષણ અને લીલા મુકુટ વૃદ્ધિને વધારશે.',
    fertilizerExplanation: 'સહેજ ભીની માટી (વરસાદ પછી) યુરિયા દાણાને ધીરે ધીરે ઓગળવા અને માટીમાં સમાન રીતે પ્રવેશ કરવાની છૂટ આપે છે, ગેસ અસ્થિરતા નુકસાનને રોકે છે.',
    pestTitle: '🐛 પ્લૉટ બી (શાકભાજીમાં) નીમનો તેલ છંટવો',
    pestDesc: 'NDVI સ્કેન સીમાઓ પર પીળાશ સૂચવે છે, સંભવતઃ પ્રારંભિક એફિડ વસાહત. જૈવિક સ્પ્રે લાગુ કરો.',
    pestExplanation: 'નીમનો તેલ પ્રાકૃતિક ખોરાક અવરોધક અને જંતુ વૃદ્ધિ હોર્મોનના વિક્ષેપક તરીકે કાર્ય કરે છે, પ્રારંભિક એફિડ વસાહતને ફેલાતા પહેલાં ધરી રાખે છે.',
    mandiTitle: '💰 કરનાલ મંડીમાં ઘઉંનો અનાજ વેચો',
    mandiDesc: 'APMC દર સરપ્લાય અછતને કારણે ₹2,420/Q સુધી વધ્યો. વર્તમાન કીમતો મોસમી સરેરાશ કરતાં +12% છે.',
    mandiExplanation: 'જેમ જેમ સરકાર ખરીદ વિંડોઝ ખોલે છે તેમ તેમ માંગ શિખર પર છે. તાજા શિપમેન્ટ આવવાથી કીમતો આગલા હફ્તે 4% ક્રમમાં સમાયોજિત થવાનું અપેક્ષિત છે.',
    saved: 'સલાહ તમારી વ્યક્તિગત ખેતી શેડ્યુલમાં સાચવાઈ છે.',
    whyExplanation: 'શા માટે',
    hide: 'છુપાવો',
    save: 'બચાવો',
    aiReasoning: '🔬 AI તર્ક',
    errorSharing: 'શેરિંગ ડ્રોઅર ખોલી શક્યું નહીં.',
  },
  mr: {
    screenTitle: 'AI शिफारसें',
    screenSubtitle: 'विस्तारयोग्य शिफारस कार्ड',
    notifications: 'सूचना',
    irrigationTitle: '🌧️ गव्हाराचे सिंचन 48 तास विलंबे',
    irrigationDesc: '23 जुनला वादळाचे इशारे नैसर्गिक माती ओलावा प्रदान करेल. जलभराव मुळांपासून वाचण्यासाठी सिंचन विलंबित करते.',
    irrigationExplanation: 'वादळापूर्वी पिकांना भिजवल्याने माती संकुचित होते आणि मुळ क्षेत्रातील ऑक्सीजनची भूक निर्माण होते. प्रतीक्षा पाणी बचवते आणि मुळ आरोग्य संरक्षित करते.',
    fertilizerTitle: '🌾 25 जुनला नायट्रोजन खत लागू करा',
    fertilizerDesc: 'पाऊसनंतरचे इष्टतम कोरड माती परिस्थिती नायट्रोजन शोषण आणि हिरव्या मुकुट वाढ वाढवेल.',
    fertilizerExplanation: 'किंचित ओलसर माती (पाऊसनंतर) युरिया दाण्यांना हळूहळू विरघळू शकते आणि मातीमध्ये समानपणे प्रवेश करू शकते, वायू अस्थिरता नुकसान रोकते.',
    pestTitle: '🐛 प्लॉट बी (भाजीपाल्यांमध्ये) नीम तेल फवारा',
    pestDesc: 'NDVI स्कॅन सीमावर पिवळेपन सूचित करते, बहुधा प्रारंभिक एफिड वसाहत. जैविक फवारे लागू करा.',
    pestExplanation: 'नीम तेल कीटक वृद्धी हार्मोनचा नैसर्गिक भोजन विरोधक आणि विघ्न तयार करतो, प्रारंभिक एफिड वसाहतांना पसरण्यापूर्वी समाविष्ट करते.',
    mandiTitle: '💰 करनाल मंडीमध्ये गव्हार धान्य विक्रय करा',
    mandiDesc: 'आपूर्ती अभावामुळे APMC दर ₹2,420/क्यू पर्यंत वाढले. सध्याची किंमत हंगामी सरासरीपेक्षा +12% आहे.',
    mandiExplanation: 'सरकार खरेदी खिडकी उघडल्यामुळे मागणी शिखरावर आहे. ताज्या शिपमेंट आल्यामुळे किंमत पुढील आठवड्यात 4% कमी होण्याचा अंदाज आहे.',
    saved: 'सल्ला आपल्या व्यक्तिगत शेती वेळापत्रकात साठवला आहे.',
    whyExplanation: 'का',
    hide: 'लपवा',
    save: 'साठवा',
    aiReasoning: '🔬 AI तर्क',
    errorSharing: 'शेअरिंग ड्रोअर उघडू शकला नाही.',
  },
};

interface RecommendationItem {
  id: string;
  category: 'irrigation' | 'fertilizer' | 'pest' | 'mandi' | 'scheme';
  title: string;
  desc: string;
  explanation: string;
  isCompleted: boolean;
  isSaved: boolean;
}

export default function AIRecommendationsScreen() {
  const colors = useThemeColors();
  const t = useType();
  const scheme = useColorScheme();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Recommendations state
  const [items, setItems] = useState<RecommendationItem[]>([
    {
      id: 'r1',
      category: 'irrigation',
      title: s.irrigationTitle,
      desc: s.irrigationDesc,
      explanation: s.irrigationExplanation,
      isCompleted: false,
      isSaved: false,
    },
    {
      id: 'r2',
      category: 'fertilizer',
      title: s.fertilizerTitle,
      desc: s.fertilizerDesc,
      explanation: s.fertilizerExplanation,
      isCompleted: false,
      isSaved: true,
    },
    {
      id: 'r3',
      category: 'pest',
      title: s.pestTitle,
      desc: s.pestDesc,
      explanation: s.pestExplanation,
      isCompleted: true,
      isSaved: false,
    },
    {
      id: 'r4',
      category: 'mandi',
      title: s.mandiTitle,
      desc: s.mandiDesc,
      explanation: s.mandiExplanation,
      isCompleted: false,
      isSaved: false,
    },
  ]);

  const handleToggleComplete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setItems(prev => prev.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item));
  };

  const handleToggleSave = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setItems(prev => prev.map(item => item.id === id ? { ...item, isSaved: !item.isSaved } : item));
    Alert.alert('Saved', s.saved);
  };

  const handleShare = async (title: string, desc: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Share.share({ message: `KrishiAI Advisory Recommendation: ${title}. ${desc}` });
    } catch {
      Alert.alert('Error', s.errorSharing);
    }
  };

  const handleToggleExplanation = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setExpandedId(prev => prev === id ? null : id);
  };

  const getCategoryColor = (cat: string) => {
    if (cat === 'irrigation') return colors.info;
    if (cat === 'fertilizer') return colors.accent;
    if (cat === 'pest') return colors.danger;
    if (cat === 'mandi') return '#f97316';
    return colors.success;
  };

  return (
    <Screen
      title={s.screenTitle}
      emoji="🤖"
      subtitle={s.screenSubtitle}
      back
      right={<HeaderIconButton icon="bell" onPress={() => {}} label={s.notifications} />}
    >
      {items.map((item, index) => {
        const isExpanded = expandedId === item.id;
        const catColor = getCategoryColor(item.category);

        return (
          <FadeInUp key={item.id} index={index} distance={16}>
            <GlassCard
              accent={item.isCompleted}
              padding={18}
              style={{
                borderColor: item.isCompleted ? colors.border : catColor,
                borderWidth: item.isCompleted ? 1 : 1.5,
              }}
            >
              {/* Main Content */}
              <View style={styles.cardHeader}>
                <PressableScale
                  onPress={() => handleToggleComplete(item.id)}
                  haptic="medium"
                  style={styles.checkbox}
                >
                  <View
                    style={[
                      styles.checkboxInner,
                      {
                        borderColor: item.isCompleted ? colors.accent : catColor,
                        backgroundColor: item.isCompleted ? colors.accent : 'transparent',
                      },
                    ]}
                  >
                    {item.isCompleted && <Feather name="check" size={10} color="#ffffff" />}
                  </View>
                </PressableScale>

                <View style={{ flex: 1, gap: 4 }}>
                  <Text
                    style={[
                      t.bodyStrong,
                      {
                        color: colors.text,
                        textDecorationLine: item.isCompleted ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      t.caption,
                      {
                        color: colors.textSecondary,
                        textDecorationLine: item.isCompleted ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>

              {/* Expandable Explanation */}
              {isExpanded && (
                <View style={[styles.explanationBlock, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={[t.label, { color: colors.text }]}>{s.aiReasoning}</Text>
                  <Text style={[t.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
                    {item.explanation}
                  </Text>
                </View>
              )}

              {/* Card Footer Actions */}
              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <PressableScale
                  onPress={() => handleToggleExplanation(item.id)}
                  haptic="light"
                  style={styles.footerBtn}
                >
                  <Feather name={isExpanded ? 'chevron-up' : 'help-circle'} size={12} color={colors.textSecondary} />
                  <Text style={[styles.footerBtnText, { color: colors.textSecondary }]}>
                    {isExpanded ? s.hide : s.whyExplanation}
                  </Text>
                </PressableScale>

                <View style={styles.footerRight}>
                  <PressableScale
                    onPress={() => handleToggleSave(item.id)}
                    haptic="light"
                    style={styles.footerBtn}
                  >
                    <Feather name={item.isSaved ? 'bookmark' : 'bookmark'} size={12} color={item.isSaved ? colors.accent : colors.textSecondary} />
                    <Text style={[styles.footerBtnText, { color: item.isSaved ? colors.accent : colors.textSecondary }]}>
                      {item.isSaved ? 'Saved' : s.save}
                    </Text>
                  </PressableScale>

                  <PressableScale
                    onPress={() => handleShare(item.title, item.desc)}
                    haptic="light"
                    style={styles.footerBtn}
                  >
                    <Feather name="share-2" size={12} color={colors.textSecondary} />
                    <Text style={[styles.footerBtnText, { color: colors.textSecondary }]}>Share</Text>
                  </PressableScale>
                </View>
              </View>
            </GlassCard>
          </FadeInUp>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  checkbox: { paddingVertical: 2 },
  checkboxInner: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explanationBlock: {
    padding: 12,
    borderRadius: DesignTokens.radius.medium,
    gap: 6,
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, flexShrink: 1 },
  footerBtnText: { fontSize: 10, fontWeight: '700' },
  footerRight: { flexDirection: 'row', gap: 16, flexShrink: 1 },
});
