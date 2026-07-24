import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { translations } from '../utils/translations/index';
import { sendChatQuery, sendImageQuery, sendVoiceQuery } from '../services/api';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { useLanguage } from './LanguageContext';

const ChatContext = createContext();

const STORAGE_KEY = 'krishiai_chat_history_v2';
const PIN_KEY = 'krishiai_pinned_msgs';

// Unique ID for the browser session to track the conversation on backend
const BROWSER_PHONE_ID = 'web_' + Math.floor(Math.random() * 100000);

const LANG_SELECTION_MESSAGE = {
  id: 'lang_selection',
  sender: 'ai',
  timestamp: Date.now(),
  text: 'Namaste! Please select your preferred language to continue:',
  isLanguageSelection: true
};

const LANG_INSTRUCTIONS = {
  en: '',
  hi: ' Please respond in Hindi (हिंदी में जवाब दें).',
  gu: ' Please respond in Gujarati (ગુજરાતીમાં જવાબ આપો).',
  mr: ' Please respond in Marathi (मराठीत उत्तर द्या).',
};

function createNewChat(language = 'en') {
  return {
    id: Date.now().toString(),
    title: translations[language]?.chat?.newConversation || 'New Conversation',
    messages: [LANG_SELECTION_MESSAGE],
    updatedAt: Date.now()
  };
}

export const ChatProvider = ({ children }) => {
  const { getToken } = useSafeAuth();
  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && Array.isArray(data) && data.length > 0) return data;
      return [createNewChat()];
    } catch {
      return [createNewChat()];
    }
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    return chatSessions[0]?.id || '';
  });

  // Use a ref to track currentChatId for async operations to avoid race conditions
  const currentChatIdRef = useRef(currentChatId);
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(PIN_KEY)) || []); } catch { return new Set(); }
  });

  const { language, setLanguage } = useLanguage();

  const [isTyping, setIsTyping] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showMandiMap, setShowMandiMap] = useState(false);
  const [showPriceChart, setShowPriceChart] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem(PIN_KEY, JSON.stringify([...pinnedIds]));
  }, [pinnedIds]);

  const currentChat = useMemo(() => {
    return chatSessions.find(c => c.id === currentChatId) || chatSessions[0];
  }, [chatSessions, currentChatId]);

  const handleNewChat = () => {
    const newChat = createNewChat(language);
    setChatSessions(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
  };

  const handleDeleteChat = (id) => {
    setChatSessions(prev => {
      const next = prev.filter(c => c.id !== id);
      if (next.length === 0) {
        const nc = createNewChat(language);
        return [nc];
      }
      if (currentChatId === id) setCurrentChatId(next[0].id);
      return next;
    });
  };

  const handleRenameChat = (id, newTitle) => {
    setChatSessions(prev => prev.map(c =>
      c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    ));
  };

  // Enhanced messages updater that can target a specific chatId
  const updateChatMessages = (chatId, updaterFn) => {
    const targetId = chatId || currentChatIdRef.current;

    setChatSessions(prev => prev.map(c => {
      if (c.id !== targetId) return c;
      const newMessages = updaterFn(c.messages);

      let newTitle = c.title;
      const isDefaultTitle = Object.values(translations).some(t => t.chat.newConversation === c.title) || c.title === 'New Conversation';

      if (isDefaultTitle) {
        const firstUserMsg = newMessages.find(m => m.sender === 'user');
        if (firstUserMsg) {
          const text = firstUserMsg.isImage ? "Image query" : firstUserMsg.text;
          newTitle = text.length > 25 ? text.substring(0, 25) + '...' : text;
        }
      }

      return { ...c, messages: newMessages, updatedAt: Date.now(), title: newTitle };
    }));
  };

  const addMessage = (sender, text, isImage = false, previewUrl = null, location = null, targetChatId = null) => {
    const msgId = Date.now();
    updateChatMessages(targetChatId, prev => [...prev, {
      id: msgId,
      sender,
      text,
      isImage,
      previewUrl,
      location,
      timestamp: Date.now()
    }]);
    return msgId;
  };

  const processMessage = async (text, locationData = null, file = null, previewUrl = null, audioBlob = null, targetChatId = null) => {
    // Determine the chat ID to use — use provided targetChatId or fall back to current
    const activeChatId = targetChatId || currentChatIdRef.current;

    const effectiveLocation = locationData || userLocation || null;
    const langSuffix = LANG_INSTRUCTIONS[language] || '';
    const fullText = (text || '') + langSuffix;

    if (audioBlob) {
      addMessage('user', '🎤 Voice Message', false, null, effectiveLocation, activeChatId);
    } else if (file) {
      addMessage('user', `Uploaded: ${file.name}`, true, previewUrl, effectiveLocation, activeChatId);
    } else {
      addMessage('user', text, false, null, effectiveLocation, activeChatId);
    }

    setIsTyping(true);

    try {
      let reply = '';

      // Get history for the specific chat
      const chat = chatSessions.find(c => c.id === activeChatId) || currentChat;
      const currentMessages = chat?.messages || [];
      const token = await getToken();

      if (audioBlob) {
        const res = await sendVoiceQuery(
          BROWSER_PHONE_ID, audioBlob,
          effectiveLocation?.lat, effectiveLocation?.lon,
          currentMessages,
          effectiveLocation?.city || null,
          effectiveLocation?.state || null,
          token,
          effectiveLocation?.village || null,
          effectiveLocation?.taluka || null
        );
        reply = res.reply;
        if (res.transcription) {
          updateChatMessages(activeChatId, prev => prev.map(m =>
            (m.sender === 'user' && m.text === '🎤 Voice Message') ? { ...m, text: `🎤 ${res.transcription}` } : m
          ));
        }
      } else if (file) {
        const res = await sendImageQuery(BROWSER_PHONE_ID, file, language, token);
        reply = res.reply;
      } else {
        const res = await sendChatQuery(
          BROWSER_PHONE_ID, fullText,
          effectiveLocation?.lat || null, effectiveLocation?.lon || null,
          currentMessages,
          effectiveLocation?.city || null,
          effectiveLocation?.state || null,
          token,
          effectiveLocation?.village || null,
          effectiveLocation?.taluka || null
        );
        reply = res.reply;
      }
      addMessage('ai', reply, false, null, null, activeChatId);
    } catch (err) {
      console.error("Chat Process Error:", err);
      addMessage('ai', translations[language]?.chat?.connectionError || 'Connection Error', false, null, null, activeChatId);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePin = (msg) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(msg.id)) next.delete(msg.id);
      else next.add(msg.id);
      return next;
    });
  };

  const handleClearHistory = () => {
    updateChatMessages(currentChatId, () => [LANG_SELECTION_MESSAGE]);
  };

  return (
    <ChatContext.Provider value={{
      chatSessions,
      currentChatId,
      currentChat,
      messages: currentChat?.messages || [],
      pinnedIds,
      language,
      setLanguage,
      isTyping,
      userLocation,
      setUserLocation,
      processMessage,
      handleNewChat,
      handleSelectChat,
      handleDeleteChat,
      handleRenameChat,
      addMessage,
      updateCurrentChatMessages: (updater) => updateChatMessages(currentChatId, updater),
      handlePin,
      handleClearHistory,
      showMandiMap,
      setShowMandiMap,
      showPriceChart,
      setShowPriceChart
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
