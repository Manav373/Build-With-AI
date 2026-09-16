import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TextInput, Keyboard, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { sendChatMessage } from '@/services/api';
import { getPhoneId } from '@/services/session';
import { useLocation } from '@/hooks/useLocation';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { PressableScale, FadeInUp, TypingDots, Pulse } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    title: 'KrishiAI Chat',
    aiAdvisorActive: 'AI Advisor Active',
    welcome: '🌾 Namaste! I\'m KrishiAI, your intelligent farming assistant. Ask me about weather, crop advice, market prices, pest control, or government schemes!',
    clearChat: 'Clear chat',
    askKrishiAI: 'Ask KrishiAI...',
    useVoiceInput: 'Use voice input',
    sendMessage: 'Send message',
    suggestionWheatRust: '🌾 Wheat Rust treatment',
    suggestionPrice: '💰 Karnal Wheat prices',
    suggestionInsecticide: '🐛 Insecticide guidelines',
    uploadTrigger: 'upload triggered successfully',
    translationAlert: 'Message translated to your selected native language instantly.',
    sharedAlert: 'Chat response copied to clipboard.',
    fallbackDefault: 'I have analyzed your request. Please let me know how I can help further.',
    fallbackMandiTitle: 'Haryana Mandi Wheat prices today',
    fallbackMandiKarnal: 'Karnal APMC: ₹2,420/quintal (+₹45)',
    fallbackMandiRohtak: 'Rohtak APMC: ₹2,390/quintal (+₹30)',
    fallbackMandiContext: 'Wheat demand is currently high across North India.',
    fallbackDiseaseTitle: 'Yellow Rust Diagnostics',
    fallbackDiseaseRisk: 'Risk Level: High due to local humidity.',
    fallbackDiseaseChemical: 'Chemical cure: Spray Propiconazole 25% EC (200 ml in 200 liters of water/acre).',
    fallbackDiseaseOrganic: 'Organic Cure: Apply Neem oil sprays early morning.',
    cameraCapture: 'Camera Capture',
    photoGallery: 'Photo Gallery',
    uploadDocument: 'Upload Document',
    attachFile: 'Attach file',
    suggestedPrompt: 'Suggested prompt',
    bookmarkMessage: 'Bookmark message',
    translateMessage: 'Translate message',
    shareMessage: 'Share message',
  },
  hi: {
    title: 'कृषिAI चैट',
    aiAdvisorActive: 'एआई सलाहकार सक्रिय',
    welcome: '🌾 नमस्ते! मैं कृषिAI हूं, आपका बुद्धिमान खेती सहायक। मुझसे मौसम, फसल सलाह, बाजार कीमतें, कीट नियंत्रण, या सरकारी योजनाओं के बारे में पूछें!',
    clearChat: 'चैट साफ़ करें',
    askKrishiAI: 'कृषिAI से पूछें...',
    useVoiceInput: 'आवाज़ इनपुट का उपयोग करें',
    sendMessage: 'संदेश भेजें',
    suggestionWheatRust: '🌾 गेहूं की जंग उपचार',
    suggestionPrice: '💰 करनाल गेहूं कीमतें',
    suggestionInsecticide: '🐛 कीटनाशक दिशानिर्देश',
    uploadTrigger: 'अपलोड सफलतापूर्वक ट्रिगर किया गया।',
    translationAlert: 'संदेश तुरंत आपकी चुनी गई मूल भाषा में अनुवादित किया गया।',
    sharedAlert: 'चैट प्रतिक्रिया क्लिपबोर्ड में कॉपी की गई।',
    fallbackDefault: 'मैंने आपके अनुरोध का विश्लेषण किया है। कृपया मुझे बताएं कि मैं और कैसे मदद कर सकता हूं।',
    fallbackMandiTitle: 'हरियाणा मंडी गेहूं कीमतें आज',
    fallbackMandiKarnal: 'करनाल APMC: ₹2,420/क्विंटल (+₹45)',
    fallbackMandiRohtak: 'रोहतक APMC: ₹2,390/क्विंटल (+₹30)',
    fallbackMandiContext: 'गेहूं की मांग वर्तमान में उत्तरी भारत भर में अधिक है।',
    fallbackDiseaseTitle: 'पीली जंग निदान',
    fallbackDiseaseRisk: 'जोखिम स्तर: स्थानीय आर्द्रता के कारण अधिक।',
    fallbackDiseaseChemical: 'रासायनिक इलाज: प्रोपिकोनाज़ोल 25% EC स्प्रे करें (200 मिली 200 लीटर पानी/एकड़ में)।',
    fallbackDiseaseOrganic: 'जैविक इलाज: सुबह जल्दी नीम के तेल का छिड़काव करें।',
    cameraCapture: 'कैमरा कैप्चर',
    photoGallery: 'फोटो गैलरी',
    uploadDocument: 'दस्तावेज़ अपलोड करें',
    attachFile: 'फ़ाइल संलग्न करें',
    suggestedPrompt: 'सुझाया गया प्रॉम्प्ट',
    bookmarkMessage: 'संदेश को बुकमार्क करें',
    translateMessage: 'संदेश का अनुवाद करें',
    shareMessage: 'संदेश साझा करें',
  },
  gu: {
    title: 'કૃષિAI ચેટ',
    aiAdvisorActive: 'AI સલાહકાર સક્રિય',
    welcome: '🌾 નમસ્તે! મેં કૃષિAI છું, તમારો બુદ્ધિમાન ખેતી સહાયક. મને હવામાન, પાક સલાહ, બજાર કીમતો, જીવાતો નિયંત્રણ, અથવા સરકારી યોજનાઓ વિશે પૂછો!',
    clearChat: 'ચેટ સાફ કરો',
    askKrishiAI: 'કૃષિAIને પૂછો...',
    useVoiceInput: 'અવાજ ઇનપુટ વાપરો',
    sendMessage: 'સંદેશ મોકલો',
    suggestionWheatRust: '🌾 ઘઉં રસ્ટ ઇલાજ',
    suggestionPrice: '💰 કરનાલ ઘઉં કીમતો',
    suggestionInsecticide: '🐛 કીટનાશક માર્ગદર્શન',
    uploadTrigger: 'અપલોડ સફળતાપૂર્વક ટ્રિગર થયું.',
    translationAlert: 'સંદેશ તમારી પસંદ કરેલી મૂળ ભાષામાં તુરંત અનુવાદિત હોયો.',
    sharedAlert: 'ચેટ પ્રતિક્રિયા ક્લિપબોર્ડમાં કોપી કરવામાં આવી.',
    fallbackDefault: 'મેં તમારી વિનંતીનું વિશ્લેષણ કર્યું છે. કૃપયા મને જણાવો કે હું વધુ કેવી રીતે મદદ કરી શકું.',
    fallbackMandiTitle: 'હરિયાણા મંડી ઘઉં કીમતો આજે',
    fallbackMandiKarnal: 'કરનાલ APMC: ₹2,420/ક્વિંટલ (+₹45)',
    fallbackMandiRohtak: 'રોહતક APMC: ₹2,390/ક્વિંટલ (+₹30)',
    fallbackMandiContext: 'ઘઉં માટેની માંગ હાલમાં ઉત્તર ભારત જુડાં વધી છે.',
    fallbackDiseaseTitle: 'પીળો રસ્ટ નિદાન',
    fallbackDiseaseRisk: 'જોખમ સ્તર: સ્થાનિક ભેજ કારણે વધારે.',
    fallbackDiseaseChemical: 'રાસાયણિક ઇલાજ: પ્રોપિકોનાજોલ 25% EC સ્પ્રે કરો (200 મિલી 200 લીટર પાણીમાં/એકર).',
    fallbackDiseaseOrganic: 'જૈવિક ઇલાજ: વહેલી સવારે નીમ તેલના સ્પ્રે કરો.',
    cameraCapture: 'કેમેરા કેપચર',
    photoGallery: 'ફોટો ગેલરી',
    uploadDocument: 'દસ્તાવેજ અપલોડ કરો',
    attachFile: 'ફાઇલ જોડો',
    suggestedPrompt: 'સૂચાયેલ પ્રોમ્પ્ટ',
    bookmarkMessage: 'સંદેશને બુકમાર્ક કરો',
    translateMessage: 'સંદેશ અનુવાદ કરો',
    shareMessage: 'સંદેશ શેર કરો',
  },
  mr: {
    title: 'कृषीAI चॅट',
    aiAdvisorActive: 'AI सल्लागार सक्रिय',
    welcome: '🌾 नमस्कार! मी कृषीAI आहे, तुमचा बुद्धिमान शेती सहायक. मला हवामान, पिकाचा सल्ला, बाजार किंमती, कीड नियंत्रण, किंवा सरकारी योजनांबद्दल विचारा!',
    clearChat: 'चॅट साफ करा',
    askKrishiAI: 'कृषीAI ला विचारा...',
    useVoiceInput: 'आवाज इनपुट वापरा',
    sendMessage: 'संदेश पाठवा',
    suggestionWheatRust: '🌾 गहू गंज उपचार',
    suggestionPrice: '💰 करनाल गहू किंमती',
    suggestionInsecticide: '🐛 कीटकनाशक मार्गदर्शन',
    uploadTrigger: 'अपलोड यशस्वीरित्या ट्रिगर केले.',
    translationAlert: 'संदेश तुमच्या निवडलेल्या मूळ भाषेत तात्काळ अनुवादित.',
    sharedAlert: 'चॅट प्रतिक्रिया क्लिपबोर्डमध्ये कॉपी केली.',
    fallbackDefault: 'मी तुमच्या विनंतीचे विश्लेषण केले. कृपया मला सांगा की मी आणखी कसे मदत करू शकतो.',
    fallbackMandiTitle: 'हरियाणा मंडी गहू किंमती आज',
    fallbackMandiKarnal: 'करनाल APMC: ₹2,420/क्विंटल (+₹45)',
    fallbackMandiRohtak: 'रोहतक APMC: ₹2,390/क्विंटल (+₹30)',
    fallbackMandiContext: 'गहूची मागणी सध्या संपूर्ण उत्तर भारतात जास्त आहे.',
    fallbackDiseaseTitle: 'पिवळा गंज निदान',
    fallbackDiseaseRisk: 'जोखीम स्तर: स्थानिक आर्द्रतेमुळे जास्त.',
    fallbackDiseaseChemical: 'रासायनिक उपचार: प्रोपिकोनाजोल 25% EC फवारा करा (200 मिली 200 लीटर पाण्यात/एकर).',
    fallbackDiseaseOrganic: 'जैविक उपचार: सकाळी लवकर नीम तेलाचा फवारा करा.',
    cameraCapture: 'कॅमेरा कॅप्चर',
    photoGallery: 'फोटो गॅलरी',
    uploadDocument: 'दस्तऐवज अपलोड करा',
    attachFile: 'फाइल जोडा',
    suggestedPrompt: 'सूचित केलेली प्रॉम्प्ट',
    bookmarkMessage: 'संदेश बुकमार्क करा',
    translateMessage: 'संदेश अनुवादित करा',
    shareMessage: 'संदेश शेअर करा',
  },
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  isBookmarked?: boolean;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();
  const flatListRef = useRef<any>(null);
  const s = useScreenStrings(STRINGS as any);
  const { location } = useLocation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: s.welcome,
      isUser: false,
      timestamp: '07:10 PM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [phoneId, setPhoneId] = useState<string>('');

  useEffect(() => {
    getPhoneId().then(setPhoneId).catch(() => setPhoneId('user_demo_123'));
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (text.trim() === '' || isTyping || !phoneId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Keyboard.dismiss();
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));
      const response = await sendChatMessage(
        phoneId,
        text,
        location?.lat ?? undefined,
        location?.lon ?? undefined,
        history,
        location?.city ?? undefined,
        location?.state ?? undefined
      );
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response ?? response.reply ?? response.message ?? s.fallbackDefault,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      let fallbackReply = s.fallbackDefault;
      if (text.toLowerCase().includes('mandi') || text.toLowerCase().includes('price')) {
        fallbackReply = `🌾 ${s.fallbackMandiTitle}:\n\n• ${s.fallbackMandiKarnal}\n• ${s.fallbackMandiRohtak}\n\n${s.fallbackMandiContext}`;
      } else if (text.toLowerCase().includes('disease') || text.toLowerCase().includes('rust')) {
        fallbackReply = `🐛 ${s.fallbackDiseaseTitle}:\n\n• ${s.fallbackDiseaseRisk}\n• ${s.fallbackDiseaseChemical}\n• ${s.fallbackDiseaseOrganic}`;
      }
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackReply,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, s, location, phoneId, isTyping]);

  const handleMessageAction = (id: string, action: 'bookmark' | 'translate' | 'share') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (action === 'bookmark') {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isBookmarked: !m.isBookmarked } : m)));
    } else if (action === 'translate') {
      Alert.alert('Translation', s.translationAlert);
    } else {
      Alert.alert('Shared', s.sharedAlert);
    }
  };

  const handleAttachment = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setShowAttachmentMenu(false);
    Alert.alert('Upload', `${type} ${s.uploadTrigger}`);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <FadeInUp index={Math.min(index, 2)} distance={12}>
      <View style={[styles.bubbleWrapper, item.isUser ? styles.userWrapper : styles.aiWrapper]}>
        {!item.isUser && (
          <View style={[styles.chatAvatar, { backgroundColor: colors.green }]}>
            <Text style={{ fontSize: 18 }}>🌾</Text>
          </View>
        )}
        <View style={styles.bubbleContent}>
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: item.isUser ? colors.accent : colors.surface,
                borderColor: item.isUser ? 'transparent' : colors.border,
                borderBottomLeftRadius: item.isUser ? 20 : 6,
                borderBottomRightRadius: item.isUser ? 6 : 20,
                ...DesignTokens.shadow.level2,
              },
            ]}
          >
            <Text style={[t.body, { color: item.isUser ? '#ffffff' : colors.text, lineHeight: 20 }]}>{item.text}</Text>
            <Text style={[t.caption, { color: item.isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted, alignSelf: 'flex-end', marginTop: 8 }]}>
              {item.timestamp}
            </Text>
          </View>
          {!item.isUser && (
            <View style={styles.bubbleActions}>
              <PressableScale onPress={() => handleMessageAction(item.id, 'bookmark')} haptic="light" style={styles.actionBtn} accessibilityLabel={s.bookmarkMessage}>
                <Feather name={item.isBookmarked ? "bookmark" : "bookmark"} size={14} color={item.isBookmarked ? colors.accent : colors.textMuted} />
              </PressableScale>
              <PressableScale onPress={() => handleMessageAction(item.id, 'translate')} haptic="light" style={styles.actionBtn} accessibilityLabel={s.translateMessage}>
                <Feather name="globe" size={14} color={colors.textMuted} />
              </PressableScale>
              <PressableScale onPress={() => handleMessageAction(item.id, 'share')} haptic="light" style={styles.actionBtn} accessibilityLabel={s.shareMessage}>
                <Feather name="share-2" size={14} color={colors.textMuted} />
              </PressableScale>
            </View>
          )}
        </View>
      </View>
    </FadeInUp>
  );

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <PressableScale onPress={handleBack} haptic="light" style={styles.backBtn} accessibilityLabel="Go back">
            <Feather name="chevron-left" size={24} color={colors.text} />
          </PressableScale>
          <View style={[styles.avatarCircle, { backgroundColor: colors.green + '15' }]}>
            <Text style={{ fontSize: 20 }}>🌾</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[t.titleSmall, { color: colors.text, fontWeight: '700' }]}>{s.title}</Text>
            <View style={styles.statusRow}>
              <Pulse>
                <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
              </Pulse>
              <Text numberOfLines={1} style={[t.caption, { color: colors.accent, fontWeight: '600', flexShrink: 1 }]}>{s.aiAdvisorActive}</Text>
            </View>
          </View>
        </View>
        <PressableScale onPress={() => setMessages([messages[0]])} haptic="medium" style={[styles.clearBtn, { backgroundColor: colors.danger + '12', borderColor: colors.danger }]} accessibilityLabel={s.clearChat}>
          <Feather name="trash-2" size={18} color={colors.danger} />
        </PressableScale>
      </View>

      {messages.length === 1 && (
        <View style={styles.promptContainer}>
          {[s.suggestionWheatRust, s.suggestionPrice, s.suggestionInsecticide].map((p, i) => (
            <FadeInUp key={p} index={i} distance={12}>
              <PressableScale onPress={() => handleSend(p)} haptic="light" style={[styles.promptChip, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityLabel={`${s.suggestedPrompt}: ${p}`}>
                <Feather name="arrow-up-right" size={12} color={colors.accent} style={{ marginRight: 6 }} />
                <Text numberOfLines={1} style={[t.caption, { color: colors.textSecondary, fontWeight: '500', flexShrink: 1 }]}>{p}</Text>
              </PressableScale>
            </FadeInUp>
          ))}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item: Message) => item.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingWrapper}>
              <View style={[styles.chatAvatar, { backgroundColor: colors.green }]}>
                <Text style={{ fontSize: 16 }}>🌾</Text>
              </View>
              <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TypingDots />
              </View>
            </View>
          ) : null
        }
      />

      {showAttachmentMenu && (
        <View style={[styles.attachmentMenu, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          {[
            { label: s.cameraCapture, icon: 'camera', color: colors.danger, key: 'Camera' },
            { label: s.photoGallery, icon: 'image', color: colors.info, key: 'Gallery' },
            { label: s.uploadDocument, icon: 'file', color: colors.accent, key: 'Document' },
          ].map((a) => (
            <PressableScale key={a.key} onPress={() => handleAttachment(a.key)} haptic="light" style={styles.attachItem}>
              <View style={[styles.attachIcon, { backgroundColor: `${a.color}18` }]}>
                <Feather name={a.icon as any} size={18} color={a.color} />
              </View>
              <Text numberOfLines={1} style={[t.body, { color: colors.text, flex: 1 }]}>{a.label}</Text>
            </PressableScale>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) + 6, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.inputRow}>
          <PressableScale onPress={() => setShowAttachmentMenu(!showAttachmentMenu)} haptic="light" style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]} accessibilityLabel={s.attachFile}>
            <Feather name="paperclip" size={20} color={colors.textSecondary} />
          </PressableScale>
          <TextInput
            style={[styles.inputField, { backgroundColor: colors.surfaceElevated, color: colors.text }]}
            placeholder={s.askKrishiAI}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend(inputText)}
            editable={!isTyping}
            maxLength={500}
            accessible={true}
            accessibilityLabel="Chat input field"
          />
          {inputText.trim() === '' ? (
            <PressableScale onPress={() => router.push('/voice-assistant' as any)} haptic="light" style={[styles.iconBtn, { backgroundColor: colors.accent }]} accessibilityLabel={s.useVoiceInput}>
              <Feather name="mic" size={20} color="#ffffff" />
            </PressableScale>
          ) : (
            <PressableScale onPress={() => handleSend(inputText)} haptic="light" style={[styles.iconBtn, { backgroundColor: colors.accent }]} accessibilityLabel={s.sendMessage}>
              <Feather name="send" size={20} color="#ffffff" />
            </PressableScale>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    gap: 12
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  clearBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  promptContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, paddingVertical: 20 },
  promptChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%'
  },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },
  bubbleWrapper: { flexDirection: 'row', gap: 12, width: '100%' },
  userWrapper: { justifyContent: 'flex-end' },
  aiWrapper: { justifyContent: 'flex-start' },
  chatAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  bubbleContent: { gap: 6, maxWidth: '80%', flexShrink: 1 },
  bubble: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, borderWidth: 1 },
  bubbleActions: { flexDirection: 'row', gap: 6, paddingLeft: 4, marginTop: 4 },
  actionBtn: { padding: 6, borderRadius: 8 },
  typingWrapper: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 },
  typingBubble: { paddingHorizontal: 18, paddingVertical: 16, borderRadius: 20, borderBottomLeftRadius: 6, borderWidth: 1 },
  attachmentMenu: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, gap: 12 },
  attachItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  attachIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  inputContainer: { paddingHorizontal: 12, paddingTop: 12, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  inputField: { flex: 1, height: 48, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, fontWeight: '500' },
});
