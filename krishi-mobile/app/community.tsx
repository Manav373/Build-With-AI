import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp, Pulse } from '@/components/ui/Motion';

interface Post {
  id: string;
  author: string;
  location: string;
  badge: 'Expert' | 'Progressive Farmer' | 'Agri Officer' | null;
  time: string;
  content: string;
  likes: number;
  commentsCount: number;
  aiSuggested: string;
  isLiked: boolean;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  badge: string | null;
  text: string;
  time: string;
  isVoice?: boolean;
}

const STRINGS = {
  en: {
    title: 'Farmers Hub',
    feedSubtitle: 'Regional Community Feed',
    discussionSubtitle: 'Discussion Thread',
    postPlaceholder: 'Share crop updates or ask...',
    addPhoto: 'Add Photo',
    publish: 'Publish',
    advisoryAnswers: 'ADVISORY ANSWERS',
    listenVoice: 'Listen (32s)',
    share: 'Share',
    likes: 'Likes',
    comments: 'Comments',
    instantDiagnosis: 'Instant AI Diagnosis',
    play: 'Play',
    yourName: 'Manav (You)',
    justNow: 'Just now',
    aiDrafting: 'AI is drafting a diagnostic answer... Check back in 1 minute.',
    voicePlayback: 'Audio Playback',
    playing: 'Playing vocal response recorded by Sukhdev Singh.',
    // Post 1 content
    p1Author: 'Rajesh Chaudhary',
    p1Location: 'Rampur, Karnal',
    p1Badge: 'Progressive Farmer',
    p1Time: '2 hours ago',
    p1Content: 'My wheat leaves are starting to develop yellow stripe spots on the borders. Has anyone encountered this in the Karnal area recently? Is it yellow rust?',
    p1AISuggested: 'AI Alert: Based on humidity and leaf patterns, this highly matches Yellow Rust (Puccinia striiformis). Spray Propiconazole 25% EC.',
    p1Likes: '24',
    p1Comments: '3',
    // Post 1 replies
    r1Author: 'Dr. Ramesh Sharma',
    r1Badge: 'KVK Agronomist',
    r1Text: 'Yes Rajesh, this is early Yellow Rust stage. Clear any clogged drainage pipes immediately. Apply Propiconazole (200ml/acre).',
    r1Time: '1 hour ago',
    r2Author: 'Sukhdev Singh',
    r2Badge: 'Wheat Expert',
    r2Text: "Had this last year. Make sure you spray early morning. Don't spray if rain is coming.",
    r2Time: '45 mins ago',
    // Post 2 content
    p2Author: 'Amit Yadav',
    p2Location: 'Nilokheri, Haryana',
    p2Badge: null,
    p2Time: '5 hours ago',
    p2Content: 'Looking to purchase a second-hand rotavator implement. What is the current market price or going rate in mandis?',
    p2AISuggested: 'AI Index: Standard used rotavators (multi-speed) sell for ₹45,000 to ₹75,000 depending on blade wear and gearbox status.',
    p2Likes: '12',
    p2Comments: '1',
    // Post 2 reply
    r3Author: 'Vikram Maan',
    r3Text: 'Check the Nilokheri APMC bulletin board. Two listings were put up yesterday.',
    r3Time: '2 hours ago',
  },
  hi: {
    title: 'किसान हब',
    feedSubtitle: 'क्षेत्रीय समुदाय फ़ीड',
    discussionSubtitle: 'चर्चा थ्रेड',
    postPlaceholder: 'फसल अपडेट साझा करें या पूछें...',
    addPhoto: 'फ़ोटो जोड़ें',
    publish: 'प्रकाशित करें',
    advisoryAnswers: 'सलाहकार उत्तर',
    listenVoice: 'सुनें (32s)',
    share: 'साझा करें',
    likes: 'पसंद',
    comments: 'टिप्पणियां',
    instantDiagnosis: 'तुरंत AI निदान',
    play: 'चलाएं',
    yourName: 'मनव (आप)',
    justNow: 'अभी',
    aiDrafting: 'AI एक निदान उत्तर तैयार कर रहा है... 1 मिनट में जांचें।',
    voicePlayback: 'ऑडियो प्लेबैक',
    playing: 'सुखदेव सिंह द्वारा दर्ज की गई वॉयस प्रतिक्रिया चल रही है।',
    p1Author: 'राजेश चौधरी',
    p1Location: 'रामपुर, करनाल',
    p1Badge: 'प्रगतिशील किसान',
    p1Time: '2 घंटे पहले',
    p1Content: 'मेरी गेहूं की पत्तियों पर किनारों पर पीली धारियां दिख रही हैं। क्या किसी को हाल ही में करनाल क्षेत्र में ऐसा हुआ है? क्या यह पीली जंग है?',
    p1AISuggested: 'AI सतर्कता: नमी और पत्ती के पैटर्न के आधार पर, यह अत्यधिक पीली जंग (पुक्सिनिया स्ट्रिइफॉर्मिस) से मेल खाता है। प्रोपिकोनाजोल 25% EC का छिड़काव करें।',
    p1Likes: '24',
    p1Comments: '3',
    r1Author: 'डॉ. रमेश शर्मा',
    r1Badge: 'KVK कृषि विज्ञानी',
    r1Text: 'हां राजेश, यह पीली जंग का शुरुआती चरण है। तुरंत किसी भी बंद जल निकासी पाइप को साफ करें। प्रोपिकोनाजोल (200ml/एकड़) लागू करें।',
    r1Time: '1 घंटा पहले',
    r2Author: 'सुखदेव सिंह',
    r2Badge: 'गेहूं विशेषज्ञ',
    r2Text: 'पिछले साल मेरे साथ भी ऐसा हुआ था। सुनिश्चित करें कि आप सुबह जल्दी छिड़काव करें। अगर बारिश आने वाली है तो छिड़काव न करें।',
    r2Time: '45 मिनट पहले',
    p2Author: 'अमित यादव',
    p2Location: 'निलोखेरी, हरियाणा',
    p2Badge: null,
    p2Time: '5 घंटे पहले',
    p2Content: 'दूसरा हाथ रोटावेटर उपकरण खरीदना चाहता हूं। मंडियों में वर्तमान बाजार मूल्य या दर क्या है?',
    p2AISuggested: 'AI सूचकांक: मानक इस्तेमाल किए गए रोटावेटर (मल्टी-स्पीड) ₹45,000 से ₹75,000 तक बिकते हैं ब्लेड पहनने और गियरबॉक्स स्थिति के आधार पर।',
    p2Likes: '12',
    p2Comments: '1',
    r3Author: 'विक्रम मान',
    r3Text: 'निलोखेरी APMC बुलेटिन बोर्ड देखें। कल दो लिस्टिंग डाली गई थीं।',
    r3Time: '2 घंटे पहले',
  },
  gu: {
    title: 'ખેડૂતો હબ',
    feedSubtitle: 'પ્રાદેશિક સમુદાય ફીડ',
    discussionSubtitle: 'ચર્ચા થ્રેડ',
    postPlaceholder: 'પાક અપડેટ્સ શેર કરો અથવા પૂછો...',
    addPhoto: 'ફોટો ઉમેરો',
    publish: 'પ્રકાશિત કરો',
    advisoryAnswers: 'સલાહ જવાબ',
    listenVoice: 'સાંભળો (32s)',
    share: 'શેર કરો',
    likes: 'પસંદ',
    comments: 'ટિપ્પણીઓ',
    instantDiagnosis: 'તાત્કાલિક AI નિદાન',
    play: 'ચલાવો',
    yourName: 'મનવ (તમે)',
    justNow: 'હમણાં જ',
    aiDrafting: 'AI નિદાન જવાબ તૈયાર કરી રહ્યો છે... 1 મિનિટમાં ચેક કરો।',
    voicePlayback: 'ઓડિયો પ્લેબેક',
    playing: 'સુખદેવ સિંહ દ્વારા રેકોર્ડ કરેલ વૉઇસ પ્રતિક્રિયા ચલાઈ રહી છે।',
    p1Author: 'રાજેશ ચૌધરી',
    p1Location: 'રામપુર, કર્નલ',
    p1Badge: 'પ્રગતિશીલ ખેડૂત',
    p1Time: '2 કલાક પહેલાં',
    p1Content: 'મારી ઘઉંની પાંદડાઓ પર કોરે પર પીળી ડોટીવાળી ધાર્યો દેખાતો છે. શું કોઈને આજકાલ કર્નલ વિસ્તારમાં આ અનુભવ છે? શું આ પીળો કાટ છે?',
    p1AISuggested: 'AI ચેતવણી: ભેજ અને પાંદડાની પેટર્ન પર આધારિત, આ અત્યધિક પીલો કાટ (પુક્સિનિયા સ્ટ્રાઇફોર્મિસ) સાથે મેળ ખાય છે. પ્રોપિકોનાજોલ 25% EC છંટકાવો.',
    p1Likes: '24',
    p1Comments: '3',
    r1Author: 'ડૉ. રમેશ શર્મા',
    r1Badge: 'KVK ખેતી વિજ્ઞાની',
    r1Text: 'હા રાજેશ, આ પીળો કાટનો પ્રાથમિક તબક્કો છે. તરત જ કોઈ પણ અવરોધિત ડ્રેનેજ પાઇપ સાફ કરો. પ્રોપિકોનાજોલ (200ml/એકર) લાગુ કરો.',
    r1Time: '1 કલાક પહેલાં',
    r2Author: 'સુખદેવ સિંહ',
    r2Badge: 'ઘઉં નિષ્ણાત',
    r2Text: 'પાછલા વર્ષે મને આ હતું. ખાતરી કરો કે તમે વહેલી સવારે છંટકાવો કરો. અમુક વરસાદ આવતો હોય તો છંટકાવો કરશો નહીં.',
    r2Time: '45 મિનિટ પહેલાં',
    p2Author: 'અમીત યાદવ',
    p2Location: 'નીલોખેરી, હરિયાણા',
    p2Badge: null,
    p2Time: '5 કલાક પહેલાં',
    p2Content: 'બીજો હાથ રોટાવેટર સાધન ખરીદવો છે. તમે મંડીઓમાં વર્તમાન બજાર ભાવ અથવા દર શું છે?',
    p2AISuggested: 'AI ઈન્ડેક્સ: પ્રમાણભૂત ઉપયોગમાં લેવાયેલા રોટાવેટર (મલ્ટિ-સ્પીડ) ₹45,000 થી ₹75,000 વચ્ચે વેચાય છે બ્લેડ પહેર અને ગીયરબોક્સ સ્થિતિના આધારે.',
    p2Likes: '12',
    p2Comments: '1',
    r3Author: 'વિક્રમ માન',
    r3Text: 'નીલોખેરી APMC બુલેટિન બોર્ડ જાણો. કાલ બે સૂચિબદ્ધતાઓ મૂકવામાં આવી હતી.',
    r3Time: '2 કલાક પહેલાં',
  },
  mr: {
    title: 'शेतकरी हब',
    feedSubtitle: 'प्रादेशिक समुदाय फीड',
    discussionSubtitle: 'चर्चा धागा',
    postPlaceholder: 'पिकांच्या अपडेट्स शेअर करा किंवा विचारा...',
    addPhoto: 'फोटो जोडा',
    publish: 'प्रकाशित करा',
    advisoryAnswers: 'सल्लागार उत्तरे',
    listenVoice: 'ऐका (32s)',
    share: 'शेअर करा',
    likes: 'पसंती',
    comments: 'टिप्पण्या',
    instantDiagnosis: 'तत्काळ AI निदान',
    play: 'चालवा',
    yourName: 'मनव (तुम)',
    justNow: 'अभीच',
    aiDrafting: 'AI निदान उत्तर तयार करत आहे... 1 मिनिटात तपासा।',
    voicePlayback: 'ऑडिओ प्लेबॅक',
    playing: 'सुखदेव सिंह यांनी रेकॉर्ड केलेले व्हॉइस प्रतिसाद चालू आहे।',
    p1Author: 'राजेश चौधरी',
    p1Location: 'रामपूर, करनाल',
    p1Badge: 'प्रगतिशील शेतकरी',
    p1Time: '2 तास आधी',
    p1Content: 'माझ्या गव्हाच्या पानांवर कडेला पिवळ्या धारीचे डाग दिसत आहेत. करनाल क्षेत्रात हाल ही कोणाला हे अनुभवले आहे का? हे पिवळ्या गंज आहे का?',
    p1AISuggested: 'AI सतर्कता: आर्द्रता आणि पानाच्या पॅटर्नच्या आधारे, हे अत्यंत पिवळ्या गंज (पुकसिनिया स्ट्रिफॉर्मिस) सारखे आहे. प्रोपिकोनाজोल 25% EC फवारा करा.',
    p1Likes: '24',
    p1Comments: '3',
    r1Author: 'डॉ. रमेश शर्मा',
    r1Badge: 'KVK कृषिविज्ञानी',
    r1Text: 'होय राजेश, हे पिवळ्या गंजाचे प्रारंभिक टप्पा आहे. त्वरित कोणत्याही अवरोधित ड्रेनेज पाईप साफ करा. प्रोपिकोनाजोल (200ml/एकर) लागू करा.',
    r1Time: '1 तास आधी',
    r2Author: 'सुखदेव सिंह',
    r2Badge: 'गव्हाचे तज्ञ',
    r2Text: 'मला गेल्या वर्षी हेच झाले. सुनिश्चित करा की तुम्ही पहाटे फवारा करा. जर पाऊस येणार असेल तर फवारा करू नका.',
    r2Time: '45 मिनिटे आधी',
    p2Author: 'अमित यादव',
    p2Location: 'निलोखेरी, हरियाणा',
    p2Badge: null,
    p2Time: '5 तास आधी',
    p2Content: 'दुसऱ्या हाताचे रोटावेटर साधन खरेदी करायचे आहे. मंडीतील सद्य बाजार भाव किंवा दर काय आहे?',
    p2AISuggested: 'AI सूचकांक: मानक वापरलेले रोटावेटर (मल्टी-स्पीड) ₹45,000 ते ₹75,000 दरम्यान विक्री होतात ब्लेड पहाटे आणि गीयरबॉक्स स्थितीनुसार.',
    p2Likes: '12',
    p2Comments: '1',
    r3Author: 'विक्रम मान',
    r3Text: 'निलोखेरी APMC बुलेटिन बोर्ड तपासा. कल दोन सूचना पोस्ट केल्या गेल्या होत्या.',
    r3Time: '2 तास आधी',
  },
};

