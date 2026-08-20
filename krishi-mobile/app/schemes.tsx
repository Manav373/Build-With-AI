import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Linking, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { Screen, GlassCard, HeaderIconButton } from '@/components/ui/Screen';
import { PressableScale, FadeInUp } from '@/components/ui/Motion';
import { DesignTokens } from '@/constants/DesignTokens';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useScreenStrings } from '@/hooks/useLanguage';
import { getAllSchemes } from '@/services/api';

const STRINGS = {
  en: {
    screenTitle: 'Schemes',
    screenSubtitle: 'Government Support Programs',
    bookmarks: 'Bookmarks',
    searchPlaceholder: 'Search schemes (e.g. PM-Kisan, Fasal)...',
    filterByCategory: 'FILTER BY CATEGORY',
    categoryAll: 'ALL',
    categoryDirect: 'DIRECT',
    categoryInsurance: 'INSURANCE',
    categorySubsidy: 'SUBSIDY',
    categoryCredit: 'CREDIT',
    noSchemesFound: 'No Schemes Found',
    trySearchTerms: 'Try entering different search terms.',
    officialGovtProgram: 'Official Govt Program',
    benefits: 'BENEFITS',
    lastDate: 'LAST DATE',
    eligibilityCheckpoints: '📋 Eligibility Checkpoints',
    requiredDocuments: '📁 Required Documents Checklist',
    applyNow: 'Apply Now',
    errorSharing: 'Error sharing scheme details.',
    errorOpeningLink: 'Could not open portal link.',
  },
  hi: {
    screenTitle: 'योजनाएं',
    screenSubtitle: 'सरकारी सहायता कार्यक्रम',
    bookmarks: 'बुकमार्क',
    searchPlaceholder: 'योजना खोजें (जैसे PM-किसान, फसल)...',
    filterByCategory: 'श्रेणी द्वारा फ़िल्टर करें',
    categoryAll: 'सभी',
    categoryDirect: 'सीधा',
    categoryInsurance: 'बीमा',
    categorySubsidy: 'सब्सिडी',
    categoryCredit: 'क्रेडिट',
    noSchemesFound: 'कोई योजना नहीं मिली',
    trySearchTerms: 'विभिन्न खोज शर्तें दर्ज करने का प्रयास करें।',
    officialGovtProgram: 'आधिकारिक सरकारी कार्यक्रम',
    benefits: 'लाभ',
    lastDate: 'अंतिम तारीख',
    eligibilityCheckpoints: '📋 पात्रता जांच सूची',
    requiredDocuments: '📁 आवश्यक दस्तावेज़ चेकलिस्ट',
    applyNow: 'अभी आवेदन करें',
    errorSharing: 'योजना विवरण साझा करने में त्रुटि।',
    errorOpeningLink: 'पोर्टल लिंक नहीं खोल सका।',
  },
  gu: {
    screenTitle: 'યોજનાઓ',
    screenSubtitle: 'સરકારી સહાય કાર્યક્રમો',
    bookmarks: 'બુકમાર્ક્સ',
    searchPlaceholder: 'યોજનાઓ શોધો (જેમ કે PM-કિસાન, ફસલ)...',
    filterByCategory: 'શ્રેણી દ્વારા ફિલ્ટર કરો',
    categoryAll: 'બધા',
    categoryDirect: 'સીધું',
    categoryInsurance: 'બીમો',
    categorySubsidy: 'સબસિડી',
    categoryCredit: 'ક્રેડિટ',
    noSchemesFound: 'કોઈ યોજના મળી નહીં',
    trySearchTerms: 'વિવિધ શોધ શરતો દાખલ કરવાનો પ્રયાસ કરો.',
    officialGovtProgram: 'આધિકારિક સરકારી કાર્યક્રમ',
    benefits: 'લાભો',
    lastDate: 'છેલ્લો તારીખ',
    eligibilityCheckpoints: '📋 પાત્રતા તપાસ સૂચી',
    requiredDocuments: '📁 આવશ્યક દસ્તાવેજ ચેકલિસ્ટ',
    applyNow: 'હવે અરજી કરો',
    errorSharing: 'યોજના વિગતો શેર કરવામાં ભૂલ.',
    errorOpeningLink: 'પોર્ટલ લિંક ખોલી શક્યું નહીં.',
  },
  mr: {
    screenTitle: 'योजना',
    screenSubtitle: 'सरकारी समर्थन कार्यक्रम',
    bookmarks: 'बुकमार्क',
    searchPlaceholder: 'योजना शोधा (उदा. PM-किसान, फसल)...',
    filterByCategory: 'श्रेणी द्वारे फिल्टर करा',
    categoryAll: 'सर्व',
    categoryDirect: 'थेट',
    categoryInsurance: 'विमा',
    categorySubsidy: 'अनुदान',
    categoryCredit: 'क्रेडिट',
    noSchemesFound: 'कोणतीही योजना सापडली नाही',
    trySearchTerms: 'विविध शोध अटी प्रविष्ट करण्याचा प्रयास करा.',
    officialGovtProgram: 'अधिकृत शासकीय कार्यक्रम',
    benefits: 'लाभ',
    lastDate: 'अंतिम तारीख',
    eligibilityCheckpoints: '📋 पात्रता तपासणी यादी',
    requiredDocuments: '📁 आवश्यक दस्तऐवज तपशील',
    applyNow: 'आता अर्ज करा',
    errorSharing: 'योजना तपशील शेअर करण्यात त्रुटी.',
    errorOpeningLink: 'पोर्टल लिंक उघडू शकला नाही.',
  },
};

