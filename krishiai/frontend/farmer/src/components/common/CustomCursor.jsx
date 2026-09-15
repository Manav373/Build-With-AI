import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Use a more standard check: strictly mobile screens or coarse pointers
  const [isMobile, setIsMobile] = useState(false);

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
    
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const animate = () => {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    const animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [isMobile, mounted]);

  if (isMobile || !mounted) return null;

  return (
    <>
      <style>{`
        /* Hide default cursor on desktop */
        @media (min-width: 769px) and (pointer: fine) {
          * {
            cursor: none !important;
          }
          
          .custom-cursor-dot, .custom-cursor-follower {
            display: block !important;
          }
        }

        .custom-cursor-dot {
          display: none;
          position: fixed;
          top: 0; left: 0;
          width: 8px; height: 8px;
          background-color: #4ade80;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999999;
          will-change: transform;
          margin-left: -4px; margin-top: -4px;
        }

        .custom-cursor-follower {
          display: none;
          position: fixed;
          top: 0; left: 0;
          width: 36px; height: 36px;
          border: 1.5px solid rgba(74, 222, 128, 0.4);
          background-color: rgba(22, 101, 52, 0.05);
          border-radius: 50%;
          pointer-events: none;
          z-index: 999998;
          will-change: transform;
          margin-left: -18px; margin-top: -18px;
          backdrop-filter: blur(1px);
          transition: width 0.25s ease-out, height 0.25s ease-out, background-color 0.2s;
        }
        
        /* Interaction effects */
        a:hover ~ .custom-cursor-follower,
        button:hover ~ .custom-cursor-follower,
        [role="button"]:hover ~ .custom-cursor-follower {
          width: 54px;
          height: 54px;
          background-color: rgba(74, 222, 128, 0.15);
          border-color: rgba(74, 222, 128, 0.6);
          margin-left: -27px;
          margin-top: -27px;
        }
      `}</style>
      <div ref={cursorRef} className="custom-cursor-dot"></div>
      <div ref={followerRef} className="custom-cursor-follower"></div>
    </>
  );
}
