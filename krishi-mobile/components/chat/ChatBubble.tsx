import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAi]}>
      {!isUser && <Text style={styles.avatar}>🌾</Text>}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: colors.green }]
            : [styles.bubbleAi, {
                backgroundColor: scheme === 'dark' ? 'rgba(22, 101, 52, 0.25)' : '#f0fdf4',
                borderColor: scheme === 'dark' ? 'rgba(74, 222, 128, 0.15)' : '#bbf7d0',
              }],
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isUser ? '#e2f0e4' : colors.text },
          ]}
        >
          {message}
        </Text>
        {timestamp && (
          <Text style={[styles.time, {
            color: isUser ? 'rgba(226, 240, 228, 0.6)' : colors.textMuted,
          }]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
    paddingHorizontal: 4,
  },
  wrapperUser: { justifyContent: 'flex-end' },
  wrapperAi: { justifyContent: 'flex-start', alignItems: 'flex-end' },
  avatar: { fontSize: 28, marginBottom: 4 },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    borderBottomRightRadius: 6,
  },
  bubbleAi: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  text: {
    fontSize: 14.5,
    lineHeight: 21,
    fontWeight: '500',
  },
  time: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