interface SchemeItem {
  id: string;
  category: 'direct' | 'insurance' | 'subsidy' | 'credit';
  title: string;
  benefit: string;
  deadline: string;
  desc: string;
  eligibility: string[];
  documents: string[];
  link: string;
  isBookmarked: boolean;
}

export default function SchemesScreen() {
  const colors = useThemeColors();
  const t = useType();
  const scheme = useColorScheme();
  const router = useRouter();
  const s = useScreenStrings(STRINGS as any);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'direct' | 'insurance' | 'subsidy' | 'credit'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Government schemes mock list — rendered immediately, replaced when API succeeds
  const mockSchemes: SchemeItem[] = [
    {
      id: 's1',
      category: 'direct',
      title: '📜 Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      benefit: '₹6,000 / Year',
      deadline: 'July 15, 2026',
      desc: 'Income support of ₹6,000 per year in three equal installments directly to Aadhaar-linked farming bank accounts.',
      eligibility: ['Small & Marginal Farmers', 'Must own cultivable agricultural land', 'Under 2 Hectares landholdings'],
      documents: ['Aadhaar Card', 'Land Registry papers (Khatauni)', 'Bank account details (IFSC)'],
      link: 'https://pmkisan.gov.in/',
      isBookmarked: true,
    },
    {
      id: 's2',
      category: 'insurance',
      title: '🌾 PM Fasal Bima Yojana (PMFBY)',
      benefit: 'Full Crop Cover against failure',
      deadline: 'August 10, 2026',
      desc: 'Financial support and insurance coverage to farmers in the event of failure of any of the notified crops as a result of natural calamities.',
      eligibility: ['All farmers including sharecroppers/tenant farmers', 'Sowing notified crops in insured areas'],
      documents: ['Land records copy', 'Sowing certificate', 'Bank passbook copy'],
      link: 'https://pmfby.gov.in/',
      isBookmarked: false,
    },
    {
      id: 's3',
      category: 'credit',
      title: '💳 Kisan Credit Card (KCC) Scheme',
      benefit: '4% Interest Credit line',
      deadline: 'Ongoing enrollment',
      desc: 'Provides farmers with easy short-term credit lines to meet cultivation expenses, machinery purchase, and post-harvest requirements.',
      eligibility: ['All farmers (owner cultivators)', 'Tenant farmers & oral lessees', 'Self-Help Groups'],
      documents: ['Land ownership records', 'Cropping pattern proof', 'Identity & Address proof'],
      link: 'https://www.sbi.co.in/',
      isBookmarked: false,
    },
  ];

  const [schemes, setSchemes] = useState<SchemeItem[]>(mockSchemes);

  useEffect(() => {
    (async () => {
      try {
        const response = await getAllSchemes();
        if (Array.isArray(response) && response.length > 0) {
          const mapped = response.map((item: any, idx: number) => ({
            id: item.id ?? `scheme_${idx}`,
            category: (item.category?.toLowerCase?.() || 'direct') as any,
            title: item.title || item.name || 'Untitled Scheme',
            benefit: item.benefit || item.benefits || '',
            deadline: item.deadline || item.last_date || 'Ongoing',
            desc: item.description || item.desc || '',
            eligibility: Array.isArray(item.eligibility) ? item.eligibility : [],
            documents: Array.isArray(item.documents) ? item.documents : [],
            link: item.link || item.url || 'https://pmkisan.gov.in/',
            isBookmarked: item.isBookmarked ?? false,
          }));
          setSchemes(mapped);
        }
      } catch {
        // Silent fail — keep existing mock schemes
      }
    })();
  }, []);

  const handleToggleBookmark = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSchemes(prev => prev.map(s => s.id === id ? { ...s, isBookmarked: !s.isBookmarked } : s));
  };

  const handleShare = async (title: string, link: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Share.share({ message: `Check out this agricultural scheme: ${title}. Link: ${link}` });
    } catch {
      Alert.alert('Error', s.errorSharing);
    }
  };

  const handleToggleExpand = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setExpandedId(prev => prev === id ? null : id);
  };

  const filteredSchemes = schemes.filter(
    s => (activeCategory === 'All' || s.category === activeCategory) &&
         s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Screen
      title={s.screenTitle}
      emoji="📋"
      subtitle={s.screenSubtitle}
      back
      right={<HeaderIconButton icon="bookmark" label={s.bookmarks} />}
    >
      {/* Search Bar */}
      <FadeInUp index={0} distance={16}>
        <GlassCard padding={0}>
          <View style={[styles.searchBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              placeholder={s.searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[t.body, { color: colors.text, flex: 1, marginLeft: 8 }]}
            />
          </View>
        </GlassCard>
      </FadeInUp>

      {/* Category Filter Chips */}
      <FadeInUp index={1} distance={16}>
        <View style={styles.filterContainer}>
          <Text style={[t.overline, { color: colors.textMuted, marginBottom: 12, marginLeft: 4 }]}>{s.filterByCategory}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {(['All', 'direct', 'insurance', 'subsidy', 'credit'] as const).map(cat => (
              <PressableScale
                key={cat}
                onPress={() => setActiveCategory(cat)}
                haptic="light"
              >
                <View
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: activeCategory === cat ? colors.accent : colors.surfaceElevated,
                      borderColor: activeCategory === cat ? 'transparent' : colors.border,
                    },
                  ]}
                >
                  <Text style={[t.caption, { color: activeCategory === cat ? '#ffffff' : colors.text, fontWeight: '700' }]}>
                    {cat === 'All' ? s.categoryAll : cat === 'direct' ? s.categoryDirect : cat === 'insurance' ? s.categoryInsurance : cat === 'subsidy' ? s.categorySubsidy : s.categoryCredit}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </ScrollView>
        </View>
      </FadeInUp>

      {/* Schemes List or Empty State */}
      {filteredSchemes.length === 0 ? (
        <FadeInUp index={2} distance={16}>
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color={colors.textMuted} />
            <Text style={[t.title, { color: colors.text }]}>{s.noSchemesFound}</Text>
            <Text style={[t.body, { color: colors.textSecondary }]}>{s.trySearchTerms}</Text>
          </View>
        </FadeInUp>
      ) : (
        filteredSchemes.map((item, index) => {
          const isExpanded = expandedId === item.id;
          return (
            <FadeInUp key={item.id} index={index + 2} distance={16}>
              <GlassCard padding={16}>
                {/* Scheme Header - Collapsible */}
                <PressableScale onPress={() => handleToggleExpand(item.id)} haptic="light">
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.officialHeaderRow}>
                        <MaterialCommunityIcons name="bank" size={14} color={colors.accent} />
                        <Text numberOfLines={1} style={[t.caption, { color: colors.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, flexShrink: 1 }]}>{s.officialGovtProgram}</Text>
                      </View>
                      <Text style={[t.bodyStrong, { color: colors.text, lineHeight: 21 }]}>{item.title}</Text>
                    </View>
                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} style={{ marginLeft: 8 }} />
                  </View>
                </PressableScale>

                {/* Sub info - Benefits and Deadline */}
                <View style={styles.subRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }]}>{s.benefits}</Text>
                    <Text style={[t.bodyStrong, { color: colors.accent, marginTop: 4 }]}>{item.benefit}</Text>
                  </View>
                  <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[t.caption, { color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }]}>{s.lastDate}</Text>
                    <Text style={[t.bodyStrong, { color: colors.text, marginTop: 4 }]}>{item.deadline}</Text>
                  </View>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={[styles.expandedBlock, { borderTopColor: colors.border }]}>
                    <Text style={[t.body, { color: colors.textSecondary, lineHeight: 18.5 }]}>{item.desc}</Text>

                    {/* Eligibility List */}
                    <View style={styles.infoList}>
                      <Text style={[t.bodyStrong, { color: colors.text }]}>{s.eligibilityCheckpoints}</Text>
                      {item.eligibility.map(el => (
                        <View key={el} style={styles.infoItemRow}>
                          <Feather name="check" size={12} color={colors.accent} />
                          <Text style={[t.body, { color: colors.textSecondary, flex: 1 }]}>{el}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Documents List */}
                    <View style={styles.infoList}>
                      <Text style={[t.bodyStrong, { color: colors.text }]}>{s.requiredDocuments}</Text>
                      {item.documents.map(doc => (
                        <View key={doc} style={styles.infoItemRow}>
                          <Feather name="file-text" size={12} color={colors.accent} />
                          <Text style={[t.body, { color: colors.textSecondary, flex: 1 }]}>{doc}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Expanded Actions */}
                    <View style={styles.expandedActions}>
                      <PressableScale
                        onPress={() => handleToggleBookmark(item.id)}
                        haptic="light"
                      >
                        <View style={[styles.actionIconBtn, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
                          <Feather name="bookmark" size={16} color={item.isBookmarked ? colors.accent : colors.text} />
                        </View>
                      </PressableScale>

                      <PressableScale
                        onPress={() => handleShare(item.title, item.link)}
                        haptic="light"
                      >
                        <View style={[styles.actionIconBtn, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
                          <Feather name="share-2" size={16} color={colors.text} />
                        </View>
                      </PressableScale>

                      <PressableScale
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                          Linking.openURL(item.link).catch(() => Alert.alert('Error', s.errorOpeningLink));
                        }}
                        haptic="medium"
                        style={{ flex: 1 }}
                      >
                        <LinearGradient
                          colors={colors.gradient.success}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.applyBtn, { ...DesignTokens.shadow.level1 }]}
                        >
                          <Feather name="external-link" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                          <Text style={[t.bodyStrong, { color: '#ffffff' }]}>{s.applyNow}</Text>
                        </LinearGradient>
                      </PressableScale>
                    </View>
                  </View>
                )}
              </GlassCard>
            </FadeInUp>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: DesignTokens.radius.medium,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterContainer: {
    gap: 8,
  },
  categoryScroll: {
    gap: 8,
    paddingHorizontal: 0,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: DesignTokens.radius.medium,
    borderWidth: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  officialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
    alignItems: 'flex-start',
  },
  vDivider: {
    width: 1,
    height: 50,
  },
  expandedBlock: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
    gap: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  expandedActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionIconBtn: {
    width: 44,
    height: 44,
    borderRadius: DesignTokens.radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: DesignTokens.radius.large,
    overflow: 'hidden',
  },
});
