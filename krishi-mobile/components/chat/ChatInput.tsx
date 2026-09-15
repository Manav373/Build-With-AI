import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCameraPress?: () => void;
  onVoicePress?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onCameraPress,
  onVoicePress,
  disabled = false,
  placeholder = 'Ask KrishiAI anything...',
}: ChatInputProps) {
  const [text, setText] = useState('');
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onSend(text.trim());
    setText('');
  };

  const hasText = text.trim().length > 0;

  return (
    <View style={[styles.container, {
      backgroundColor: colors.surface,
      borderColor: colors.borderStrong,
    }]}>
      {/* Camera button */}
      <TouchableOpacity
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCameraPress?.(); }}
        style={[styles.iconBtn, { backgroundColor: `${colors.accent}12` }]}
        activeOpacity={0.7}
      >
        <Feather name="camera" size={18} color={colors.accent} />
      </TouchableOpacity>

      {/* Input */}
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text }]}
        multiline
        maxLength={1000}
        editable={!disabled}
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />

      {/* Send / Voice toggle */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {hasText ? (
          <TouchableOpacity
            onPress={handleSend}
            disabled={disabled}
            style={[styles.sendBtn, { backgroundColor: colors.green }]}
            activeOpacity={0.8}
          >
            <Feather name="send" size={16} color="#e2f0e4" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onVoicePress?.(); }}
            style={[styles.iconBtn, { backgroundColor: `${colors.accent}12` }]}
            activeOpacity={0.7}
          >
            <Feather name="mic" size={18} color={colors.accent} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    maxHeight: 100,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
