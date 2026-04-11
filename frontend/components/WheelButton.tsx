'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WheelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export default function WheelButton({ 
  children, 
  onClick, 
  href, 
  className = '',
  variant = 'primary'
}: WheelButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsClicked(true);
    
    // Reset after animation (increased to 1200ms for slower animation)
    setTimeout(() => {
      setIsClicked(false);
      if (onClick) onClick();
      if (href) window.location.href = href;
    }, 1200);
  };

  const baseClasses = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-500'
    : 'bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:bg-white/10';

  return (
    <button
      onClick={handleClick}
      disabled={isClicked}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-12 py-6 text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none ${baseClasses} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-3">
        {children}
      </span>

      {/* Tire marks on the button */}
      <AnimatePresence>
        {isClicked && (
          <>
            {/* Tire mark lines */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`mark-${i}`}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: [0, 0.4, 0] }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="absolute h-1 bg-white/30 rounded-full"
                style={{
                  left: `${i * 12}%`,
                  top: '50%',
                  width: '10%',
                  transformOrigin: 'left center',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Wheel animation on click */}
      <AnimatePresence>
        {isClicked && (
          <>
            {/* Wheel passing through */}
            <motion.div
              initial={{ left: '-100px', opacity: 0 }}
              animate={{ left: 'calc(100% + 100px)', opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute top-1/2 -translate-y-1/2 z-20"
            >
              <motion.svg
                width="60"
                height="60"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                  ease: 'linear',
                }}
              >
                {/* Outer tire */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-white"
                  opacity="0.8"
                />
                
                {/* Tire tread */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 360) / 12;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 50 + 38 * Math.cos(rad);
                  const y1 = 50 + 38 * Math.sin(rad);
                  const x2 = 50 + 45 * Math.cos(rad);
                  const y2 = 50 + 45 * Math.sin(rad);
                  
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-white"
                      opacity="0.6"
                    />
                  );
                })}

                {/* Hub */}
                <circle cx="50" cy="50" r="20" fill="currentColor" className="text-white" opacity="0.9" />

                {/* Spokes */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const angle = (i * 360) / 5;
                  const rad = (angle * Math.PI) / 180;
                  const x = 50 + 18 * Math.cos(rad);
                  const y = 50 + 18 * Math.sin(rad);
                  
                  return (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={x}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-white"
                      opacity="0.9"
                    />
                  );
                })}

                <circle cx="50" cy="50" r="8" fill="currentColor" className="text-white" />
              </motion.svg>
            </motion.div>

            {/* Smoke trail */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ left: '-50px', opacity: 0, scale: 0.5 }}
                animate={{
                  left: ['0%', '50%', '100%'],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1, 1.5],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white blur-md"
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Hover effect */}
      <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform group-hover:translate-x-0" />
    </button>
  );
}
