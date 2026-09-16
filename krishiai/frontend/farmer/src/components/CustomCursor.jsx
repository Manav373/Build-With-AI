import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobile);
    };
    
    checkMobile();
    setMounted(true);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !mounted) return;
    
    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;
    let isTracking = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isTracking) {
        isTracking = true;
        setVisible(true);
        followerX = mouseX;
        followerY = mouseY;
      }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseLeave = () => {
      setVisible(false);
      isTracking = false;
    };

    const animate = () => {
      if (isTracking) {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        if (followerRef.current) {
          followerRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
        }
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    const animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, [isMobile, mounted]);

  if (isMobile || !mounted) return null;

  return (
    <>
      <style>{`
        .custom-cursor-dot {
          position: fixed;
          top: 0; left: 0;
          width: 6px; height: 6px;
          background-color: #4ade80;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999999;
          will-change: transform;
          margin-left: -3px; margin-top: -3px;
          transition: opacity 0.2s ease;
        }

        .custom-cursor-follower {
          position: fixed;
          top: 0; left: 0;
          width: 32px; height: 32px;
          border: 1.5px solid rgba(74, 222, 128, 0.4);
          background-color: rgba(22, 101, 52, 0.04);
          border-radius: 50%;
          pointer-events: none;
          z-index: 999998;
          will-change: transform;
          margin-left: -16px; margin-top: -16px;
          backdrop-filter: blur(1px);
          transition: opacity 0.25s ease, width 0.25s ease, height 0.25s ease;
        }
      `}</style>
      <div 
        ref={cursorRef} 
        className="custom-cursor-dot" 
        style={{ opacity: visible ? 1 : 0 }}
      ></div>
      <div 
        ref={followerRef} 
        className="custom-cursor-follower" 
        style={{ opacity: visible ? 1 : 0 }}
      ></div>
    </>
  );
}
