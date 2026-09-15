import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Platform, DimensionValue } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { DesignTokens } from '@/constants/DesignTokens';
import { useColorScheme } from '@/hooks/useColorScheme';

// Helper to resolve colors dynamically
const useKitTheme = () => {
  const scheme = useColorScheme();
  return Colors[scheme];
};

/* ==========================================
   INPUTS SECTION
   ========================================== */

export interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export const UiSearchInput: React.FC<SearchInputProps> = ({ placeholder = 'Search...', value, onChangeText, onClear }) => {
  const theme = useKitTheme();
  return (
    <View style={[styles.searchContainer, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderStrong }]}>
      <Feather name="search" size={16} color={theme.textMuted} style={styles.searchIcon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        style={[styles.searchInput, { color: theme.text }]}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Feather name="x" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export interface TextFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

export const UiTextField: React.FC<TextFieldProps> = ({ label, placeholder, value, onChangeText, error, secureTextEntry, keyboardType }) => {
  const theme = useKitTheme();
  return (
    <View style={styles.textFieldContainer}>
      <Text style={[styles.textLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[
          styles.textInput,
          {
            color: theme.text,
            borderColor: error ? theme.danger : theme.borderStrong,
            backgroundColor: theme.surfaceElevated,
          },
        ]}
      />
      {error && <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>}
    </View>
  );
};

export interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const UiSegmentedControl: React.FC<SegmentedControlProps> = ({ options, selectedIndex, onSelect }) => {
  const theme = useKitTheme();
  return (
    <View style={[styles.segmentedContainer, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
      {options.map((opt, index) => {
        const isSelected = selectedIndex === index;
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.segmentBtn,
              {
                backgroundColor: isSelected ? theme.accent : 'transparent',
              },
            ]}
            onPress={() => onSelect(index)}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, { color: isSelected ? '#ffffff' : theme.textSecondary, fontWeight: isSelected ? '800' : '600' }]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export const UiCheckbox: React.FC<CheckboxProps> = ({ label, checked, onToggle }) => {
  const theme = useKitTheme();
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onToggle} activeOpacity={0.8}>
      <View
        style={[
          styles.checkboxCircle,
          {
            borderColor: checked ? theme.accent : theme.borderStrong,
            backgroundColor: checked ? theme.accent : 'transparent',
          },
        ]}
      >
        {checked && <Feather name="check" size={10} color="#ffffff" />}
      </View>
      <Text style={[styles.checkboxLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

/* ==========================================
   CARDS SECTION
   ========================================== */

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'accent';
  style?: any;
}

export const UiCard: React.FC<CardProps> = ({ children, variant = 'elevated', style }) => {
  const theme = useKitTheme();
  const scheme = useColorScheme();
  
  return (
    <View
      style={[
        styles.baseCard,
        variant === 'elevated' && {
          backgroundColor: theme.card,
          borderColor: theme.border,
          ...DesignTokens.shadow.level1,
        },
        variant === 'outlined' && {
          backgroundColor: theme.surface,
          borderColor: theme.borderStrong,
          borderWidth: 1.5,
        },
        variant === 'accent' && {
          backgroundColor: scheme === 'dark' ? '#0e2a14' : '#f0fdf4',
          borderColor: theme.accent,
          borderWidth: 1.5,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export interface WeatherCardProps {
  temp: string;
  condition: string;
  humidity: string;
  rainChance: string;
}

export const UiWeatherCard: React.FC<WeatherCardProps> = ({ temp, condition, humidity, rainChance }) => {
  const theme = useKitTheme();
  return (
    <UiCard style={styles.weatherCard}>
      <View style={styles.weatherTop}>
        <View>
          <Text style={[styles.weatherTempText, { color: theme.text }]}>{temp}</Text>
          <Text style={[styles.weatherConditionText, { color: theme.textSecondary }]}>{condition}</Text>
        </View>
        <MaterialCommunityIcons name="weather-partly-cloudy" size={36} color={theme.warning} />
      </View>
      <View style={[styles.weatherStats, { borderTopColor: theme.border }]}>
        <View style={styles.weatherStatItem}>
          <Feather name="droplet" size={12} color="#3b82f6" />
          <Text style={[styles.weatherStatVal, { color: theme.text }]}>{humidity} Humidity</Text>
        </View>
        <View style={styles.weatherStatItem}>
          <Feather name="cloud-rain" size={12} color={theme.accent} />
          <Text style={[styles.weatherStatVal, { color: theme.text }]}>{rainChance} Rain</Text>
        </View>
      </View>
    </UiCard>
  );
};

export interface MarketCardProps {
  mandi: string;
  commodity: string;
  price: string;
  change: string;
  isUp: boolean;
}

export const UiMarketCard: React.FC<MarketCardProps> = ({ mandi, commodity, price, change, isUp }) => {
  const theme = useKitTheme();
  return (
    <UiCard variant="outlined" style={styles.marketCard}>
      <View style={styles.marketRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.marketTitle, { color: theme.text }]}>{commodity}</Text>
          <Text style={[styles.marketSub, { color: theme.textSecondary }]}>{mandi}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={[styles.marketPrice, { color: theme.text }]}>{price}</Text>
          <View style={[styles.trendBadge, { backgroundColor: isUp ? `${theme.success}12` : `${theme.danger}12` }]}>
            <Text style={[styles.trendText, { color: isUp ? theme.success : theme.danger }]}>
              {change}
            </Text>
          </View>
        </View>
      </View>
    </UiCard>
  );
};

export interface DiseaseCardProps {
  disease: string;
  confidence: number;
  severity: 'High' | 'Medium' | 'Low';
  treatment: string;
}

export const UiDiseaseCard: React.FC<DiseaseCardProps> = ({ disease, confidence, severity, treatment }) => {
  const theme = useKitTheme();
  return (
    <UiCard variant="accent" style={styles.diseaseCard}>
      <View style={styles.diseaseHeader}>
        <MaterialCommunityIcons name="virus-outline" size={20} color={theme.danger} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.diseaseTitle, { color: theme.text }]}>{disease}</Text>
          <Text style={[styles.diseaseSub, { color: theme.textSecondary }]}>{confidence}% Confidence</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: severity === 'High' ? theme.danger : severity === 'Medium' ? theme.warning : theme.success }]}>
          <Text style={styles.severityText}>{severity}</Text>
        </View>
      </View>
      <Text style={[styles.diseaseTreatment, { color: theme.textSecondary }]}>
        <Text style={{ fontWeight: '800' }}>AI Treatment: </Text>{treatment}
      </Text>
    </UiCard>
  );
};

/* ==========================================
   WIDGETS & ANIMATIONS
   ========================================== */

export interface ProgressRingProps {
  percent: number;
  label?: string;
}

export const UiProgressRing: React.FC<ProgressRingProps> = ({ percent, label = 'Health' }) => {
  const theme = useKitTheme();
  return (
    <View style={[styles.ringContainer, { borderColor: theme.borderStrong }]}>
      <LinearGradient
        colors={theme.gradient.primary}
        style={styles.ringInner}
      >
        <Text style={styles.ringValText}>{percent}%</Text>
        <Text style={styles.ringLblText}>{label}</Text>
      </LinearGradient>
    </View>
  );
};

export interface TrendIndicatorProps {
  isUp: boolean;
  value: string;
}

export const UiTrendIndicator: React.FC<TrendIndicatorProps> = ({ isUp, value }) => {
  const theme = useKitTheme();
  return (
    <View style={[styles.trendIndicatorContainer, { backgroundColor: isUp ? `${theme.success}12` : `${theme.danger}12` }]}>
      <Feather name={isUp ? 'trending-up' : 'trending-down'} size={12} color={isUp ? theme.success : theme.danger} />
      <Text style={[styles.trendIndicatorText, { color: isUp ? theme.success : theme.danger }]}>
        {value}
      </Text>
    </View>
  );
};

export const UiWaveAnimation: React.FC = () => {
  const theme = useKitTheme();
  return (
    <View style={styles.waveWrapper}>
      {/* Visual static ripple wave lines simulation */}
      <View style={[styles.waveLine, { height: 12, backgroundColor: theme.accent }]} />
      <View style={[styles.waveLine, { height: 28, backgroundColor: theme.accent }]} />
      <View style={[styles.waveLine, { height: 18, backgroundColor: theme.accent }]} />
      <View style={[styles.waveLine, { height: 36, backgroundColor: theme.accent }]} />
      <View style={[styles.waveLine, { height: 22, backgroundColor: theme.accent }]} />
      <View style={[styles.waveLine, { height: 10, backgroundColor: theme.accent }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: DesignTokens.radius.medium,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '700' },
  textFieldContainer: { gap: 6, marginVertical: 4 },
  textLabel: { fontSize: 12.5, fontWeight: '800' },
  textInput: {
    height: 44,
    borderRadius: DesignTokens.radius.medium,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13.5,
    fontWeight: '700',
  },
  errorText: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: DesignTokens.radius.medium,
    borderWidth: 1,
    padding: 3,
  },
  segmentBtn: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  checkboxCircle: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: { fontSize: 13.5, fontWeight: '600' },
  baseCard: {
    padding: 16,
    borderRadius: DesignTokens.radius.extraLarge,
    borderWidth: 1,
  },
  weatherCard: { gap: 12 },
  weatherTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weatherTempText: { fontSize: 24, fontWeight: '900' },
  weatherConditionText: { fontSize: 12, fontWeight: '600' },
  weatherStats: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 10, gap: 16 },
  weatherStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weatherStatVal: { fontSize: 11.5, fontWeight: '700' },
  marketCard: { padding: 12 },
  marketRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  marketTitle: { fontSize: 13.5, fontWeight: '800' },
  marketSub: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  marketPrice: { fontSize: 15, fontWeight: '800' },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  trendText: { fontSize: 10, fontWeight: '900' },
  diseaseCard: { gap: 8 },
  diseaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diseaseTitle: { fontSize: 14.5, fontWeight: '800' },
  diseaseSub: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  severityText: { color: '#ffffff', fontSize: 9.5, fontWeight: '900' },
  diseaseTreatment: { fontSize: 12, fontWeight: '500', lineHeight: 17.5 },
  ringContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  ringInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  ringLblText: { color: '#ffffff', fontSize: 8, fontWeight: '700', textTransform: 'uppercase' },
  trendIndicatorContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  trendIndicatorText: { fontSize: 10, fontWeight: '800' },
  waveWrapper: { flexDirection: 'row', gap: 4, height: 40, alignItems: 'center' },
  waveLine: { width: 3, borderRadius: 1.5 },
});
