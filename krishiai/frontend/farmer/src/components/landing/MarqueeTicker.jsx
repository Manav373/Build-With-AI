import React from 'react';

const TAGS = [
  "🛰️ Satellite NDVI Monitoring",
  "🗺️ Interactive Mandi Map",
  "⛅ Real-time Weather",
  "🌾 Crop Sowing Advice",
  "💰 Mandi Prices & MSP",
  "🔬 Disease Detection AI",
  "📜 PM-KISAN Schemes",
  "🚜 Equipment Rental Info",
  "💧 Irrigation Alerts",
  "🎙️ Multilingual Voice AI",
];


export default function MarqueeTicker() {
  return (
    <div className="w-full py-4 border-y border-gray-200/50 dark:border-[#86efac]/10 bg-white/80 dark:bg-[#0a1a0d]/80 backdrop-blur-md overflow-hidden relative z-10 flex cursor-default">
      {/* gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent dark:from-[#050e07] z-20 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent dark:from-[#050e07] z-20 pointer-events-none"></div>
      
      <div className="marquee-track flex items-center gap-12 pr-12">
        {/* Double array for seamless loop */}
        {[...TAGS, ...TAGS, ...TAGS].map((tag, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-[#166534]/80 dark:text-[#86efac]/80 font-medium text-lg">{tag}</span>
            <span className="text-[#facc15] text-xs">●</span>
          </div>
        ))}
      </div>
    </div>
  );
}
