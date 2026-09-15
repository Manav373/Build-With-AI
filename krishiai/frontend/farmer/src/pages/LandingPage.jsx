import React, { useEffect, useState, lazy, Suspense } from 'react';
import { motion, useScroll } from 'framer-motion';

// Critical (Above the fold)
import Navbar from '../components/landing/Navbar';
import ScrollJourney from '../components/landing/ScrollJourney';

// Lazy (Below the fold)
const MarqueeTicker = lazy(() => import('../components/landing/MarqueeTicker'));
const HowItWorks = lazy(() => import('../components/landing/HowItWorks'));
const Stats = lazy(() => import('../components/landing/Stats'));
const Testimonials = lazy(() => import('../components/landing/Testimonials'));
const Mission = lazy(() => import('../components/landing/Mission'));
const Impact = lazy(() => import('../components/landing/Impact'));
const FAQ = lazy(() => import('../components/landing/FAQ'));
const Features = lazy(() => import('../components/landing/Features'));
const CTA = lazy(() => import('../components/landing/CTA'));
const Footer = lazy(() => import('../components/landing/Footer'));

import LocationPermissionPopup from '../components/common/LocationPermissionPopup';
const WhatsAppPage = lazy(() => import('./WhatsAppPage'));

const SectionLoader = () => <div className="h-40 w-full animate-pulse bg-white/5 rounded-3xl mb-12" />;

export default function LandingPage() {
    const { scrollYProgress } = useScroll();
    const videoRef = React.useRef(null);

    useEffect(() => {
        // Start loading the heavy 7MB video ONLY after the page is initialized
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, []);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', width: '100%', background: 'transparent', margin: 0, padding: 0 }}>
            {/* Main Animated Background */}
            <div className="landing-bg-container">
                <video
                    ref={videoRef}
                    className="landing-bg-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                    width="1920"
                    height="1080"
                >
                    <source src="/hero-bg.mp4" type="video/mp4" />
                    {/* Fallback to an optimized image if video fails or is loading */}
                    <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=60&w=1200&auto=format&fit=crop" alt="Farming Background" width="1200" height="800" loading="eager" />
                </video>
                <div className="landing-bg-overlay" />
            </div>

            {/* Scroll Progress */}
            <motion.div style={{
                position: 'fixed', top: 0, left: 0, height: 3, zIndex: 10000,
                background: 'linear-gradient(90deg,#86efac,#facc15,#4ade80)',
                borderRadius: '0 2px 2px 0', width: `${Math.min((scrollYProgress.get() || 0) * 100, 100)}%`,
            }} />

            {/* Background elements (grid) */}
            <div className="grid-bg" style={{ zIndex: 0 }}></div>

            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', top: '10%', right: '-10%', background: 'radial-gradient(circle,rgba(22,101,52,0.2),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} className="blur-3xl" />
            <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', bottom: '30%', left: '-10%', background: 'radial-gradient(circle,rgba(22,101,52,0.15),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} className="blur-3xl" />


            <Navbar />
            {/* Location permission popup — shown once per device */}
            <LocationPermissionPopup />
            <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <ScrollJourney />
                    <Suspense fallback={<SectionLoader />}>
                        <MarqueeTicker />
                        <Features />
                        <Mission />
                        <HowItWorks />
                        <WhatsAppPage isLanding={true} />
                        <Stats />
                        <Impact />
                        <Testimonials />
                        <FAQ />
                        <CTA />
                        <Footer />
                    </Suspense>
                </motion.div>

            </main>
        </div>
    );
}

