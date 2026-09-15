import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { LanguageKey, Translations, TranslationSet, Languages } from '@/constants/Translations';

/**
 * KrishiAI Global Language Engine
 * ---------------------------------------------------------------------------
 * Mirrors the ThemeProvider pattern in useColorScheme.tsx:
 *   • The language picked during onboarding is stored here and persists
 *     across the whole app (tabs, tools, settings).
 *   • Optional AsyncStorage persistence — degrades silently if the package
 *     isn't installed (same graceful behavior as the theme engine).
 *
 * Usage:
 *   const { language, setLanguage } = useLanguage();
 *   const t = useTranslations();          // full onboarding TranslationSet
 *   const ui = useUIStrings();            // app chrome strings (tabs, menu)
 */

// ---------------------------------------------------------------------------
// Optional AsyncStorage (never a hard dependency)
// ---------------------------------------------------------------------------
type Storage = {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
};
let storage: Storage | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  storage = require('@react-native-async-storage/async-storage').default as Storage;
} catch {
  storage = null;
}
const LANG_KEY = 'krishi.language';

const VALID_LANGS = new Set(Languages.map((l) => l.code));

// ---------------------------------------------------------------------------
// App-chrome strings (tab bar + Quick Tools menu) in all 10 languages
// ---------------------------------------------------------------------------
export interface UIStrings {
  tab_home: string;
  tab_market: string;
  tab_scan: string;
  tab_voice: string;
  tab_more: string;
  quick_tools: string;
  menu_crops: string;
  menu_chat: string;
  menu_profile: string;
  menu_weather: string;
  menu_predict: string;
  menu_schemes: string;
  menu_community: string;
  menu_satellite: string;
  menu_settings: string;
  // Settings screen
  settings_title: string;
  settings_subtitle: string;
  sec_ecosystem: string;
  sec_preferences: string;
  sec_security: string;
  sec_language: string;
  row_farms: string;
  row_ai: string;
  row_sos: string;
  row_sync: string;
  row_dark: string;
  row_dark_sub: string;
  row_alerts: string;
  row_alerts_sub: string;
  row_voice: string;
  row_voice_sub: string;
  row_privacy: string;
  row_about: string;
  row_cache: string;
  applying_language: string;
}

