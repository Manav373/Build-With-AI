import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Vapi from "@vapi-ai/web";
import { useLocation } from './LocationContext';

const VoiceAssistantContext = createContext();

const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY || "dummy_key");

export const VoiceAssistantProvider = ({ children }) => {
    const [callStatus, setCallStatus] = useState("inactive"); // inactive, loading, active
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [messages, setMessages] = useState([]); // { role, text, id }
    const [currentAction, setCurrentAction] = useState(null); // null, or { name: string, status: 'calling'|'completed' }
    const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    const DEFAULT_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;
    const { location } = useLocation();

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus("active");
            setMessages([]);
            setCurrentAction(null);
            console.log("🔵 VAPI: Call started successfully");
        };

        const onCallEnd = () => {
            setCallStatus("inactive");
            setTranscript("");
            setCurrentAction(null);
            console.log("🔴 VAPI: Call ended");
        };

        const onSpeechStart = () => {
            console.log("🔊 VAPI: Assistant started speaking");
        };

        const onVolumeLevel = (level) => {
            setVolumeLevel(level);
        };

        const onMessage = (message) => {
            if (message.type === "transcript") {
                const { role, transcript: text, transcriptType } = message;
                if (transcriptType === "partial") {
                    setTranscript(text);
                } else {
                    setTranscript("");
                    setMessages(prev => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg && lastMsg.text === text && lastMsg.role === role) return prev;
                        return [...prev, { role, text, id: Date.now() }];
                    });
                }
            } else if (message.type === "tool-calls") {
                const toolCall = message.toolCalls[0];
                if (toolCall) {
                    setCurrentAction({
                        name: toolCall.function.name,
                        status: 'calling',
                        args: toolCall.function.arguments
                    });
                }
            } else if (message.type === "tool-call-result") {
                setCurrentAction(prev => prev ? { ...prev, status: 'completed' } : null);
                setTimeout(() => setCurrentAction(null), 2000);
            }
        };

        const onError = (error) => {
            console.error("❌ Vapi Error Details:", {
                message: error?.message,
                apiError: error?.error?.message,
                fullApiError: error?.error,
                json: JSON.stringify(error, null, 2)
            });

            setCallStatus("inactive");
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("volume-level", onVolumeLevel);
        vapi.on("message", onMessage);
        vapi.on("error", onError);

        return () => {
            vapi.removeAllListeners();
        };
    }, []);

    const startCall = useCallback(async (assistantId = DEFAULT_ASSISTANT_ID, lang = "en") => {
        if (!PUBLIC_KEY) {
            alert("Vapi public key not configured in .env file (VITE_VAPI_PUBLIC_KEY)");
            return;
        }

        const idToUse = assistantId || DEFAULT_ASSISTANT_ID;
        if (!idToUse) {
            alert("No Voice Assistant ID provided or configured.");
            return;
        }

        try {
            setCallStatus("loading");
            let firstMessage = "Namaste! I am Krishi AI, your personal farming assistant. How can I help you today?";
            let sysPromptAddition = "";
            if (lang === "gu") {
                firstMessage = "નમસ્તે! હું કૃષિ AI છું, તમારો ખેતી સહાયક. હું તમને આજે કેવી રીતે મદદ કરી શકું?";
                sysPromptAddition = " You must speak and respond strictly in Gujarati.";
            } else if (lang === "hi") {
                firstMessage = "नमस्ते! मैं कृषि AI हूँ, आपका खेती सहायक। आज मैं आपकी क्या मदद कर सकता हूँ?";
                sysPromptAddition = " You must speak and respond strictly in Hindi.";
            }

            const district = location?.district || "India";
            const state = location?.state || "";
            const locContext = ` The farmer is currently located in ${district}, ${state}.`;

            await vapi.start(idToUse, {
                firstMessage: firstMessage,
                model: {
                    messages: [
                        {
                            role: "system",
                            content: locContext + sysPromptAddition
                        }
                    ]
                }
            });
        } catch (err) {
            console.error("Failed to start Vapi call:", err);
            setCallStatus("inactive");
            alert("Could not start voice call. Check console for details.");
        }
    }, [DEFAULT_ASSISTANT_ID, PUBLIC_KEY, location]);

    const stopCall = useCallback(() => {
        try {
            vapi.stop();
        } catch (err) {
            console.error("Failed to stop Vapi call:", err);
        }
        setCallStatus("inactive");
    }, []);

    const toggleMute = useCallback(() => {
        const nextMute = !isMuted;
        setIsMuted(nextMute);
        vapi.setMuted(nextMute);
    }, [isMuted]);

    return (
        <VoiceAssistantContext.Provider value={{
            callStatus,
            isMuted,
            volumeLevel,
            transcript,
            messages,
            currentAction,
            startCall,
            stopCall,
            toggleMute
        }}>
            {children}
        </VoiceAssistantContext.Provider>
    );
};

export const useVoiceAssistant = () => {
    const context = useContext(VoiceAssistantContext);
    if (!context) {
        return {
            callStatus: "inactive",
            isMuted: false,
            volumeLevel: 0,
            transcript: "",
            messages: [],
            currentAction: null,
            startCall: async () => {},
            stopCall: () => {},
            toggleMute: () => {}
        };
    }
    return context;
};

export default VoiceAssistantContext;
