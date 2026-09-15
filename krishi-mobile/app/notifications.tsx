import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';
import * as Haptics from 'expo-haptics';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';

interface NotificationItem {
  id: string;
  category: 'weather' | 'market' | 'disease' | 'scheme';
  title: string;
  body: string;
  time: string;
  isUnread: boolean;
  isPinned: boolean;
}

const STRINGS = {
  en: {
    title: 'Alerts Inbox',
    subtitle: 'Farm advisories & reports',
    markAllRead: 'Mark all read',
    all: 'ALL',
    weather: 'WEATHER',
    market: 'MARKET',
    disease: 'DISEASE',
    scheme: 'SCHEME',
    emptyTitle: 'Inbox is Clear',
    emptyDesc: 'No notifications in this category.',
    n1Title: '🚨 Severe Thunderstorm Warning',
    n1Body: 'Heavy rainfall with high winds expected in Karnal region tomorrow evening. Secure loose equipment and clear farm channels.',
    n1Time: '10 mins ago',
    n2Title: '📈 Wheat Mandi Prices Surged',
    n2Body: 'Wheat rates at Karnal APMC increased to ₹2,420/quintal (+₹45). Selling conditions are highly favorable.',
    n2Time: '1 hour ago',
    n3Title: '🐛 Fall Armyworm Alert',
    n3Body: 'Agricultural officers report pest outbreaks in neighboring villages. Inspect cotton leaves immediately for leaf damage.',
    n3Time: '3 hours ago',
    n4Title: '📜 PM-KISAN 17th Installment Release',
    n4Body: 'Funds have been credited directly to eligible Aadhaar-linked farming bank accounts. Check transaction logs.',
    n4Time: 'Yesterday',
    bookmark: 'Bookmark',
    bookmarked: 'Bookmarked',
    archive: 'Archive',
    delete: 'Delete',
    archived: 'Archived',
  },
  hi: {
    title: 'चेतावनी इनबॉक्स',
    subtitle: 'खेत सलाह और रिपोर्ट',
    markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    all: 'सभी',
    weather: 'मौसम',
    market: 'मंडी',
    disease: 'रोग',
    scheme: 'योजना',
    emptyTitle: 'इनबॉक्स खाली है',
    emptyDesc: 'इस श्रेणी में कोई सूचना नहीं।',
    n1Title: '🚨 गंभीर गरज वाली तूफान चेतावनी',
    n1Body: 'करनाल क्षेत्र में कल शाम तेज हवाओं के साथ भारी वर्षा की उम्मीद है। ढीले उपकरणों को सुरक्षित करें और खेत चैनलों को साफ करें।',
    n1Time: '10 मिनट पहले',
    n2Title: '📈 गेहूं मंडी कीमतें बढ़ीं',
    n2Body: 'करनाल APMC पर गेहूं की दरें ₹2,420/क्विंटल (+₹45) बढ़ गई हैं। बिक्री की स्थितियां अत्यंत अनुकूल हैं।',
    n2Time: '1 घंटा पहले',
    n3Title: '🐛 फॉल आर्मीवर्म अलर्ट',
    n3Body: 'कृषि अधिकारियों ने पड़ोसी गांवों में कीटों के प्रकोप की रिपोर्ट की है। पत्ती क्षति के लिए तुरंत कपास की पत्तियों का निरीक्षण करें।',
    n3Time: '3 घंटे पहले',
    n4Title: '📜 PM-KISAN 17वीं किस्त रिलीज',
    n4Body: 'पात्र आधार-लिंक्ड कृषि बैंक खातों में सीधे धन जमा किया गया है। लेन-देन लॉग जांचें।',
    n4Time: 'कल',
    bookmark: 'बुकमार्क',
    bookmarked: 'बुकमार्क किया गया',
    archive: 'संग्रहीत करें',
    delete: 'हटाएं',
    archived: 'संग्रहीत',
  },
  gu: {
    title: 'ચેતવણી ઇનબોક્સ',
    subtitle: 'ખેત સલાહ અને રિપોર્ટ',
    markAllRead: 'બધું વાંચ્યું તરીકે ચિહ્નિત કરો',
    all: 'બધું',
    weather: 'હવામાન',
    market: 'મંડી',
    disease: 'રોગ',
    scheme: 'યોજના',
    emptyTitle: 'ઇનબોક્સ સ્પષ્ટ છે',
    emptyDesc: 'આ શ્રેણીમાં કોઈ સૂચનો નથી.',
    n1Title: '🚨 ગંભીર વીજળીનો તોફાન ચેતવણી',
    n1Body: 'કર્નલ પ્રદેશમાં આવતે કાલે સાંજે તેજ પવનો સાથે ભારે વર્ષા અપેક્ષિત છે. ढીલા સાધનો સુરક્ષિત કરો અને ખેતરો ચેનલો સાફ કરો.',
    n1Time: '10 મિનિટ પહેલાં',
    n2Title: '📈 ઘઉં મંડી કિંમતો વધ્યાં',
    n2Body: 'કર્નલ APMC પર ઘઉંની દરો ₹2,420/ક્વિંટલ (+₹45) વધ્યાં છે. વેચવાની સ્થિતિઓ અત્યંત અનુકૂળ છે.',
    n2Time: '1 કલાક પહેલાં',
    n3Title: '🐛 ફૉલ આર્મીવર્મ સતર્કતા',
    n3Body: 'કૃષિ અધિકારીઓ પાડોશી ગામોમાં જીવાતના પ્રકોપની રિપોર્ટ આપે છે. પાંદડાને નુકસાન માટે તુરંત કપાસની પાંદડાઓ તપાસો.',
    n3Time: '3 કલાક પહેલાં',
    n4Title: '📜 PM-KISAN 17મી હપ્તોનું પ્રકાશન',
    n4Body: 'પાત્ર આધાર-જોડાણ કૃષિ બેંક ખાતામાં સીધો ભંડોળ જમા કરવામાં આવ્યો છે. ટ્રાન્ઝેક્શન લોગ ચેક કરો.',
    n4Time: 'ગઈકાલ',
    bookmark: 'બુક માર્ક',
    bookmarked: 'બુક માર્ક કર્યું',
    archive: 'સંગ્રહીત કરો',
    delete: 'હટાવો',
    archived: 'સંગ્રહીત',
  },
  mr: {
    title: 'सतर्कता इनबॉक्स',
    subtitle: 'शेत सल्ला व अहवाल',
    markAllRead: 'सर्व वाचलेले चिन्हांकित करा',
    all: 'सर्व',
    weather: 'हवामान',
    market: 'मंडी',
    disease: 'रोग',
    scheme: 'योजना',
    emptyTitle: 'इनबॉक्स स्पष्ट आहे',
    emptyDesc: 'या श्रेणीतून कोणतीही सूचना नाहीत.',
    n1Title: '🚨 गंभीर मेघगर्जन चेतावणी',
    n1Body: 'करनाल प्रदेशात उद्याच्या संध्याकाळी तेज वारे सह मोठी पाऊस अपेक्षित आहे. सैल उपकरणे सुरक्षित करा आणि शेत चॅनल साफ करा.',
    n1Time: '10 मिनिटे आधी',
    n2Title: '📈 गव्हाची मंडी किंमती वाढल्या',
    n2Body: 'करनाल APMC मध्ये गव्हाची दरें ₹2,420/क्विंटल (+₹45) वाढल्या आहेत. विक्रय परिस्थितीं अत्यंत अनुकूल आहेत.',
    n2Time: '1 तास आधी',
    n3Title: '🐛 फॉल आर्मीवर्म सतर्कता',
    n3Body: 'कृषी अधिकारीयांनी शेजारच्या गावांमध्ये कीटांचे प्रकोप नोंदवले आहेत. पानांच्या नुकसानीसाठी तुरंत कापसाची पाने तपासा.',
    n3Time: '3 तास आधी',
    n4Title: '📜 PM-KISAN 17वी हप्ता प्रकाशन',
    n4Body: 'योग्य आधार-जोडलेल्या कृषि बँक खात्यामध्ये थेट निधी जमा केले आहेत. व्यवहार लॉग तपासा.',
    n4Time: 'काल',
    bookmark: 'बुकमार्क',
    bookmarked: 'बुकमार्क केलेले',
    archive: 'संग्रहित करा',
    delete: 'हटवा',
    archived: 'संग्रहित',
  },
};

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const t = useType();
  const s = useScreenStrings(STRINGS as any);

  const [activeFilter, setActiveFilter] = useState<'all' | 'weather' | 'market' | 'disease' | 'scheme'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'n1', category: 'weather', title: s.n1Title, body: s.n1Body, time: s.n1Time, isUnread: true, isPinned: true },
    { id: 'n2', category: 'market', title: s.n2Title, body: s.n2Body, time: s.n2Time, isUnread: true, isPinned: false },
    { id: 'n3', category: 'disease', title: s.n3Title, body: s.n3Body, time: s.n3Time, isUnread: false, isPinned: false },
    { id: 'n4', category: 'scheme', title: s.n4Title, body: s.n4Body, time: s.n4Time, isUnread: false, isPinned: false },
  ]);

  const handleAction = (id: string, action: 'pin' | 'archive' | 'delete') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (action === 'delete') {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } else if (action === 'pin') {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
    } else if (action === 'archive') {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      Alert.alert(s.archived, 'Notification moved to archives.');
    }
  };

  const filtered = notifications.filter((n) => activeFilter === 'all' || n.category === activeFilter);
  const catColor = (cat: string) => (cat === 'weather' ? colors.danger : cat === 'market' ? colors.info : cat === 'disease' ? colors.warning : colors.green);

  return (
    <Screen
      title={s.title}
      emoji="🔔"
      subtitle={s.subtitle}
      back
      right={
        <HeaderIconButton
          icon="check-circle"
          label={s.markAllRead}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
          }}
        />
      }
    >
      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {(['all', 'weather', 'market', 'disease', 'scheme'] as const).map((f) => {
          const on = activeFilter === f;
          const labels: Record<string, string> = {
            all: s.all,
            weather: s.weather,
            market: s.market,
            disease: s.disease,
            scheme: s.scheme,
          };
          return (
            <PressableScale key={f} onPress={() => setActiveFilter(f)} haptic="light" scaleTo={0.94}>
              <View style={[styles.chip, { backgroundColor: on ? colors.accent : colors.surface, borderColor: on ? 'transparent' : colors.border }]}>
                <Text style={[t.caption, { color: on ? '#ffffff' : colors.text }]} numberOfLines={1}>{labels[f]}</Text>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="bell-off" size={48} color={colors.textMuted} />
          <Text style={[t.title, { color: colors.text }]}>{s.emptyTitle}</Text>
          <Text style={[t.bodySmall, { color: colors.textSecondary }]}>{s.emptyDesc}</Text>
        </View>
      ) : (
        filtered.map((item, i) => (
          <FadeInUp key={item.id} index={i}>
            <GlassCard padding={0} style={{ borderColor: item.isUnread ? colors.accent : colors.border, overflow: 'hidden' }}>
              <View style={styles.cardRow}>
                <View style={[styles.accentStrip, { backgroundColor: catColor(item.category) }]} />
                <View style={styles.cardMain}>
                  <View style={styles.cardHeader}>
                    <Text style={[t.caption, { color: colors.textMuted, flexShrink: 1 }]}>{item.time}</Text>
                    {item.isPinned && <Feather name="bookmark" size={13} color={colors.accent} />}
                  </View>
                  <Text style={[t.bodyStrong, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[t.bodySmall, { color: colors.textSecondary }]}>{item.body}</Text>
                  <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                    <PressableScale style={styles.actionBtn} onPress={() => handleAction(item.id, 'pin')} haptic="light">
                      <Feather name="bookmark" size={13} color={item.isPinned ? colors.accent : colors.textMuted} />
                      <Text style={[t.caption, { color: item.isPinned ? colors.accent : colors.textSecondary }]}>{item.isPinned ? s.bookmarked : s.bookmark}</Text>
                    </PressableScale>
                    <PressableScale style={styles.actionBtn} onPress={() => handleAction(item.id, 'archive')} haptic="light">
                      <Feather name="archive" size={13} color={colors.textMuted} />
                      <Text style={[t.caption, { color: colors.textSecondary }]}>{s.archive}</Text>
                    </PressableScale>
                    <PressableScale style={styles.actionBtn} onPress={() => handleAction(item.id, 'delete')} haptic="medium">
                      <Feather name="trash-2" size={13} color={colors.danger} />
                      <Text style={[t.caption, { color: colors.danger }]}>{s.delete}</Text>
                    </PressableScale>
                  </View>
                </View>
              </View>
            </GlassCard>
          </FadeInUp>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  cardRow: { flexDirection: 'row' },
  accentStrip: { width: 6 },
  cardMain: { flex: 1, padding: 16, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, flexShrink: 1 },
});
