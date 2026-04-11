'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WheelLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WheelLoader({ size = 'md', className = '' }: WheelLoaderProps) {
  const sizes = {
    sm: 40,
    md: 60,
    lg: 80,
  };

  const wheelSize = sizes[size];

  return (
    <div className={`relative ${className}`} style={{ width: wheelSize, height: wheelSize }}>
      {/* Smoke effect */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      >
        <div className="w-full h-full rounded-full bg-blue-500 blur-xl" />
      </motion.div>

      {/* Spinning wheel */}
      <motion.svg
        width={wheelSize}
        height={wheelSize}
        viewBox="0 0 100 100"
        className="relative z-10"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
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
          className="text-blue-600"
          opacity="0.3"
        />
        
        {/* Tire tread pattern */}
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
              className="text-blue-600"
              opacity="0.5"
            />
          );
        })}

        {/* Hub */}
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="currentColor"
          className="text-blue-600"
          opacity="0.6"
        />

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
              className="text-blue-500"
              opacity="0.8"
            />
          );
        })}

        {/* Center cap */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="currentColor"
          className="text-blue-400"
        />
      </motion.svg>

      {/* Additional smoke particles */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-blue-500"
          animate={{
            x: [0, (i - 1) * 30],
            y: [0, -20 - i * 10],
            opacity: [0.6, 0],
            scale: [0.5, 1.5],
          }}
          transition={{
            duration: 1,
            delay: i * 0.2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
