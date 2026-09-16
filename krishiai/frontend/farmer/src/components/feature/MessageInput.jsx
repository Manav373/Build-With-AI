import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Image as ImageIcon, X, MapPinOff, Mic, Square, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function MessageInput({ onSendMessage, disabled, onLocationChange }) {
  const { theme } = useTheme();
  const [msg, setMsg] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [notification, setNotification] = useState(null);
  const [focused, setFocused] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const isRecordingRef = useRef(false);
  const textareaRef = useRef(null);

  const showNotification = (text, type = 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Image preview
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [msg]);

  // Clean up any ongoing recording on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      if (streamRef.current) {
        try { streamRef.current.getTracks().forEach(t => t.stop()); } catch (e) {}
        streamRef.current = null;
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (isRecordingRef.current) {
      stopRecording();
      return;
    }
    if (!msg.trim() && !file) return;
    onSendMessage(msg, location, file, previewUrl);
    setMsg('');
    setFile(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const handleLocate = () => {
    if (location) {
      setLocation(null);
      onLocationChange?.(null);
      return;
    }

    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Reverse-geocode immediately so the chip and AI both get a human-readable location
        let city = null;
        let state = null;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            { headers: { 'User-Agent': 'KrishiAI/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            city = addr.district || addr.county || addr.city || addr.town || addr.village || addr.suburb || null;
            state = addr.state || null;
          }
        } catch (geoErr) {
          console.warn('Reverse geocode failed on frontend:', geoErr);
        }

        setLocation({ lat, lon, city, state });
        onLocationChange?.({ lat, lon, city, state });
        setLocating(false);
        const locationLabel = city && state ? `📍 ${city}, ${state}` : 'Location shared!';
        showNotification(locationLabel, 'success');
      },
      (err) => {
        let errorMsg = 'Could not get location. Please allow access.';
        if (err.code === 1) errorMsg = 'Permission denied. Please enable location.';
        else if (err.code === 2) errorMsg = 'Location unavailable at the moment.';

        showNotification(errorMsg, 'error');
        setLocating(false);
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const startRecording = async () => {
    try {
      accumulatedTranscriptRef.current = '';

      // 1. Request microphone stream with voice enhancement
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 2. Set up SpeechRecognition if supported
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;

          const langMap = {
            hi: 'hi-IN',
            gu: 'gu-IN',
            mr: 'mr-IN',
            en: 'en-IN',
          };
          recognition.lang = langMap[language] || 'en-IN';

          recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
              } else {
                interim += event.results[i][0].transcript;
              }
            }

            if (final.trim()) {
              accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + final.trim();
              setMsg(accumulatedTranscriptRef.current);
            } else if (interim.trim()) {
              const liveText = accumulatedTranscriptRef.current
                ? `${accumulatedTranscriptRef.current} ${interim}`
                : interim;
              setMsg(liveText);
            }
          };

          recognition.onerror = (e) => {
            console.warn('SpeechRecognition notice:', e.error);
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
              showNotification('Microphone access denied.', 'error');
            }
          };

          recognition.onend = () => {
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                recognition.start();
              } catch (err) {}
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('SpeechRecognition could not start:', recErr);
        }
      }

      // 3. Set up MediaRecorder as audio capture fallback
      try {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const capturedText = (accumulatedTranscriptRef.current || msg).trim();
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          if (streamRef.current) {
            try {
              streamRef.current.getTracks().forEach((track) => track.stop());
            } catch (e) {}
            streamRef.current = null;
          }

          if (capturedText) {
            onSendMessage?.(capturedText, location, file, previewUrl);
            setMsg('');
            setFile(null);
            showNotification('Voice message sent!', 'success');
          } else if (audioBlob.size > 0) {
            onSendMessage?.('', location, null, null, audioBlob);
            setMsg('');
            setFile(null);
            showNotification('Voice note sent to KrishiAI!', 'success');
          }
        };

        recorder.start();
      } catch (mediaErr) {
        console.warn('MediaRecorder could not start:', mediaErr);
      }

      isRecordingRef.current = true;
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      showNotification('Microphone access denied or unavailable.', 'error');
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    } else {
      const capturedText = (accumulatedTranscriptRef.current || msg).trim();
      if (capturedText) {
        onSendMessage?.(capturedText, location, file, previewUrl);
        setMsg('');
        setFile(null);
        showNotification('Voice message sent!', 'success');
      }
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((track) => track.stop());
        } catch (e) {}
        streamRef.current = null;
      }
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const listeningLabel = {
    hi: 'सुन रहा हूँ... बोलिए',
    gu: 'સાંભળી રહ્યો છું... બોલો',
    mr: 'ऐकत आहे... बोला',
    en: 'Listening... Speak now',
  }[language] || 'Listening... Speak now';

  const placeholderText = isRecording
    ? listeningLabel
    : {
        hi: 'कृषि AI से कुछ भी पूछें या 🎤 दबाकर बोलें...',
        gu: 'કૃષિ AI ને કંઈ પણ પૂછો અથવા 🎤 દબાવીને બોલો...',
        mr: 'कृषी AI ला काहीही विचारा किंवा 🎤 दाबून बोला...',
        en: 'Ask KrishiAI anything or click 🎤 to speak…',
      }[language] || 'Ask KrishiAI anything…';

  const canSend = (msg.trim() || file) && !disabled;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 relative">
      {/* Custom Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-[0.75rem] font-bold shadow-2xl z-[60] backdrop-blur-xl border whitespace-nowrap flex items-center gap-2 ${notification.type === 'success'
              ? theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : theme === 'light' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/20 border-red-500/40 text-red-400'
              }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {notification.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments row */}
      <AnimatePresence>
        {(file || location) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="flex flex-wrap items-center gap-2 px-1"
          >
            {previewUrl && (
              <div className={`relative group rounded-xl overflow-hidden border shadow-md w-[72px] h-[72px] ${theme === 'light' ? 'border-[var(--g)]/20' : 'border-[#86efac]/30'}`}>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 bg-black/70 rounded-full p-1">
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
            {!previewUrl && file && (
              <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full text-[0.77rem] font-medium ${
                theme === 'light' ? 'bg-[var(--g)]/5 border-[var(--glass-border)] text-[var(--g)]' : 'bg-[#166534]/15 border-white/10 text-[#86efac]'
              }`}>
                <ImageIcon size={13} />
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="ml-0.5 opacity-60 hover:opacity-100 cursor-pointer"><X size={13} /></button>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/35 text-amber-600 px-3 py-1.5 rounded-full text-[0.77rem] font-medium">
                <MapPin size={13} className="animate-pulse" />
                <span className="max-w-[180px] truncate">
                  {location.city && location.state
                    ? `${location.city}, ${location.state}`
                    : location.city
                    ? location.city
                    : `${location.lat.toFixed(4)}°N, ${location.lon.toFixed(4)}°E`}
                </span>
                {/* Direct Google Maps Link */}
                <a 
                  href={`https://www.google.com/maps?q=${location.lat},${location.lon}&t=k`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-amber-500/20 rounded-full transition-colors"
                  title="View on Google Maps (Satellite)"
                >
                  <ExternalLink size={12} className="text-amber-400" />
                </a>
                <button type="button" onClick={() => setLocation(null)} className="ml-0.5 opacity-60 hover:opacity-100 cursor-pointer"><X size={13} /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-5 sm:py-3.5 floating-input-pill">

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholderText}
          disabled={disabled}
          className={`flex-1 bg-transparent border-none text-[16px] sm:text-[0.93rem] outline-none resize-none leading-relaxed min-h-[24px] py-0.5 font-[inherit] ${
            theme === 'light' ? 'text-[var(--txt)] placeholder-[var(--mut)]/60' : 'text-[#e2f0e4] placeholder-[#86efac]/40'
          }`}
        />

        {/* Icon actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Image upload */}
          <label 
            className={`input-icon-btn h-8 w-8 sm:h-9 sm:w-9 ${disabled ? 'opacity-30 pointer-events-none' : ''}`} 
            title="Upload image"
            aria-label="Upload image"
          >
            <ImageIcon size={17} className="sm:w-[19px] sm:h-[19px]" />
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => setFile(e.target.files[0])} disabled={disabled} />
          </label>

          {/* Mic */}
          <button 
            type="button" 
            onClick={handleMicClick} 
            disabled={disabled}
            title={isRecording ? 'Stop recording & send' : 'Voice input'}
            aria-label={isRecording ? 'Stop voice recording' : 'Start voice input'}
            className={`input-icon-btn h-8 w-8 sm:h-9 sm:w-9 relative ${isRecording ? 'text-red-500 bg-red-500/15 ring-2 ring-red-400/50' : ''} ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
            {isRecording && (
              <motion.div
                layoutId="mic-pulse"
                className="absolute inset-0 rounded-full bg-red-500/30"
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {isRecording ? (
              <Square size={14} className="relative z-10 sm:w-4 sm:h-4 fill-current text-red-500" />
            ) : (
              <Mic size={17} className="relative z-10 sm:w-[19px] sm:h-[19px]" />
            )}

            {/* Visualizer animation when recording */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: '-50%', y: 10 }}
                  animate={{ opacity: 1, scale: 1, x: '-50%', y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: '-50%', y: 10 }}
                  className={`absolute -top-14 sm:-top-16 left-1/2 backdrop-blur-xl border px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex items-center gap-2 shadow-2xl z-50 pointer-events-none whitespace-nowrap ${
                    theme === 'light' ? 'bg-white/95 border-emerald-200' : 'bg-[#0a1a0d]/95 border-emerald-500/30'
                  }`}
                >
                  <div className="flex gap-0.5 h-3.5 sm:h-4 items-center">
                    {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 bg-emerald-500 rounded-full"
                        animate={{ height: ['25%', '100%', '25%'] }}
                        transition={{ duration: 0.6 + (i % 3) * 0.2, repeat: Infinity, delay: i * 0.08 }}
                      />
                    ))}
                  </div>
                  <span className={`text-[0.65rem] sm:text-[0.72rem] font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-[#86efac]'}`}>
                    {listeningLabel}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Location */}
          <button 
            type="button" 
            onClick={handleLocate} 
            disabled={disabled || locating}
            title="Share location"
            aria-label={location ? "Disable location sharing" : "Share current location"}
            className={`input-icon-btn h-8 w-8 sm:h-9 sm:w-9 relative ${location ? 'text-amber-400 bg-amber-500/10' : ''} ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
            {location ? <MapPinOff size={17} className="sm:w-[19px] sm:h-[19px]" /> : <MapPin size={17} className="sm:w-[19px] sm:h-[19px]" />}

            {/* Radar animation when locating */}
            <AnimatePresence>
              {locating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: '-50%', y: 10 }}
                  animate={{ opacity: 1, scale: 1, x: '-50%', y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: '-50%', y: 10 }}
                  className={`absolute -top-14 sm:-top-16 left-1/2 backdrop-blur-xl border px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex items-center gap-2 shadow-2xl z-50 pointer-events-none whitespace-nowrap ${
                    theme === 'light' ? 'bg-white/90 border-amber-500/20' : 'bg-[#0a1a0d]/95 border-amber-500/30'
                  }`}
                >
                  <div className="relative w-4 h-4 sm:w-5 sm:h-5">
                    <motion.div
                      className="absolute inset-0 rounded-full border border-amber-500/40"
                      animate={{ scale: [1, 2], opacity: [1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-amber-500/40"
                      animate={{ scale: [1, 2], opacity: [1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    />
                    <div className="absolute inset-[30%] rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  </div>
                  <span className="text-[0.6rem] sm:text-[0.65rem] font-bold text-amber-200">Locating...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Send */}
          <motion.button
            whileHover={canSend ? { scale: 1.05, y: -1 } : {}}
            whileTap={canSend ? { scale: 0.95, y: 0 } : {}}
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all ${canSend
              ? theme === 'light'
                ? 'bg-gradient-to-br from-[var(--g)] to-[var(--g2)] text-white shadow-[0_4px_15px_rgba(22,101,52,0.2)] cursor-pointer'
                : 'bg-gradient-to-br from-[#166534] to-[#15803d] text-white shadow-[0_4px_15px_rgba(22,101,52,0.4)] cursor-pointer'
              : theme === 'light'
                ? 'bg-[var(--g)]/10 text-[var(--mut)]/30 cursor-not-allowed'
                : 'bg-[#166534]/10 text-[#86efac]/30 cursor-not-allowed'
              }`}
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px] ml-0.5" />
          </motion.button>
        </div>
      </div>

      {/* Hint */}
      <p className={`text-center text-[0.62rem] mt-2 transition-colors ${
        theme === 'light' ? 'text-[var(--mut)]/60' : 'text-[#86efac]/40'
      }`}>
        KrishiAI can make mistakes — always verify critical farming decisions
      </p>
    </form>
  );
}
