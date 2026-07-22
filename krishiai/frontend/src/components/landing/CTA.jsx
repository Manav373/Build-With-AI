import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations/index';

export default function CTA() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language].cta;

    return (
        <section style={{ position: 'relative', zIndex: 1, padding: '4rem 5% 6rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', maxWidth: 880, margin: '0 auto' }}>

                {/* Animated gradient border ring */}
                <div className="grad-border" style={{ position: 'absolute', inset: -2, borderRadius: '2.6rem', background: 'transparent', pointerEvents: 'none', zIndex: 0 }} />

                <div className="glass-panel text-shadow-strong" style={{
                    position: 'relative', zIndex: 1,
                    background: 'linear-gradient(135deg,rgba(0,0,0,0.4),rgba(0,0,0,0.8))',
                    borderRadius: '2.5rem', padding: '5rem 4rem', textAlign: 'center', overflow: 'hidden',
                    border: '1px solid rgba(134,239,172,0.3)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}>
                    {/* Blobs */}
                    <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: -150, left: -150, background: 'rgba(22,101,52,0.25)', filter: 'blur(70px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', bottom: -120, right: -120, background: 'rgba(250,204,21,0.1)', filter: 'blur(70px)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                            style={{ fontSize: '3.5rem', marginBottom: '1.2rem', display: 'block' }}>
                            🌾
                        </motion.div>

                        <h2 className="text-shadow-strong" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(2rem,4.5vw,3.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '1.2rem', letterSpacing: '-0.03em' }}>
                            {t.title}<br />
                            <span className="shimmer-text">{t.accent}</span>
                        </h2>

                        <p className="text-shadow-strong" style={{ fontSize: '1.05rem', color: '#e2f0e4', marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
                            {t.subtitle}
                        </p>

                        <motion.div 
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                            }}
                            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            <motion.button
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="glow-btn"
                                whileHover={{ scale: 1.08, boxShadow: '0 0 60px rgba(134,239,172,0.5)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/chat')}
                                style={{ background: 'linear-gradient(135deg,#166534,#15803d)', color: '#fff', border: 'none', cursor: 'pointer', padding: '1.1rem 2.4rem', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 800, boxShadow: '0 8px 30px rgba(22,101,52,0.5)', letterSpacing: '-0.01em' }}>
                                🚀 {t.btnLaunch}
                            </motion.button>
                            <motion.a
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                whileHover={{ scale: 1.05, background: 'rgba(37,211,102,0.25)', boxShadow: '0 0 30px rgba(37,211,102,0.3)' }}
                                href="https://wa.me/14155238886?text=join%20wish-aboard" 
                                target="_blank" rel="noopener noreferrer"
                                aria-label="Join our WhatsApp community"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(37,211,102,0.12)', border: '1.5px solid rgba(37,211,102,0.3)', color: '#25D366', padding: '1.1rem 2rem', borderRadius: '100px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', backdropFilter: 'blur(10px)' }}>

                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                {t.btnWhatsApp}
                            </motion.a>
                        </motion.div>

                        <motion.div 
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
                            }}
                            style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                                { icon: Shield, text: t.encryption },
                                { icon: Smartphone, text: t.ready },
                                { icon: Languages, text: t.multiLang }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, y: 10 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#86efac', fontWeight: 600, fontSize: '0.85rem' }}
                                >
                                    <item.icon size={14} />
                                    {item.text}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
