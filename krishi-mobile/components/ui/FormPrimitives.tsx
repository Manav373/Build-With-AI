import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch as RNSwitch, TextInput, Pressable } from 'react-native';
import { useThemeColors, useType } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PressableScale } from './Motion';

/**
 * KrishiAI Form Primitives
 * ---------------------------------------------------------------------------
 * Reusable form components for consistent input handling across settings,
 * onboarding, and data entry screens.
 */

// ===========================================================================
// Switch  (iOS-style toggle)
// ===========================================================================
export function Switch({
  value,
  onValueChange,
  disabled = false,
  trackColor = undefined,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  trackColor?: { false: string; true: string };
}) {
  const colors = useThemeColors();
  const tc = trackColor || { false: colors.border, true: '#2E7D32' };

  return (
    <RNSwitch
      value={value}
      onValueChange={(newVal: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onValueChange(newVal);
      }}
      trackColor={tc}
      disabled={disabled}
    />
  );
}

// ===========================================================================
// Field  (labeled text input)
// ===========================================================================
export interface FieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: any;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad' | 'decimal-pad';
  secureTextEntry?: boolean;
  maxLength?: number;
  editable?: boolean;
}

export function Field({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength,
  editable = true,
}: FieldProps) {
  const colors = useThemeColors();
  const t = useType();

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text style={[t.label, { color: colors.text }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.fieldBox,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.danger : colors.border,
            borderWidth: error ? 1.5 : 1,
          },
        ]}
      >
        {icon ? <Feather name={icon} size={18} color={colors.textSecondary} /> : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          editable={editable}
          style={[
            t.body,
            {
              color: colors.text,
              flex: 1,
            },
          ]}
        />
      </View>
      {error ? (
        <Text style={[t.caption, { color: colors.danger, marginTop: 2 }]}>{error}</Text>
      ) : null}
    </View>
  );
}

// ===========================================================================
// Segmented  (radio group / tab-like controls)
// ===========================================================================
export interface SegmentedOption {
  label: string;
  value: string;
  icon?: any;
}

export function Segmented({
  options,
  value,
  onValueChange,
  label,
}: {
  options: SegmentedOption[];
  value: string;
  onValueChange: (val: string) => void;
  label?: string;
}) {
  const colors = useThemeColors();
  const t = useType();

  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text style={[t.label, { color: colors.text }]}>{label}</Text>
      ) : null}
      <View style={styles.segmentedRow}>
        {options.map((opt) => (
          <PressableScale
            key={opt.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onValueChange(opt.value);
            }}
            haptic="light"
            style={{ flex: 1 }}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === opt.value }}
          >
            <View
              style={[
                styles.segmentedOption,
                {
                  backgroundColor:
                    value === opt.value ? colors.accent : colors.surfaceElevated,
                  borderColor:
                    value === opt.value ? 'transparent' : colors.border,
                  borderWidth: value === opt.value ? 0 : 1,
                },
              ]}
            >
              {opt.icon ? (
                <Feather
                  name={opt.icon}
                  size={16}
                  color={value === opt.value ? '#ffffff' : colors.text}
                  style={{ marginRight: 6 }}
                />
              ) : null}
              <Text
                style={[
                  t.bodySmall,
                  {
                    color: value === opt.value ? '#ffffff' : colors.text,
                    fontWeight: value === opt.value ? '700' : '600',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </View>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

// ===========================================================================
// Checkbox  (multi-select toggle)
// ===========================================================================
export function Checkbox({
  label,
  value,
  onValueChange,
  subtitle,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  subtitle?: string;
}) {
  const colors = useThemeColors();
  const t = useType();

  return (
    <PressableScale
      onPress={() => onValueChange(!value)}
      haptic="light"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
    >
      <View style={styles.checkboxRow}>
        <View
          style={[
            styles.checkboxBox,
            {
              backgroundColor: value ? colors.accent : colors.surfaceElevated,
              borderColor: value ? colors.accent : colors.border,
              borderWidth: 1.5,
            },
          ]}
        >
          {value ? (
            <Feather name="check" size={12} color="#ffffff" />
          ) : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[t.body, { color: colors.text, fontWeight: '600' }]}>
            {label}
          </Text>
          {subtitle ? (
            <Text style={[t.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

// ===========================================================================
// BottomSheet  (simple modal overlay for options)
// ===========================================================================
export interface BottomSheetProps {
  visible: boolean;
  title: string;
  options: Array<{ label: string; value: string; onSelect?: () => void }>;
  onDismiss: () => void;
  selectedValue?: string;
}

export function BottomSheet({ visible, title, options, onDismiss, selectedValue }: BottomSheetProps) {
  const colors = useThemeColors();
  const t = useType();

  if (!visible) return null;

  return (
    <Pressable onPress={onDismiss} style={styles.bottomSheetOverlay}>
      <View style={[styles.bottomSheetContent, { backgroundColor: colors.card }]}>
        <View style={styles.bottomSheetHeader}>
          <Text style={[t.titleSmall, { color: colors.text }]}>{title}</Text>
          <PressableScale onPress={onDismiss} haptic="light">
            <Feather name="x" size={20} color={colors.text} />
          </PressableScale>
        </View>

        <View style={[styles.bottomSheetDivider, { backgroundColor: colors.border }]} />

        <View style={{ gap: 8 }}>
          {options.map((opt, idx) => (
            <PressableScale
              key={opt.value}
              onPress={() => {
                opt.onSelect?.();
                onDismiss();
              }}
              haptic="light"
              style={[styles.bottomSheetOption, idx === options.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[t.body, { color: colors.text, fontWeight: '600' }]}>
                  {opt.label}
                </Text>
                {selectedValue === opt.value ? (
                  <Feather name="check" size={16} color={colors.accent} />
                ) : null}
              </View>
            </PressableScale>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  segmentedRow: { flexDirection: 'row', gap: 8 },
  segmentedOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    gap: 12,
  },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bottomSheetDivider: { height: 1 },
  bottomSheetOption: { paddingVertical: 12, borderBottomWidth: 1 },
});
