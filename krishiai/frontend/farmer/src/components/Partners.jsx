import React from 'react';
import { motion } from 'framer-motion';

const PARTNERS = [
  { name: "Global Agri Initiative", logo: "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?q=80&w=200&h=100&auto=format&fit=crop" },
  { name: "EcoFarmer Org", logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&h=100&auto=format&fit=crop" },
  { name: "Digital Rural India", logo: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=200&h=100&auto=format&fit=crop" },
  { name: "Soil Health Fed", logo: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&h=100&auto=format&fit=crop" },
  { name: "Precision Agri Lab", logo: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=200&h=100&auto=format&fit=crop" },
  { name: "NextGen Farming", logo: "https://images.unsplash.com/photo-1495107336281-19d4f7a4209c?q=80&w=200&h=100&auto=format&fit=crop" },
];

export default function Partners() {
  return (
    <section className="py-20 relative overflow-hidden bg-[#000a04]/50 border-y border-[#86efac]/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-12">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[#86efac] font-semibold text-xs mb-4"
        >
          Trusted by Leaders in Agriculture
        </motion.p>
      </div>

      <div className="flex overflow-hidden group">
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          className="flex gap-12 items-center whitespace-nowrap min-w-full"
        >
          {[...PARTNERS, ...PARTNERS].map((partner, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default px-8"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-12 w-auto object-contain mb-2 rounded-lg"
              />
              <span className="text-white text-sm font-medium">{partner.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
