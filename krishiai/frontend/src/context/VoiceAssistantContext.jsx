import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Vapi from "@vapi-ai/web";
import { useLocation } from './LocationContext';

const VoiceAssistantContext = createContext();

const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

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
                // Clear action after a short delay
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

            if (error?.error?.message) {
                console.error("🚨 SPECIFIC VAPI ERROR:", JSON.stringify(error.error.message, null, 2));
                alert("Vapi Error: " + JSON.stringify(error.error.message));
            }

            if (JSON.stringify(error).includes("Public Key")) {
                console.warn("⚠️ DIAGNOSTIC: The error mentions 'Public Key'. Please check if VITE_VAPI_PUBLIC_KEY is correct in your .env file.");
            }

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

    const startCall = useCallback((assistantId = DEFAULT_ASSISTANT_ID) => {
        // Diagnostic Check
        if (PUBLIC_KEY === assistantId) {
            console.error("🚨 VAPI CONFIG ERROR: Your Public Key and Assistant ID are identical!");
            console.error("Public Key (from .env):", PUBLIC_KEY);
            console.error("Assistant ID (used in startCall):", assistantId);
            console.warn("Please ensure you use the PUBLIC KEY (from Vapi Account Settings) in your .env, and the ASSISTANT ID (from Assistant Settings) in startCall().");
            alert("Vapi Configuration Error: Public Key and Assistant ID are identical. Check console for details.");
            return;
        }

        if (!assistantId) {
            console.error("🚨 VAPI ERROR: No Assistant ID provided!");
            alert("Vapi Error: Assistant ID is missing. Check your .env file.");
            return;
        }

        setCallStatus("loading");

        // Construct dynamic context
        const locationStr = location?.district ? `${location.district}, ${location.state}` : "Gujarat, India";
        const lat = location?.lat || null;
        const lon = location?.lon || null;

        vapi.start(assistantId, {
            variableValues: {
                userLocation: locationStr || "India",
                latitude: lat ? String(lat) : "",
                longitude: lon ? String(lon) : ""
            }
        });
    }, [PUBLIC_KEY, DEFAULT_ASSISTANT_ID, location]);

    const stopCall = useCallback(() => {
        vapi.stop();
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
        throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
    }
    return context;
};
