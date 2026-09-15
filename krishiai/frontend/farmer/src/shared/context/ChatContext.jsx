import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { translations } from '@farmer/utils/translations/index';
import { sendChatQuery, sendImageQuery, sendVoiceQuery } from '@shared/services/api';
import { useSafeAuth } from '@shared/hooks/useSafeAuth';
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
    try {
      const raw = localStorage.getItem(PIN_KEY);
      if (!raw) return new Set();
      const p = JSON.parse(raw);
      return new Set(Array.isArray(p) ? p : []);
    } catch {
      return new Set();
    }
  });

  const { language, setLanguage } = useLanguage();
  const [isTyping, setIsTyping] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showMandiMap, setShowMandiMap] = useState(false);
  const [showPriceChart, setShowPriceChart] = useState(false);

  // Sync sessions with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
    } catch (e) {
      console.warn('Could not save chat history to localStorage', e);
    }
  }, [chatSessions]);

  // Sync pinned messages as Array for proper JSON storage
  useEffect(() => {
    try {
      const arr = Array.from(pinnedIds || []);
      localStorage.setItem(PIN_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Could not save pinned messages', e);
    }
  }, [pinnedIds]);

  const currentSession = useMemo(() => {
    return chatSessions.find(s => s.id === currentChatId) || chatSessions[0];
  }, [chatSessions, currentChatId]);

  const messages = useMemo(() => {
    return currentSession ? currentSession.messages : [LANG_SELECTION_MESSAGE];
  }, [currentSession]);

  const handleNewChat = () => {
    const newChat = createNewChat(language);
    setChatSessions(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
  };

  const handleDeleteChat = (id, e) => {
    if (e) e.stopPropagation();
    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const fresh = createNewChat(language);
        setCurrentChatId(fresh.id);
        return [fresh];
      }
      if (currentChatId === id) {
        setCurrentChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameChat = (id, newTitle) => {
    setChatSessions(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, title: newTitle, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const updateChatMessages = (chatId, updater) => {
    setChatSessions(prev => prev.map(session => {
      if (session.id === chatId) {
        const nextMsgs = typeof updater === 'function' ? updater(session.messages) : updater;
        let title = session.title;
        // Auto-generate title from first user message if default
        if (title === 'New Conversation' || title === 'નવી વાતચીત' || title === 'नई बातचीत') {
          const firstUserMsg = nextMsgs.find(m => m.sender === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.text.slice(0, 25) + (firstUserMsg.text.length > 25 ? '...' : '');
          }
        }
        return {
          ...session,
          title,
          messages: nextMsgs,
          updatedAt: Date.now()
        };
      }
      return session;
    }));
  };

  const addMessage = (chatId, msg) => {
    updateChatMessages(chatId, prev => [...prev, msg]);
  };

  const handlePin = (msgId) => {
    setPinnedIds(prev => {
      const next = new Set(prev instanceof Set ? prev : (Array.isArray(prev) ? prev : []));
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const handleClearHistory = () => {
    updateChatMessages(currentChatId, [LANG_SELECTION_MESSAGE]);
  };

  const processMessage = async (text, image = null, audioBlob = null) => {
    if (!text && !image && !audioBlob) return;
    
    // Capture the target chatId for this message process
    const targetChatId = currentChatIdRef.current;
    
    // Create and add user message immediately
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text || (image ? '📷 Image uploaded' : '🎤 Voice message'),
      timestamp: Date.now(),
      imagePreview: image ? URL.createObjectURL(image) : null,
      isVoice: !!audioBlob
    };
    
    addMessage(targetChatId, userMsg);
    setIsTyping(true);

    try {
      let response;
      const langInstruction = LANG_INSTRUCTIONS[language] || '';
      const promptWithLang = (text || 'Analyze this') + langInstruction;
      const token = await getToken();

      if (image) {
        response = await sendImageQuery(promptWithLang, image, BROWSER_PHONE_ID, token);
      } else if (audioBlob) {
        response = await sendVoiceQuery(audioBlob, BROWSER_PHONE_ID, token);
      } else {
        response = await sendChatQuery(promptWithLang, BROWSER_PHONE_ID, token);
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply || response.text || response.error || 'Sorry, I could not process your request.',
        timestamp: Date.now(),
        groundingMetadata: response.groundingMetadata || null,
        suggestedActions: response.suggestedActions || null
      };

      addMessage(targetChatId, botMsg);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Network error. Please try again.',
        timestamp: Date.now(),
        isError: true
      };
      addMessage(targetChatId, errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      chatSessions,
      currentChatId,
      messages,
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
  if (!context) {
    return {
      messages: [LANG_SELECTION_MESSAGE],
      pinnedIds: new Set(),
      language: 'en',
      setLanguage: () => {},
      handleSelectChat: () => {},
      addMessage: () => {},
      updateCurrentChatMessages: () => {},
      handlePin: () => {},
      handleClearHistory: () => {},
      showPriceChart: false,
      setShowPriceChart: () => {},
      showMandiMap: false,
      setShowMandiMap: () => {},
      isTyping: false,
      processMessage: async () => {},
      userLocation: null,
      setUserLocation: () => {},
      chatSessions: [],
      currentChatId: '',
      handleNewChat: () => {},
      handleDeleteChat: () => {},
      handleRenameChat: () => {}
    };
  }
  return context;
};

export default ChatContext;