export default function CommunityScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);

  // State machine: feed | discussion
  const [viewMode, setViewMode] = useState<'feed' | 'discussion'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostText, setNewPostText] = useState('');

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'p1',
      author: s.p1Author,
      location: s.p1Location,
      badge: s.p1Badge,
      time: s.p1Time,
      content: s.p1Content,
      likes: 24,
      commentsCount: 3,
      aiSuggested: s.p1AISuggested,
      isLiked: false,
      replies: [
        { id: 'r1', author: s.r1Author, badge: s.r1Badge, text: s.r1Text, time: s.r1Time },
        { id: 'r2', author: s.r2Author, badge: s.r2Badge, text: s.r2Text, time: s.r2Time, isVoice: true },
      ],
    },
    {
      id: 'p2',
      author: s.p2Author,
      location: s.p2Location,
      badge: s.p2Badge,
      time: s.p2Time,
      content: s.p2Content,
      likes: 12,
      commentsCount: 1,
      aiSuggested: s.p2AISuggested,
      isLiked: true,
      replies: [
        { id: 'r3', author: s.r3Author, badge: null, text: s.r3Text, time: s.r3Time },
      ],
    },
  ]);

  const handlePostLike = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  const handleSharePost = async (p: Post) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Share.share({ message: `Farming Discussion by ${p.author}: "${p.content}" - Read replies on KrishiAI.` });
    } catch {
      Alert.alert('Error', 'Unable to share post.');
    }
  };

  const handleOpenDiscussion = (p: Post) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedPost(p);
    setViewMode('discussion');
  };

  const handlePublishPost = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (newPostText.trim() === '') return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: s.yourName,
      location: 'Rampur, Karnal',
      badge: s.p1Badge,
      time: s.justNow,
      content: newPostText,
      likes: 0,
      commentsCount: 0,
      aiSuggested: s.aiDrafting,
      isLiked: false,
      replies: [],
    };
    setPosts(prev => [newPost, ...prev]);
    setNewPostText('');
  };

  const handleVoicePlayback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(s.voicePlayback, s.playing);
  };

  return (
    <Screen
      title={s.title}
      emoji="👥"
      subtitle={viewMode === 'feed' ? s.feedSubtitle : s.discussionSubtitle}
      back
      onBack={() => {
        if (viewMode === 'discussion') {
          setViewMode('feed');
        } else {
          router.back();
        }
      }}
    >
      {viewMode === 'feed' ? (
        <>
          {/* Create Post Card */}
          <FadeInUp index={0} distance={16}>
            <GlassCard padding={16}>
              <View style={styles.postInputRow}>
                <TextInput
                  placeholder={s.postPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  value={newPostText}
                  onChangeText={setNewPostText}
                  multiline
                  style={[t.bodySmall, { color: colors.text, flex: 1, textAlignVertical: 'top' }]}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 10 }}>
                <PressableScale onPress={() => Alert.alert('Upload', 'Select photo to attach.')} haptic="light">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surfaceElevated, borderRadius: 10 }}>
                    <Feather name="camera" size={14} color={colors.accent} />
                    <Text style={[t.caption, { color: colors.text, fontWeight: '700' }]}>{s.addPhoto}</Text>
                  </View>
                </PressableScale>
                <PressableScale onPress={handlePublishPost} haptic="medium">
                  <View style={{ backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18 }}>
                    <Text style={{ color: '#ffffff', fontSize: 12.5, fontWeight: '700' }}>{s.publish}</Text>
                  </View>
                </PressableScale>
              </View>
            </GlassCard>
          </FadeInUp>

          {/* Posts feed */}
          {posts.map((post, idx) => (
            <FadeInUp key={post.id} index={idx + 1} distance={16}>
              <GlassCard padding={16}>
                {/* Author row */}
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16 }}>👨‍🌾</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text numberOfLines={1} style={[t.bodyStrong, { color: colors.text, flexShrink: 1 }]}>{post.author}</Text>
                      {post.badge && (
                        <Pulse active={true}>
                          <View style={{ backgroundColor: `${colors.accent}1c`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderColor: colors.accent, borderWidth: 0.5, flexShrink: 1 }}>
                            <Text numberOfLines={1} style={[t.caption, { color: colors.accent, fontWeight: '700' }]}>{post.badge}</Text>
                          </View>
                        </Pulse>
                      )}
                    </View>
                    <Text numberOfLines={1} style={[t.caption, { color: colors.textMuted, marginTop: 2 }]}>{post.location} • {post.time}</Text>
                  </View>
                </View>

                {/* Content */}
                <Text style={[t.bodySmall, { color: colors.text, lineHeight: 18.5 }]}>{post.content}</Text>

                {/* AI Assistant response summary */}
                <View style={{ backgroundColor: colors.surfaceElevated, padding: 12, borderRadius: 14, gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="brain" size={13} color={colors.accent} />
                    <Text numberOfLines={1} style={[t.caption, { color: colors.accent, fontWeight: '800', flexShrink: 1 }]}>{s.instantDiagnosis}</Text>
                  </View>
                  <Text style={[t.caption, { color: colors.textSecondary, lineHeight: 15 }]}>{post.aiSuggested}</Text>
                </View>

                {/* Actions row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1, marginTop: 8 }}>
                  <PressableScale onPress={() => handlePostLike(post.id)} haptic="light">
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}>
                      <Feather name="thumbs-up" size={13} color={post.isLiked ? colors.accent : colors.textSecondary} />
                      <Text style={[t.caption, { color: post.isLiked ? colors.accent : colors.textSecondary, fontWeight: '700' }]}>
                        {post.likes}
                      </Text>
                    </View>
                  </PressableScale>

                  <PressableScale onPress={() => handleOpenDiscussion(post)} haptic="light">
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}>
                      <Feather name="message-square" size={13} color={colors.textSecondary} />
                      <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '700' }]}>
                        {post.commentsCount}
                      </Text>
                    </View>
                  </PressableScale>

                  <PressableScale onPress={() => handleSharePost(post)} haptic="light">
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}>
                      <Feather name="share-2" size={13} color={colors.textSecondary} />
                      <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '700' }]}>{s.share}</Text>
                    </View>
                  </PressableScale>
                </View>
              </GlassCard>
            </FadeInUp>
          ))}
        </>
      ) : (
        selectedPost && (
          <>
            {/* Original Post */}
            <FadeInUp index={0} distance={16}>
              <GlassCard padding={16}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16 }}>👨‍🌾</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={[t.bodyStrong, { color: colors.text }]}>{selectedPost.author}</Text>
                    <Text numberOfLines={1} style={[t.caption, { color: colors.textMuted }]}>{selectedPost.location} • {selectedPost.time}</Text>
                  </View>
                </View>
                <Text style={[t.bodySmall, { color: colors.text, lineHeight: 20 }]}>{selectedPost.content}</Text>
              </GlassCard>
            </FadeInUp>

            {/* Expert highlighted comment */}
            <View style={{ marginTop: 4 }}>
              <Text style={[t.overline, { color: colors.textMuted, paddingHorizontal: 4 }]}>{s.advisoryAnswers}</Text>
            </View>

            {selectedPost.replies.map((reply, idx) => (
              <FadeInUp key={reply.id} index={idx + 1} distance={16}>
                <GlassCard padding={16} accent={!!reply.badge}>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14 }}>{reply.badge ? '🎓' : '🧑'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text numberOfLines={1} style={[t.bodyStrong, { color: colors.text, flexShrink: 1 }]}>{reply.author}</Text>
                        {reply.badge && (
                          <View style={{ backgroundColor: `${colors.accent}1c`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexShrink: 1 }}>
                            <Text numberOfLines={1} style={[t.caption, { color: colors.accent, fontWeight: '700' }]}>{reply.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[t.caption, { color: colors.textMuted }]}>{reply.time}</Text>
                    </View>
                  </View>

                  <Text style={[t.bodySmall, { color: colors.text, lineHeight: 18, marginBottom: 8 }]}>{reply.text}</Text>

                  {/* Voice playback option */}
                  {reply.isVoice && (
                    <PressableScale onPress={handleVoicePlayback} haptic="light">
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: colors.surfaceElevated, borderRadius: 10 }}>
                        <Feather name="play-circle" size={13} color={colors.accent} />
                        <Text style={[t.caption, { color: colors.text, fontWeight: '600' }]}>{s.listenVoice}</Text>
                      </View>
                    </PressableScale>
                  )}
                </GlassCard>
              </FadeInUp>
            ))}
          </>
        )
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  postInputRow: { minHeight: 60 },
});