export const UIStringsByLang: Record<LanguageKey, UIStrings> = {
  en: {
    tab_home: 'Home', tab_market: 'Market', tab_scan: 'Scan', tab_voice: 'Voice', tab_more: 'More',
    quick_tools: 'Quick Tools',
    menu_crops: 'Crops', menu_chat: 'Chat', menu_profile: 'Profile', menu_weather: 'Weather',
    menu_predict: 'Predict', menu_schemes: 'Schemes', menu_community: 'Community',
    menu_satellite: 'Satellite', menu_settings: 'Settings',
    settings_title: 'Settings', settings_subtitle: 'KrishiAI Configuration',
    sec_ecosystem: 'Ecosystem Hub', sec_preferences: 'Preferences', sec_security: 'Security & Support', sec_language: 'Regional Language Selector',
    row_farms: 'Manage Properties & Farms', row_ai: 'Customize AI (Tone & Voice)', row_sos: 'Disaster SOS & Helplines', row_sync: 'Multi-Device Cloud Sync',
    row_dark: 'Dark Mode theme', row_dark_sub: 'Switch to low-light interface',
    row_alerts: 'Smart alerts (Mandi/Pests)', row_alerts_sub: 'High weather winds warnings',
    row_voice: 'Voice advisor readouts', row_voice_sub: 'Enable spoken daily briefings',
    row_privacy: 'Privacy & biometric locker', row_about: 'About KrishiAI & licenses', row_cache: 'Clear Offline Caches',
    applying_language: 'Applying language...',
  },
  hi: {
    tab_home: 'होम', tab_market: 'मंडी', tab_scan: 'स्कैन', tab_voice: 'आवाज़', tab_more: 'और',
    quick_tools: 'त्वरित उपकरण',
    menu_crops: 'फसलें', menu_chat: 'चैट', menu_profile: 'प्रोफ़ाइल', menu_weather: 'मौसम',
    menu_predict: 'पूर्वानुमान', menu_schemes: 'योजनाएं', menu_community: 'समुदाय',
    menu_satellite: 'सैटेलाइट', menu_settings: 'सेटिंग्स',
    settings_title: 'सेटिंग्स', settings_subtitle: 'कृषिAI कॉन्फ़िगरेशन',
    sec_ecosystem: 'इकोसिस्टम हब', sec_preferences: 'प्राथमिकताएं', sec_security: 'सुरक्षा और सहायता', sec_language: 'क्षेत्रीय भाषा चयन',
    row_farms: 'संपत्ति और फार्म प्रबंधन', row_ai: 'AI अनुकूलित करें (टोन और आवाज़)', row_sos: 'आपदा SOS और हेल्पलाइन', row_sync: 'मल्टी-डिवाइस क्लाउड सिंक',
    row_dark: 'डार्क मोड थीम', row_dark_sub: 'कम रोशनी वाला इंटरफ़ेस',
    row_alerts: 'स्मार्ट अलर्ट (मंडी/कीट)', row_alerts_sub: 'तेज़ हवा और मौसम चेतावनी',
    row_voice: 'वॉयस सलाहकार रीडआउट', row_voice_sub: 'दैनिक ब्रीफिंग सुनें',
    row_privacy: 'गोपनीयता और बायोमेट्रिक लॉक', row_about: 'कृषिAI के बारे में', row_cache: 'ऑफ़लाइन कैश साफ़ करें',
    applying_language: 'भाषा लागू हो रही है...',
  },
  gu: {
    tab_home: 'હોમ', tab_market: 'મંડી', tab_scan: 'સ્કેન', tab_voice: 'અવાજ', tab_more: 'વધુ',
    quick_tools: 'ઝડપી સાધનો',
    menu_crops: 'પાક', menu_chat: 'ચેટ', menu_profile: 'પ્રોફાઇલ', menu_weather: 'હવામાન',
    menu_predict: 'આગાહી', menu_schemes: 'યોજનાઓ', menu_community: 'સમુદાય',
    menu_satellite: 'સેટેલાઇટ', menu_settings: 'સેટિંગ્સ',
    settings_title: 'સેટિંગ્સ', settings_subtitle: 'કૃષિAI ગોઠવણી',
    sec_ecosystem: 'ઇકોસિસ્ટમ હબ', sec_preferences: 'પસંદગીઓ', sec_security: 'સુરક્ષા અને સહાય', sec_language: 'પ્રાદેશિક ભાષા પસંદગી',
    row_farms: 'મિલકત અને ખેતરોનું સંચાલન', row_ai: 'AI કસ્ટમાઇઝ કરો (ટોન અને અવાજ)', row_sos: 'આપત્તિ SOS અને હેલ્પલાઇન', row_sync: 'મલ્ટી-ડિવાઇસ ક્લાઉડ સિંક',
    row_dark: 'ડાર્ક મોડ થીમ', row_dark_sub: 'ઓછા પ્રકાશવાળું ઇન્ટરફેસ',
    row_alerts: 'સ્માર્ટ ચેતવણીઓ (મંડી/જીવાત)', row_alerts_sub: 'ભારે પવન અને હવામાન ચેતવણી',
    row_voice: 'વૉઇસ સલાહકાર', row_voice_sub: 'દૈનિક બ્રીફિંગ સાંભળો',
    row_privacy: 'ગોપનીયતા અને બાયોમેટ્રિક લૉક', row_about: 'કૃષિAI વિશે', row_cache: 'ઑફલાઇન કેશ સાફ કરો',
    applying_language: 'ભાષા લાગુ થઈ રહી છે...',
  },
  mr: {
    tab_home: 'होम', tab_market: 'मंडी', tab_scan: 'स्कॅन', tab_voice: 'आवाज', tab_more: 'अधिक',
    quick_tools: 'जलद साधने',
    menu_crops: 'पिके', menu_chat: 'चॅट', menu_profile: 'प्रोफाइल', menu_weather: 'हवामान',
    menu_predict: 'अंदाज', menu_schemes: 'योजना', menu_community: 'समुदाय',
    menu_satellite: 'सॅटेलाइट', menu_settings: 'सेटिंग्ज',
    settings_title: 'सेटिंग्ज', settings_subtitle: 'कृषीAI कॉन्फिगरेशन',
    sec_ecosystem: 'इकोसिस्टम हब', sec_preferences: 'प्राधान्ये', sec_security: 'सुरक्षा आणि मदत', sec_language: 'प्रादेशिक भाषा निवड',
    row_farms: 'मालमत्ता आणि शेत व्यवस्थापन', row_ai: 'AI सानुकूलित करा (टोन आणि आवाज)', row_sos: 'आपत्ती SOS आणि हेल्पलाइन', row_sync: 'मल्टी-डिव्हाइस क्लाउड सिंक',
    row_dark: 'डार्क मोड थीम', row_dark_sub: 'कमी प्रकाश इंटरफेस',
    row_alerts: 'स्मार्ट सूचना (मंडी/कीड)', row_alerts_sub: 'जोरदार वारे आणि हवामान इशारे',
    row_voice: 'व्हॉइस सल्लागार', row_voice_sub: 'दैनिक ब्रीफिंग ऐका',
    row_privacy: 'गोपनीयता आणि बायोमेट्रिक लॉक', row_about: 'कृषीAI बद्दल', row_cache: 'ऑफलाइन कॅशे साफ करा',
    applying_language: 'भाषा लागू होत आहे...',
  },
  ta: {
    tab_home: 'முகப்பு', tab_market: 'சந்தை', tab_scan: 'ஸ்கேன்', tab_voice: 'குரல்', tab_more: 'மேலும்',
    quick_tools: 'விரைவு கருவிகள்',
    menu_crops: 'பயிர்கள்', menu_chat: 'அரட்டை', menu_profile: 'சுயவிவரம்', menu_weather: 'வானிலை',
    menu_predict: 'கணிப்பு', menu_schemes: 'திட்டங்கள்', menu_community: 'சமூகம்',
    menu_satellite: 'செயற்கைக்கோள்', menu_settings: 'அமைப்புகள்',
    settings_title: 'அமைப்புகள்', settings_subtitle: 'கிருஷிAI உள்ளமைவு',
    sec_ecosystem: 'சூழல் மையம்', sec_preferences: 'விருப்பங்கள்', sec_security: 'பாதுகாப்பு & ஆதரவு', sec_language: 'மொழி தேர்வு',
    row_farms: 'சொத்து & பண்ணை மேலாண்மை', row_ai: 'AI தனிப்பயனாக்கு (தொனி & குரல்)', row_sos: 'பேரிடர் SOS & உதவி எண்கள்', row_sync: 'கிளவுட் ஒத்திசைவு',
    row_dark: 'இருண்ட பயன்முறை', row_dark_sub: 'குறைந்த ஒளி இடைமுகம்',
    row_alerts: 'ஸ்மார்ட் எச்சரிக்கைகள் (மண்டி/பூச்சி)', row_alerts_sub: 'பலத்த காற்று எச்சரிக்கைகள்',
    row_voice: 'குரல் ஆலோசகர்', row_voice_sub: 'தினசரி சுருக்கம் கேளுங்கள்',
    row_privacy: 'தனியுரிமை & பயோமெட்ரிக் பூட்டு', row_about: 'கிருஷிAI பற்றி', row_cache: 'ஆஃப்லைன் கேச் அழிக்க',
    applying_language: 'மொழி பயன்படுத்தப்படுகிறது...',
  },
  te: {
    tab_home: 'హోమ్', tab_market: 'మార్కెట్', tab_scan: 'స్కాన్', tab_voice: 'వాయిస్', tab_more: 'మరిన్ని',
    quick_tools: 'త్వరిత సాధనాలు',
    menu_crops: 'పంటలు', menu_chat: 'చాట్', menu_profile: 'ప్రొఫైల్', menu_weather: 'వాతావరణం',
    menu_predict: 'అంచనా', menu_schemes: 'పథకాలు', menu_community: 'సంఘం',
    menu_satellite: 'ఉపగ్రహం', menu_settings: 'సెట్టింగ్‌లు',
    settings_title: 'సెట్టింగ్‌లు', settings_subtitle: 'కృషిAI ఆకృతీకరణ',
    sec_ecosystem: 'ఎకోసిస్టమ్ హబ్', sec_preferences: 'ప్రాధాన్యతలు', sec_security: 'భద్రత & మద్దతు', sec_language: 'ప్రాంతీయ భాష ఎంపిక',
    row_farms: 'ఆస్తులు & పొలాల నిర్వహణ', row_ai: 'AI అనుకూలీకరణ (టోన్ & వాయిస్)', row_sos: 'విపత్తు SOS & హెల్ప్‌లైన్', row_sync: 'మల్టీ-డివైస్ క్లౌడ్ సింక్',
    row_dark: 'డార్క్ మోడ్ థీమ్', row_dark_sub: 'తక్కువ కాంతి ఇంటర్‌ఫేస్',
    row_alerts: 'స్మార్ట్ హెచ్చరికలు (మండి/పురుగులు)', row_alerts_sub: 'బలమైన గాలుల హెచ్చరికలు',
    row_voice: 'వాయిస్ సలహాదారు', row_voice_sub: 'రోజువారీ బ్రీఫింగ్ వినండి',
    row_privacy: 'గోప్యత & బయోమెట్రిక్ లాక్', row_about: 'కృషిAI గురించి', row_cache: 'ఆఫ్‌లైన్ కేష్ క్లియర్',
    applying_language: 'భాష వర్తింపజేయబడుతోంది...',
  },
  kn: {
    tab_home: 'ಹೋಮ್', tab_market: 'ಮಾರುಕಟ್ಟೆ', tab_scan: 'ಸ್ಕ್ಯಾನ್', tab_voice: 'ಧ್ವನಿ', tab_more: 'ಇನ್ನಷ್ಟು',
    quick_tools: 'ತ್ವರಿತ ಸಾಧನಗಳು',
    menu_crops: 'ಬೆಳೆಗಳು', menu_chat: 'ಚಾಟ್', menu_profile: 'ಪ್ರೊಫೈಲ್', menu_weather: 'ಹವಾಮಾನ',
    menu_predict: 'ಮುನ್ಸೂಚನೆ', menu_schemes: 'ಯೋಜನೆಗಳು', menu_community: 'ಸಮುದಾಯ',
    menu_satellite: 'ಉಪಗ್ರಹ', menu_settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    settings_title: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', settings_subtitle: 'ಕೃಷಿAI ಸಂರಚನೆ',
    sec_ecosystem: 'ಪರಿಸರ ಕೇಂದ್ರ', sec_preferences: 'ಆದ್ಯತೆಗಳು', sec_security: 'ಭದ್ರತೆ & ಬೆಂಬಲ', sec_language: 'ಪ್ರಾದೇಶಿಕ ಭಾಷೆ ಆಯ್ಕೆ',
    row_farms: 'ಆಸ್ತಿ & ಜಮೀನು ನಿರ್ವಹಣೆ', row_ai: 'AI ಕಸ್ಟಮೈಸ್ (ಟೋನ್ & ಧ್ವನಿ)', row_sos: 'ವಿಪತ್ತು SOS & ಸಹಾಯವಾಣಿ', row_sync: 'ಮಲ್ಟಿ-ಡಿವೈಸ್ ಕ್ಲೌಡ್ ಸಿಂಕ್',
    row_dark: 'ಡಾರ್ಕ್ ಮೋಡ್ ಥೀಮ್', row_dark_sub: 'ಕಡಿಮೆ ಬೆಳಕಿನ ಇಂಟರ್ಫೇಸ್',
    row_alerts: 'ಸ್ಮಾರ್ಟ್ ಎಚ್ಚರಿಕೆಗಳು (ಮಂಡಿ/ಕೀಟ)', row_alerts_sub: 'ಬಲವಾದ ಗಾಳಿ ಎಚ್ಚರಿಕೆಗಳು',
    row_voice: 'ಧ್ವನಿ ಸಲಹೆಗಾರ', row_voice_sub: 'ದೈನಂದಿನ ವರದಿ ಕೇಳಿ',
    row_privacy: 'ಗೌಪ್ಯತೆ & ಬಯೋಮೆಟ್ರಿಕ್ ಲಾಕ್', row_about: 'ಕೃಷಿAI ಬಗ್ಗೆ', row_cache: 'ಆಫ್‌ಲೈನ್ ಕ್ಯಾಶ್ ಅಳಿಸಿ',
    applying_language: 'ಭಾಷೆ ಅನ್ವಯಿಸಲಾಗುತ್ತಿದೆ...',
  },
  bn: {
    tab_home: 'হোম', tab_market: 'বাজার', tab_scan: 'স্ক্যান', tab_voice: 'ভয়েস', tab_more: 'আরও',
    quick_tools: 'দ্রুত সরঞ্জাম',
    menu_crops: 'ফসল', menu_chat: 'চ্যাট', menu_profile: 'প্রোফাইল', menu_weather: 'আবহাওয়া',
    menu_predict: 'পূর্বাভাস', menu_schemes: 'প্রকল্প', menu_community: 'সম্প্রদায়',
    menu_satellite: 'স্যাটেলাইট', menu_settings: 'সেটিংস',
    settings_title: 'সেটিংস', settings_subtitle: 'কৃষিAI কনফিগারেশন',
    sec_ecosystem: 'ইকোসিস্টেম হাব', sec_preferences: 'পছন্দসমূহ', sec_security: 'নিরাপত্তা ও সহায়তা', sec_language: 'আঞ্চলিক ভাষা নির্বাচন',
    row_farms: 'সম্পত্তি ও খামার ব্যবস্থাপনা', row_ai: 'AI কাস্টমাইজ (টোন ও ভয়েস)', row_sos: 'দুর্যোগ SOS ও হেল্পলাইন', row_sync: 'মাল্টি-ডিভাইস ক্লাউড সিঙ্ক',
    row_dark: 'ডার্ক মোড থিম', row_dark_sub: 'কম আলোর ইন্টারফেস',
    row_alerts: 'স্মার্ট সতর্কতা (মান্ডি/পোকা)', row_alerts_sub: 'প্রবল বাতাসের সতর্কতা',
    row_voice: 'ভয়েস উপদেষ্টা', row_voice_sub: 'দৈনিক ব্রিফিং শুনুন',
    row_privacy: 'গোপনীয়তা ও বায়োমেট্রিক লক', row_about: 'কৃষিAI সম্পর্কে', row_cache: 'অফলাইন ক্যাশ পরিষ্কার',
    applying_language: 'ভাষা প্রয়োগ হচ্ছে...',
  },
  pa: {
    tab_home: 'ਹੋਮ', tab_market: 'ਮੰਡੀ', tab_scan: 'ਸਕੈਨ', tab_voice: 'ਅਵਾਜ਼', tab_more: 'ਹੋਰ',
    quick_tools: 'ਤੁਰੰਤ ਟੂਲ',
    menu_crops: 'ਫਸਲਾਂ', menu_chat: 'ਚੈਟ', menu_profile: 'ਪ੍ਰੋਫਾਈਲ', menu_weather: 'ਮੌਸਮ',
    menu_predict: 'ਅਨੁਮਾਨ', menu_schemes: 'ਸਕੀਮਾਂ', menu_community: 'ਭਾਈਚਾਰਾ',
    menu_satellite: 'ਸੈਟੇਲਾਈਟ', menu_settings: 'ਸੈਟਿੰਗਾਂ',
    settings_title: 'ਸੈਟਿੰਗਾਂ', settings_subtitle: 'ਕ੍ਰਿਸ਼ੀAI ਸੰਰਚਨਾ',
    sec_ecosystem: 'ਈਕੋਸਿਸਟਮ ਹੱਬ', sec_preferences: 'ਤਰਜੀਹਾਂ', sec_security: 'ਸੁਰੱਖਿਆ ਅਤੇ ਸਹਾਇਤਾ', sec_language: 'ਖੇਤਰੀ ਭਾਸ਼ਾ ਚੋਣ',
    row_farms: 'ਜਾਇਦਾਦ ਅਤੇ ਫਾਰਮ ਪ੍ਰਬੰਧਨ', row_ai: 'AI ਕਸਟਮਾਈਜ਼ (ਟੋਨ ਅਤੇ ਅਵਾਜ਼)', row_sos: 'ਆਫ਼ਤ SOS ਅਤੇ ਹੈਲਪਲਾਈਨ', row_sync: 'ਮਲਟੀ-ਡਿਵਾਈਸ ਕਲਾਉਡ ਸਿੰਕ',
    row_dark: 'ਡਾਰਕ ਮੋਡ ਥੀਮ', row_dark_sub: 'ਘੱਟ ਰੋਸ਼ਨੀ ਵਾਲਾ ਇੰਟਰਫੇਸ',
    row_alerts: 'ਸਮਾਰਟ ਅਲਰਟ (ਮੰਡੀ/ਕੀੜੇ)', row_alerts_sub: 'ਤੇਜ਼ ਹਵਾਵਾਂ ਦੀ ਚੇਤਾਵਨੀ',
    row_voice: 'ਵੌਇਸ ਸਲਾਹਕਾਰ', row_voice_sub: 'ਰੋਜ਼ਾਨਾ ਬ੍ਰੀਫਿੰਗ ਸੁਣੋ',
    row_privacy: 'ਪਰਦੇਦਾਰੀ ਅਤੇ ਬਾਇਓਮੈਟ੍ਰਿਕ ਲਾਕ', row_about: 'ਕ੍ਰਿਸ਼ੀAI ਬਾਰੇ', row_cache: 'ਔਫਲਾਈਨ ਕੈਸ਼ ਸਾਫ਼ ਕਰੋ',
    applying_language: 'ਭਾਸ਼ਾ ਲਾਗੂ ਹੋ ਰਹੀ ਹੈ...',
  },
  ml: {
    tab_home: 'ഹോം', tab_market: 'മാർക്കറ്റ്', tab_scan: 'സ്കാൻ', tab_voice: 'വോയിസ്', tab_more: 'കൂടുതൽ',
    quick_tools: 'ദ്രുത ഉപകരണങ്ങൾ',
    menu_crops: 'വിളകൾ', menu_chat: 'ചാറ്റ്', menu_profile: 'പ്രൊഫൈൽ', menu_weather: 'കാലാവസ്ഥ',
    menu_predict: 'പ്രവചനം', menu_schemes: 'പദ്ധതികൾ', menu_community: 'സമൂഹം',
    menu_satellite: 'സാറ്റലൈറ്റ്', menu_settings: 'ക്രമീകരണങ്ങൾ',
    settings_title: 'ക്രമീകരണങ്ങൾ', settings_subtitle: 'കൃഷിAI ക്രമീകരണം',
    sec_ecosystem: 'ഇക്കോസിസ്റ്റം ഹബ്', sec_preferences: 'മുൻഗണനകൾ', sec_security: 'സുരക്ഷ & പിന്തുണ', sec_language: 'പ്രാദേശിക ഭാഷ തിരഞ്ഞെടുക്കൽ',
    row_farms: 'സ്വത്ത് & കൃഷിയിടം നിർവഹണം', row_ai: 'AI ഇഷ്ടാനുസൃതമാക്കുക (ടോൺ & വോയിസ്)', row_sos: 'ദുരന്ത SOS & ഹെൽപ്പ്‌ലൈൻ', row_sync: 'മൾട്ടി-ഡിവൈസ് ക്ലൗഡ് സിങ്ക്',
    row_dark: 'ഡാർക്ക് മോഡ് തീം', row_dark_sub: 'കുറഞ്ഞ വെളിച്ച ഇന്റർഫേസ്',
    row_alerts: 'സ്മാർട്ട് അലേർട്ടുകൾ (മണ്ഡി/കീടം)', row_alerts_sub: 'ശക്തമായ കാറ്റ് മുന്നറിയിപ്പുകൾ',
    row_voice: 'വോയിസ് ഉപദേഷ്ടാവ്', row_voice_sub: 'ദൈനംദിന ബ്രീഫിംഗ് കേൾക്കുക',
    row_privacy: 'സ്വകാര്യത & ബയോമെട്രിക് ലോക്ക്', row_about: 'കൃഷിAI-യെക്കുറിച്ച്', row_cache: 'ഓഫ്‌ലൈൻ കേഷ് മായ്ക്കുക',
    applying_language: 'ഭാഷ പ്രയോഗിക്കുന്നു...',
  },
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface LanguageContextType {
  language: LanguageKey;
  setLanguage: (lang: LanguageKey) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageKey>('en');

  // Load persisted language once.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!storage) return;
      try {
        const saved = await storage.getItem(LANG_KEY);
        if (alive && saved && VALID_LANGS.has(saved as LanguageKey)) {
          setLanguageState(saved as LanguageKey);
        }
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setLanguage = useCallback((lang: LanguageKey) => {
    setLanguageState(lang);
    storage?.setItem(LANG_KEY, lang).catch(() => {});
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Full onboarding-style translation set for the active language. */
export function useTranslations(): TranslationSet {
  const { language } = useContext(LanguageContext);
  return Translations[language];
}

/** App-chrome strings (tab bar, Quick Tools menu) for the active language. */
export function useUIStrings(): UIStrings {
  const { language } = useContext(LanguageContext);
  return UIStringsByLang[language];
}

/**
 * Per-screen translation helper.
 * Screens define a local STRINGS table with a complete `en` set and (partial or
 * full) translations for other languages; missing keys fall back to English:
 *
 *   const STRINGS = {
 *     en: { title: 'Weather Intel', hero: 'Partly Cloudy' },
 *     hi: { title: 'मौसम जानकारी', hero: 'आंशिक बादल' },
 *   } as const;
 *   const s = useScreenStrings(STRINGS);   // s.title follows the app language
 */
export function useScreenStrings<T extends Record<string, any>>(
  table: { en: T } & Partial<Record<LanguageKey, Partial<T>>>
): T {
  const { language } = useContext(LanguageContext);
  return useMemo(
    () => ({ ...table.en, ...((table[language] as Partial<T>) ?? {}) }),
    [language, table]
  );
}
