import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/Screen';
import { Colors } from '@/constants/Colors';
import { useColorScheme, useType } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    smartAlerts: 'Smart Alerts',
    rainExpected: 'Rain Expected',
    rainDesc: 'Heavy rainfall predicted in your area for next 48 hours. Consider covering crops.',
    wheatPriceUp: 'Wheat Price Up',
    wheatPriceDesc: 'Wheat MSP increased by ₹125/quintal. Good time to sell stored wheat.',
    pestAlert: 'Pest Alert',
    pestDesc: 'Bollworm activity reported in nearby districts. Inspect cotton fields.',
    time2hAgo: '2h ago',
    time5hAgo: '5h ago',
    time1dAgo: '1d ago',
  },
  hi: {
    smartAlerts: 'स्मार्ट अलर्ट',
    rainExpected: 'बारिश की उम्मीद',
    rainDesc: 'अगले 48 घंटों में आपके क्षेत्र में भारी बारिश की भविष्यवाणी की गई है। फसलों को ढकने पर विचार करें।',
    wheatPriceUp: 'गेहूं की कीमत बढ़ी',
    wheatPriceDesc: 'गेहूं एमएसपी में ₹125/क्विंटल की वृद्धि। संग्रहीत गेहूं बेचने का अच्छा समय।',
    pestAlert: 'कीट सचेतता',
    pestDesc: 'आस-पास के जिलों में बोलवर्म गतिविधि की सूचना दी गई। कपास के खेतों की जांच करें।',
    time2hAgo: '2 घंटे पहले',
    time5hAgo: '5 घंटे पहले',
    time1dAgo: '1 दिन पहले',
  },
  gu: {
    smartAlerts: 'સ્માર્ટ ચેતવણીઓ',
    rainExpected: 'વરસાદની અપેક્ષા',
    rainDesc: 'આગામી 48 કલાકમાં તમારા વિસ્તારમાં ભારે વરસાદની આગાહી આપવામાં આવી છે. પાકોને ઢાંકવાનું વિચારો.',
    wheatPriceUp: 'ઘઉં ભાવ વધ્યો',
    wheatPriceDesc: 'ઘઉં MSP માં ₹125/ક્વિંટલ વધ્યો. સંગ્રહિત ઘઉં વેચવાનો સારો સમય.',
    pestAlert: 'જીવાત ચેતવણી',
    pestDesc: 'નજીક જિલ્લાઓમાં બોલવર્ମ પ્રવૃત્તિની જાણકારી આપવામાં આવી. કપાસ ખેતરોની તપાસ કરો.',
    time2hAgo: '2 કલાક પહેલા',
    time5hAgo: '5 કલાક પહેલા',
    time1dAgo: '1 દિવસ પહેલા',
  },
  mr: {
    smartAlerts: 'स्मार्ट सूचना',
    rainExpected: 'पाऊस अपेक्षित',
    rainDesc: 'पुढील 48 तासांत तुमच्या क्षेत्रात जोरदार पाऊस होण्याचा अंदाज आहे. पिकांना झाकून ठेवण्याचा विचार करा.',
    wheatPriceUp: 'गहू किंमत वाढली',
    wheatPriceDesc: 'गहू एमएसपी मध्ये ₹125/क्विंटल वाढ झाली. संचयित गहू विक्रय करण्याचा चांगला वेळ.',
    pestAlert: 'कीड सावध',
    pestDesc: 'जवळच्या जिल्ह्यांमध्ये बोलवर्म क्रियाकलाप नोंदविला गेला. कापूस शेतांची तपासणी करा.',
    time2hAgo: '2 तास पूर्वी',
    time5hAgo: '5 तास पूर्वी',
    time1dAgo: '1 दिवस पूर्वी',
  },
};

const ALERTS_BASE = [
  { id: 1, type: 'warning' as const, icon: '🌧️', titleKey: 'rainExpected', descKey: 'rainDesc', timeKey: 'time2hAgo' },
  { id: 2, type: 'success' as const, icon: '💰', titleKey: 'wheatPriceUp', descKey: 'wheatPriceDesc', timeKey: 'time5hAgo' },
  { id: 3, type: 'danger' as const, icon: '🐛', titleKey: 'pestAlert', descKey: 'pestDesc', timeKey: 'time1dAgo' },
];

const TYPE_COLORS = {
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  info: '#3b82f6',
};

export function AlertsFeed() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const t = useType();
  const s = useScreenStrings(STRINGS as any);

  const ALERTS = ALERTS_BASE.map((alert) => ({
    ...alert,
    title: s[alert.titleKey as keyof typeof s],
    desc: s[alert.descKey as keyof typeof s],
    time: s[alert.timeKey as keyof typeof s],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[t.titleSmall, { color: colors.text, fontWeight: '700' }]}>{s.smartAlerts}</Text>
        <Feather name="bell" size={16} color={colors.accent} />
      </View>
      <View style={styles.list}>
        {ALERTS.map((alert) => (
          <GlassCard
            key={alert.id}
            liquid
            padding={12}
            style={[
              styles.alertCard,
              {
                borderLeftColor: TYPE_COLORS[alert.type],
                borderLeftWidth: 3.5,
              }
            ]}
          >
            <Text style={styles.alertIcon}>{alert.icon}</Text>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Text style={[t.bodyStrong, { color: colors.text, fontWeight: '700', fontSize: 14 }]}>{alert.title}</Text>
                <Text style={[t.caption, { color: colors.textMuted, fontSize: 11 }]}>{alert.time}</Text>
              </View>
              <Text style={[t.caption, { color: colors.textSecondary, fontSize: 12, lineHeight: 18 }]} numberOfLines={2}>
                {alert.desc}
              </Text>
            </View>
          </GlassCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: { gap: 10 },
  alertCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 18,
  },
  alertIcon: { fontSize: 24, marginTop: 2 },
  alertContent: { flex: 1, gap: 4 },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
