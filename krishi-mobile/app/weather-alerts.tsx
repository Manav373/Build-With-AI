import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { useScreenStrings } from '@/hooks/useLanguage';

const STRINGS = {
  en: {
    screenTitle: 'Weather Alerts',
    screenSubtitle: 'Alert Cards with Severity Colors',
    notificationSettings: 'Notification settings',
    severeThunderstormTitle: '🚨 Severe Thunderstorm Warning',
    severeThunderstormSub: 'Karnal District • Active June 23-24',
    severeThunderstormBody: 'Violent winds (up to 45 km/h) combined with heavy localized rainfall (35-50mm) are highly likely to hit. Soil saturation levels will rise rapidly.',
    severeThunderstormCropTip: 'Secure young sugarcane stalks and cover stacked grain heaps with tarpaulins immediately. Avoid fertilizer applications.',
    severeThunderstormIrrigation: 'Turn off all automatic pump schedules. Delay manual watering by 48 hours to prevent root rot and soil waterlogging.',
    highWindTitle: '⚠️ High Wind Caution',
    highWindSub: 'Haryana Plains • Active June 25',
    highWindBody: 'Steady regional gusts of 30 km/h will sweep the plain regions. Climber crops and heavy fruit-bearing branches are at risk.',
    highWindCropTip: 'Reinforce crop support stakes in tomato and vegetable patches.',
    highWindIrrigation: 'Irrigate slightly during early hours to anchor roots in dry sandy-loam soils.',
    acknowledged: 'Acknowledged',
    acknowledgedMsg: 'You have noted the warning: ',
    cropProtectionTip: 'Crop Protection Tip',
    irrigationMandate: 'Irrigation Mandate',
  },
  hi: {
    screenTitle: 'मौसम सतर्कताएं',
    screenSubtitle: 'गंभीरता रंगों के साथ सतर्कता कार्ड',
    notificationSettings: 'अधिसूचना सेटिंग्स',
    severeThunderstormTitle: '🚨 गंभीर बिजली गिरने की चेतावनी',
    severeThunderstormSub: 'करनाल जिला • सक्रिय 23-24 जून',
    severeThunderstormBody: 'हिंसक हवाएं (45 किमी/घंटा तक) भारी स्थानीय वर्षा (35-50 मिमी) के साथ मिलकर टकराने की संभावना है। मिट्टी की संतृप्ति का स्तर तेजी से बढ़ेगा।',
    severeThunderstormCropTip: 'युवा गन्ने के तनों को सुरक्षित करें और अनाज के ढेर को तुरंत टारपॉलिन से ढकें। उर्वरक प्रयोग से बचें।',
    severeThunderstormIrrigation: 'सभी स्वचालित पंप शेड्यूल बंद करें। जल भराव और मिट्टी की जलभराव से बचने के लिए मैनुअल सिंचाई को 48 घंटे तक विलंबित करें।',
    highWindTitle: '⚠️ तेज हवा की चेतावनी',
    highWindSub: 'हरियाणा मैदान • सक्रिय 25 जून',
    highWindBody: 'क्षेत्रीय झोंके 30 किमी/घंटा की गति से मैदानी क्षेत्रों को झूलेंगे। लिआना फसलें और भारी फल वाली शाखाएं खतरे में हैं।',
    highWindCropTip: 'टमाटर और सब्जियों के पैच में फसल सहायक खूंटियों को मजबूत करें।',
    highWindIrrigation: 'रेतीली दोमट मिट्टी में जड़ों को लंगर करने के लिए सुबह के समय हल्की सिंचाई करें।',
    acknowledged: 'स्वीकृत',
    acknowledgedMsg: 'आपने नोट किया है चेतावनी: ',
    cropProtectionTip: 'फसल संरक्षण सुझाव',
    irrigationMandate: 'सिंचाई अनिवार्य',
  },
  gu: {
    screenTitle: 'હવામાન ચેતવણીઓ',
    screenSubtitle: 'ગંભીરતા રંગો સાથે ચેતવણી કાર્ડ્સ',
    notificationSettings: 'સૂચના સેટિંગ્સ',
    severeThunderstormTitle: '🚨 ગંભીર વીજ વાદળ ચેતવણી',
    severeThunderstormSub: 'કરનાલ જિલ્લો • સક્રિય 23-24 જુન',
    severeThunderstormBody: 'હિંસક પવન (45 કિમી/કલાક સુધી) ભારે સ્થાનિક વરસાદ (35-50 મમી) સાથે આંધો મારશે. મિટ્ટીની સંતૃપ્તિ તીવ્રતાથી વધશે.',
    severeThunderstormCropTip: 'યુવા ગણ્ણો નાણાંની મૂર્તિ સુરક્ષિત કરો અને સ્ટેક્ડ અનાજના ઢગલાને તેરપૉલિન થી તુરંત ઢાંકો. ખાતરની અરજી ટાળો.',
    severeThunderstormIrrigation: 'તમામ આપોઆપ પંપ શેડ્યુલ બંધ કરો. મૂળ સડો અને મિટ્ટી જલભરાવ રોકવા માટે 48 કલાક સુધી મેનુઅલ પાણીદાણ કરવું મુલતવી રાખો.',
    highWindTitle: '⚠️ તેજ પવન સાવચેતી',
    highWindSub: 'હરિયાણા મેદાન • સક્રિય 25 જુન',
    highWindBody: '30 કિમી/કલાકની ઝીલો સમતલ પ્રદેશોને સ્વીપ કરશે. વાતોર ફસલો અને ભારે ફળ વહન કરતી શાખાઓ જોખમમાં છે.',
    highWindCropTip: 'ટોમેટો અને શાકભાજી પેચમાં ફસલ સમર્થન ખૂંટીઓને મજબૂત કરો.',
    highWindIrrigation: 'શુષ્ક રેતીદાર-તેલવાળી મિટ્ટીમાં મૂળ લંગર કરવા માટે વહેલા કલાકોમાં સહેજ પાણીદાણ કરો.',
    acknowledged: 'સ્વીકૃત',
    acknowledgedMsg: 'તમે નોંધ્યું છે ચેતવણી: ',
    cropProtectionTip: 'ફસલ સુરક્ષા ટિપ',
    irrigationMandate: 'સિંચાઈ ફરજ',
  },
  mr: {
    screenTitle: 'हवामान सतर्कता',
    screenSubtitle: 'गंभीरता रंगांसह सतर्कता कार्ड',
    notificationSettings: 'सूचना सेटिंग्ज',
    severeThunderstormTitle: '🚨 गंभीर वज्रमेघ इशारा',
    severeThunderstormSub: 'करनाल जिल्हा • सक्रिय 23-24 जून',
    severeThunderstormBody: 'हिंसक वारे (45 किमी/ता पर्यंत) भारी स्थानिक पाऊस (35-50 मिमी) सह धडकेल शक्य आहे. मातीचे संपृक्ततेचे स्तर वेगाने वाढेल.',
    severeThunderstormCropTip: 'तरुण उसळण्याच्या तणावांना सुरक्षित करा आणि वेगाने साठवलेल्या धान्य ढिगांना तारपॉलिनने झाकून टाका. खत वापर टाळा.',
    severeThunderstormIrrigation: 'सर्व आपोआप पंप वेळापत्रक बंद करा. मुळांचा विनाश आणि मातीचा जलभराव रोखण्यासाठी 48 तास पर्यंत हाताने पाणी घालणे मुलतवी ठेवा.',
    highWindTitle: '⚠️ तीव्र वारे सावधानी',
    highWindSub: 'हरियाणा मैदान • सक्रिय 25 जून',
    highWindBody: '30 किमी/ता चे स्थिर प्रादेशिक झोंके मैदान क्षेत्र स्वीप करतील. क्षेत्रलता पिके आणि भारी फळ बेरीज शाखा जोखमीत आहेत.',
    highWindCropTip: 'टोमॅटो आणि भाजीपाला पॅचमध्ये पिकांना समर्थन दिणाऱ्या काठीला मजबूत करा.',
    highWindIrrigation: 'सुकी वाळूसारखी-दुष्ट माती मध्ये मुळांना लंगर घालण्यासाठी सकाळच्या वेळी हलक्या मापाने सिंचन करा.',
    acknowledged: 'स्वीकृत',
    acknowledgedMsg: 'आपण नोट केले सावधानी: ',
    cropProtectionTip: 'पिकांचे संरक्षण सुझाव',
    irrigationMandate: 'सिंचन बंधन',
  },
};

