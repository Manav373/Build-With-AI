import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from './LocationContext';
import { sendChatQuery } from '../services/api';

const VoiceAssistantContext = createContext();

// Clean markdown text for natural speech synthesis
function cleanSpeechText(text) {
  if (!text) return '';
  return text
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown image tags
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove raw URLs
    .replace(/https?:\/\/\S+/g, '')
    // Replace markdown table separators and pipes
    .replace(/\|[-:\s|]+\|/g, ' ')
    .replace(/\|/g, ', ')
    // Remove bold/italic markers, headers, and code ticks
    .replace(/[*_#`~>]/g, '')
    // Normalize bullet points to conversational pauses
    .replace(/^\s*[-•*]\s+/gm, '. ')
    // Collapse multiple punctuation/spaces/newlines
    .replace(/\n+/g, '. ')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

export const VoiceAssistantProvider = ({ children }) => {
  const [callStatus, setCallStatus] = useState('inactive'); // 'inactive' | 'loading' | 'active'
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]); // { role, text, id }
  const [currentAction, setCurrentAction] = useState(null); // { name: string, status: 'calling'|'completed' }
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { location } = useLocation();

  // Internal refs
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const isMutedRef = useRef(false);
  const callStatusRef = useRef('inactive');
  const messagesRef = useRef([]);
  const speakingAnimRef = useRef(null);
  const activeLanguageRef = useRef('en');

  // Keep refs updated with current state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Clean up all resources on unmount
  useEffect(() => {
    return () => {
      cleanupAudioAndSpeech();
    };
  }, []);

  const currentUtteranceRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Pre-load available browser voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const cleanupAudioAndSpeech = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      } catch (e) {
        // ignore
      }
      audioPlayerRef.current = null;
    }

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    currentUtteranceRef.current = null;
    if (typeof window !== 'undefined') window.__activeUtterance = null;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (speakingAnimRef.current) {
      clearInterval(speakingAnimRef.current);
      speakingAnimRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }

    setVolumeLevel(0);
    setIsSpeaking(false);
  };

  // Browser Web Speech fallback with Chrome garbage-collection & pause fix
  const fallbackBrowserSpeech = useCallback((spokenText, lang = 'en') => {
    if (!('speechSynthesis' in window) || !spokenText) {
      setIsSpeaking(false);
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      // Retain utterance in ref to prevent Chrome V8 garbage-collection silent cancellation
      currentUtteranceRef.current = utterance;
      if (typeof window !== 'undefined') window.__activeUtterance = utterance;

      const langCodeMap = {
        hi: 'hi-IN',
        gu: 'gu-IN',
        mr: 'mr-IN',
        en: 'en-IN'
      };
      utterance.lang = langCodeMap[lang] || 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetLang = utterance.lang.toLowerCase();
        const voice = voices.find(v => v.lang.toLowerCase() === targetLang || v.lang.toLowerCase().startsWith(targetLang.split('-')[0])) || voices[0];
        if (voice) utterance.voice = voice;
      }

      setIsSpeaking(true);

      if (speakingAnimRef.current) clearInterval(speakingAnimRef.current);
      speakingAnimRef.current = setInterval(() => {
        setVolumeLevel(0.15 + Math.random() * 0.35);
      }, 120);

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setVolumeLevel(0);
        currentUtteranceRef.current = null;
        if (typeof window !== 'undefined') window.__activeUtterance = null;
        if (speakingAnimRef.current) {
          clearInterval(speakingAnimRef.current);
          speakingAnimRef.current = null;
        }
        // Resume mic listening if call still active
        if (callStatusRef.current === 'active' && recognitionRef.current && !isMutedRef.current) {
          try { recognitionRef.current.start(); } catch (e) {}
        }
      };

      utterance.onerror = (e) => {
        console.warn('[VoiceAssistant] Browser speech synthesis event:', e.error);
        setIsSpeaking(false);
        setVolumeLevel(0);
        currentUtteranceRef.current = null;
        if (typeof window !== 'undefined') window.__activeUtterance = null;
        if (speakingAnimRef.current) {
          clearInterval(speakingAnimRef.current);
          speakingAnimRef.current = null;
        }
      };

      window.speechSynthesis.cancel();
      setTimeout(() => {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      }, 60);

    } catch (err) {
      console.warn('[VoiceAssistant] Browser speech failed:', err);
      setIsSpeaking(false);
    }
  }, []);

  // Speaks text aloud using Edge Neural Voice with fallback to Web Speech
  const speakText = useCallback(async (text, lang = 'en') => {
    if (!text) return;

    // Clean text and take conversational summary
    const clean = cleanSpeechText(text);
    if (!clean) return;
    const spokenText = clean.length > 380 ? clean.slice(0, 360) + '... Please view the screen for complete details.' : clean;

    // 1. Try Backend Neural TTS first (real studio quality human voice)
    try {
      let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

      const response = await fetch(`${baseUrl}/api/web/tts?lang=${lang}&text=${encodeURIComponent(spokenText)}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('audio') || contentType.includes('mpeg')) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;

          audio.onplay = () => {
            setIsSpeaking(true);
            if (speakingAnimRef.current) clearInterval(speakingAnimRef.current);
            speakingAnimRef.current = setInterval(() => {
              setVolumeLevel(0.15 + Math.random() * 0.35);
            }, 120);
          };

          audio.onended = () => {
            setIsSpeaking(false);
            setVolumeLevel(0);
            URL.revokeObjectURL(audioUrl);
            if (speakingAnimRef.current) {
              clearInterval(speakingAnimRef.current);
              speakingAnimRef.current = null;
            }
            if (callStatusRef.current === 'active' && recognitionRef.current && !isMutedRef.current) {
              try { recognitionRef.current.start(); } catch (e) {}
            }
          };

          audio.onerror = () => {
            console.warn('[VoiceAssistant] Neural audio playback failed, falling back to browser speech.');
            fallbackBrowserSpeech(spokenText, lang);
          };

          await audio.play();
          return;
        }
      }
    } catch (ttsErr) {
      console.warn('[VoiceAssistant] Neural TTS endpoint not reachable:', ttsErr);
    }

    // 2. Fallback to resilient Browser SpeechSynthesis
    fallbackBrowserSpeech(spokenText, lang);
  }, [fallbackBrowserSpeech]);

  // Executes query against the full-website Groq agent backend
  const executeQuery = useCallback(async (queryText, lang = activeLanguageRef.current) => {
    if (!queryText || !queryText.trim()) return;

    const trimmedQuery = queryText.trim();
    const userMsgId = Date.now();

    // Pause recognition while assistant processes & speaks
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    setMessages(prev => [...prev, { role: 'user', text: trimmedQuery, id: userMsgId }]);
    setTranscript('');

    // Determine relevant action pill
    let toolLabel = 'Consulting KrishiAI Agent';
    const lower = trimmedQuery.toLowerCase();
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature') || lower.includes('mausam') || lower.includes('barish')) {
      toolLabel = 'Fetching Local Weather Data';
    } else if (lower.includes('price') || lower.includes('mandi') || lower.includes('rate') || lower.includes('market') || lower.includes('bhav')) {
      toolLabel = 'Scanning APMC Mandi Rates';
    } else if (lower.includes('scheme') || lower.includes('subsidy') || lower.includes('yojana')) {
      toolLabel = 'Checking Gov Schemes';
    } else if (lower.includes('soil') || lower.includes('fertilizer') || lower.includes('mitti')) {
      toolLabel = 'Analyzing Soil Health';
    } else if (lower.includes('pest') || lower.includes('disease') || lower.includes('keeda')) {
      toolLabel = 'Checking Pest & Disease Database';
    }

    setCurrentAction({ name: toolLabel, status: 'calling' });

    try {
      const lat = location?.lat || null;
      const lon = location?.lon || null;
      const city = location?.city || location?.district || 'India';
      const state = location?.state || '';
      const district = location?.district || '';

      // Prepare conversation history
      const historyList = messagesRef.current.slice(-6).map(m => ({
        sender: m.role === 'user' ? 'user' : 'ai',
        text: m.text
      }));

      // Call the Groq backend chat endpoint which executes all agricultural tools
      const response = await sendChatQuery(
        'voice_user',
        trimmedQuery,
        lat,
        lon,
        historyList,
        city,
        state,
        null,
        district
      );

      const reply = response?.reply || "I'm sorry, I couldn't fetch that information right now. Please try again.";

      setCurrentAction({ name: toolLabel, status: 'completed' });
      setTimeout(() => setCurrentAction(null), 2500);

      setMessages(prev => [...prev, { role: 'assistant', text: reply, id: Date.now() + 1 }]);

      // Speak answer out loud
      speakText(reply, lang);

    } catch (err) {
      console.error('[VoiceAssistant] Error querying Groq agent:', err);
      setCurrentAction({ name: 'System Error', status: 'completed' });
      setTimeout(() => setCurrentAction(null), 2000);

      const fallbackReply = "Sorry, I had trouble contacting the farming intelligence server. Please check your internet connection.";
      setMessages(prev => [...prev, { role: 'assistant', text: fallbackReply, id: Date.now() + 1 }]);
      speakText(fallbackReply, lang);
    }
  }, [location, speakText]);

  // Setup Web Audio Analyser for live volume pulse
  const setupAudioAnalyser = async (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (callStatusRef.current !== 'active') return;

        if (isMutedRef.current) {
          setVolumeLevel(0);
        } else {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Normalize to 0 - 1 range
          const norm = Math.min(1, Math.max(0, avg / 128));
          setVolumeLevel(norm);
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('[VoiceAssistant] Audio visualizer could not start:', e);
    }
  };

  // Start the voice call session
  const startCall = useCallback(async (assistantId = null, lang = 'en') => {
    activeLanguageRef.current = lang;
    setCallStatus('loading');
    setMessages([]);
    setTranscript('');
    setCurrentAction(null);

    // Initial greeting in farmer's language
    let welcomeGreeting = "Namaste! I am Krishi AI, your agricultural assistant with real-time weather and mandi access. How can I help you today?";
    if (lang === 'hi') {
      welcomeGreeting = "नमस्ते! मैं कृषि AI हूँ, आपका खेती सहायक। आप मुझसे मौसम, मंडी भाव या फसल सलाह पूछ सकते हैं।";
    } else if (lang === 'gu') {
      welcomeGreeting = "નમસ્તે! હું કૃષિ AI છું. તમે હવામાન, બજાર ભાવ અથવા પાક વિશે પૂછી શકો છો.";
    } else if (lang === 'mr') {
      welcomeGreeting = "नमस्कार! मी कृषी AI आहे. तुम्ही मला हवामान, बाजारभाव किंवा पिकांबद्दल विचारू शकता.";
    }

    try {
      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // 2. Start Audio Visualizer
      await setupAudioAnalyser(stream);

      // 3. Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn('[VoiceAssistant] Web SpeechRecognition not supported in this browser.');
      } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        const langCodes = {
          hi: 'hi-IN',
          gu: 'gu-IN',
          mr: 'mr-IN',
          en: 'en-IN'
        };
        recognition.lang = langCodes[lang] || 'en-IN';

        recognition.onresult = (event) => {
          if (isMutedRef.current) return;

          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (interim) {
            setTranscript(interim);
          }

          if (final.trim()) {
            executeQuery(final.trim(), lang);
          }
        };

        recognition.onerror = (e) => {
          console.warn('[VoiceAssistant] Speech recognition error:', e.error);
        };

        recognition.onend = () => {
          // Restart recognition if call is still active and not speaking
          if (callStatusRef.current === 'active' && !isMutedRef.current) {
            try {
              recognition.start();
            } catch (err) {
              // ignore
            }
          }
        };

        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {
          // ignore
        }
      }

      setCallStatus('active');
      setMessages([{ role: 'assistant', text: welcomeGreeting, id: Date.now() }]);
      speakText(welcomeGreeting, lang);

    } catch (err) {
      console.error('[VoiceAssistant] Failed to access microphone or start speech:', err);
      setCallStatus('inactive');
      alert('Microphone access is required to talk to KrishiAI Voice Assistant. Please allow microphone permissions.');
    }
  }, [executeQuery, speakText]);

  // Stop the call session
  const stopCall = useCallback(() => {
    cleanupAudioAndSpeech();
    setCallStatus('inactive');
    setCurrentAction(null);
    setTranscript('');
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = !next;
        });
      }
      return next;
    });
  }, []);

  // Direct programmatic message submission (e.g. from command suggestions)
  const sendVoiceText = useCallback((text, lang = activeLanguageRef.current) => {
    if (callStatusRef.current !== 'active') {
      startCall(null, lang).then(() => {
        setTimeout(() => {
          executeQuery(text, lang);
        }, 800);
      });
    } else {
      executeQuery(text, lang);
    }
  }, [startCall, executeQuery]);

  return (
    <VoiceAssistantContext.Provider value={{
      callStatus,
      isMuted,
      volumeLevel,
      transcript,
      messages,
      currentAction,
      isSpeaking,
      startCall,
      stopCall,
      toggleMute,
      sendVoiceText
    }}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    return {
      callStatus: 'inactive',
      isMuted: false,
      volumeLevel: 0,
      transcript: '',
      messages: [],
      currentAction: null,
      isSpeaking: false,
      startCall: async () => {},
      stopCall: () => {},
      toggleMute: () => {},
      sendVoiceText: () => {}
    };
  }
  return context;
};

export default VoiceAssistantContext;
