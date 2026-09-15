import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ArrowRight, CheckCheck } from 'lucide-react';
import { useTheme } from '@shared/context/ThemeContext';

export default function FeaturePhone({ messages = [], className = "" }) {
  const [displayedItems, setDisplayedItems] = useState([]);
  const { theme } = useTheme();

  const chatMessages = messages.length > 0 ? messages : [
    { type: 'user', content: "What is the MSP of Wheat today?" },
    { type: 'bot', content: "Namaste! 🙏 Today the MSP for wheat is ₹2,275 per quintal. The local Mandi rate in your area is trending slightly higher at ₹2,350. Should I find buyers?" }
  ];

  useEffect(() => {
    const withIds = chatMessages.map((msg, idx) => ({
      ...msg,
      id: `${msg.content}-${idx}-${Math.random()}`
    }));
    setDisplayedItems(withIds);
  }, [messages]);

  return (
    <div className={`relative ${className}`}>
      <div className={`relative p-[8px] rounded-[3.5rem] shadow-xl transform-gpu transition-colors duration-500 ${
        theme === 'light' 
          ? 'bg-gradient-to-b from-emerald-100 via-white to-gray-200 shadow-emerald-900/5' 
          : 'bg-gradient-to-b from-[#4ade80]/20 via-[#166534]/15 to-[#050e07]'
      }`}>

        <div className={`absolute right-[-4px] top-32 w-1 h-16 rounded-r-md border-y border-r transition-colors ${
          theme === 'light' ? 'bg-slate-300 border-slate-400' : 'bg-[#14532d] border-[#4ade80]/10'
        }`}></div>
        <div className={`absolute left-[-4px] top-28 w-1 h-12 rounded-l-md border-y border-l transition-colors ${
          theme === 'light' ? 'bg-slate-300 border-slate-400' : 'bg-[#14532d] border-[#4ade80]/10'
        }`}></div>
        <div className={`absolute left-[-4px] top-44 w-1 h-12 rounded-l-md border-y border-l transition-colors ${
          theme === 'light' ? 'bg-slate-300 border-slate-400' : 'bg-[#14532d] border-[#4ade80]/10'
        }`}></div>

        <div className={`w-[320px] h-[640px] rounded-[3rem] relative flex flex-col isolation-isolate border overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] transform-gpu transition-all duration-500 ${
          theme === 'light' 
            ? 'bg-white border-slate-200' 
            : 'bg-[#000a04] border-[#0f3d20] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]'
        }`}>
          
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-between px-2.5 shadow-md border border-[#222]">
            <div className="w-3 h-3 rounded-full bg-[#111] border border-[#000]"></div>
            <motion.div animate={{ opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_5px_rgba(74,222,128,1)]"></motion.div>
          </div>

          <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4ade80 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

          <div className={`relative z-10 flex items-center gap-3 pt-14 pb-4 mb-2 border-b transition-colors px-5 ${
            theme === 'light' ? 'bg-white border-emerald-100' : 'bg-[#0a1a0d] border-[#86efac]/10'
          }`}>
            <div className="relative text-[#4ade80]">
              <Bot size={28} />
              <span className={`absolute bottom-0 -right-1 w-2.5 h-2.5 bg-[#4ade80] border-2 rounded-full ${theme === 'light' ? 'border-white' : 'border-[#0a1a0d]'}`}></span>
            </div>
            <div className="flex flex-col">
              <span className={`font-outfit font-black text-xl leading-none tracking-tight transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>KrishiAI Online</span>
              <span className="text-[12px] font-medium text-[#4ade80] mt-1.5 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] block"></span> AI Assistant Active</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-5 px-4 pb-6 overflow-hidden relative z-10">
            <AnimatePresence mode="popLayout">
              {displayedItems.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -15 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: idx * 0.1 }}
                  className={`
                    relative p-4 text-[15px] leading-relaxed max-w-[88%] shadow-md whitespace-pre-wrap font-medium pb-5
                    transform-gpu will-change-transform transition-all
                    ${msg.type === 'user'
                      ? "bg-gradient-to-br from-[#166534] to-[#14532d] text-white rounded-[1.2rem] rounded-tr-sm self-end border border-[#4ade80]/20"
                      : theme === 'light'
                        ? "bg-emerald-50 text-slate-800 rounded-[1.2rem] rounded-tl-sm self-start border border-emerald-100"
                        : "bg-[#0a1a0d] text-[#e2f0e4] rounded-[1.2rem] rounded-tl-sm self-start border border-[#86efac]/20"
                    }
                  `}
                >
                  <span className="relative z-10">{msg.content}</span>

                  {msg.type === 'user' && (
                    <div className="absolute bottom-1 right-2 flex text-[#86efac] opacity-90 drop-shadow-sm">
                      <CheckCheck size={14} strokeWidth={3} />
                    </div>
                  )}

                  {msg.type === 'bot' && (
                    <div className="absolute bottom-1 right-3 text-[#4ade80]/50 text-[10px] font-mono">
                      Just now
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className={`relative z-10 px-4 pb-[30px] pt-4 transition-colors ${theme === 'light' ? 'bg-white border-t border-slate-100' : 'bg-[#020502]'}`}>
            <div className={`p-1.5 pl-5 rounded-[2rem] border text-[15px] flex items-center justify-between shadow-sm cursor-text transition-all ${
              theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-[#0a1a0d] border-[#86efac]/30 text-[#7aad86]'
            }`}>
              <span className="flex items-center gap-2 font-medium">
                Type a message <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block w-[2px] h-[18px] bg-[#4ade80] rounded"></motion.span>
              </span>
              <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#4ade80] to-[#166534] flex items-center justify-center shadow-md cursor-pointer relative">
                <ArrowRight size={20} className="text-[#050e07] stroke-[3px] relative z-10" />
              </div>
            </div>

            <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-[5px] rounded-full transition-colors ${theme === 'light' ? 'bg-slate-200' : 'bg-white/20'}`}></div>
          </div>

        </div>
      </div>
    </div>
  );
}