export default function WeatherAlertsScreen() {
  const colors = useThemeColors();
  const t = useType();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);

  const activeAlerts: WeatherAlert[] = [
    {
      id: 'a1',
      severity: 'danger',
      title: s.severeThunderstormTitle,
      sub: s.severeThunderstormSub,
      body: s.severeThunderstormBody,
      icon: 'weather-lightning-rainy',
      cropTip: s.severeThunderstormCropTip,
      irrigationAdvice: s.severeThunderstormIrrigation,
    },
    {
      id: 'a2',
      severity: 'warning',
      title: s.highWindTitle,
      sub: s.highWindSub,
      body: s.highWindBody,
      icon: 'weather-windy',
      cropTip: s.highWindCropTip,
      irrigationAdvice: s.highWindIrrigation,
    },
  ];

  const handleDismissAlert = (title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Alert.alert(s.acknowledged, `${s.acknowledgedMsg}${title}.`);
  };

  return (
    <Screen
      back
      title={s.screenTitle}
      emoji="⚠️"
      subtitle={s.screenSubtitle}
      right={
        <HeaderIconButton
          icon="bell"
          label={s.notificationSettings}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }}
        />
      }
    >
      {activeAlerts.map((alert, index) => {
        const isDanger = alert.severity === 'danger';
        const alertColor = isDanger ? colors.danger : colors.warning;

        return (
          <FadeInUp key={alert.id} index={index} distance={16}>
            <GlassCard style={styles.card}>
              {/* Alert Top Header */}
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <MaterialCommunityIcons name={alert.icon as any} size={20} color={alertColor} />
                  <View style={styles.headerTextWrap}>
                    <Text style={[t.title, { color: colors.text }]} numberOfLines={2}>{alert.title}</Text>
                    <Text style={[t.caption, { color: colors.textMuted }]} numberOfLines={1}>{alert.sub}</Text>
                  </View>
                </View>
                <PressableScale
                  onPress={() => handleDismissAlert(alert.title)}
                  scaleTo={0.95}
                  accessibilityLabel="Dismiss alert"
                  style={{ padding: 8 }}
                >
                  <Feather name="check" size={16} color={colors.textMuted} />
                </PressableScale>
              </View>

              {/* Description */}
              <Text style={[t.body, { color: colors.textSecondary }]}>{alert.body}</Text>

              {/* Action advice cards */}
              <View style={styles.adviceRow}>
                <View style={[styles.adviceBox, { backgroundColor: `${colors.accent}08`, borderColor: colors.border }]}>
                  <View style={styles.adviceTitleRow}>
                    <Feather name="shield" size={13} color={colors.accent} />
                    <Text style={[t.title, { color: colors.text, fontSize: 12, flexShrink: 1 }]} numberOfLines={1}>{s.cropProtectionTip}</Text>
                  </View>
                  <Text style={[t.body, { color: colors.textSecondary, fontSize: 12 }]}>{alert.cropTip}</Text>
                </View>

                <View style={[styles.adviceBox, { backgroundColor: `${colors.info}08`, borderColor: colors.border }]}>
                  <View style={styles.adviceTitleRow}>
                    <Feather name="droplet" size={13} color={colors.info} />
                    <Text style={[t.title, { color: colors.text, fontSize: 12, flexShrink: 1 }]} numberOfLines={1}>{s.irrigationMandate}</Text>
                  </View>
                  <Text style={[t.body, { color: colors.textSecondary, fontSize: 12 }]}>{alert.irrigationAdvice}</Text>
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
  card: {
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  headerLeft: { flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 },
  headerTextWrap: { flex: 1 },
  adviceRow: { gap: 10, marginTop: 4 },
  adviceBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  adviceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
