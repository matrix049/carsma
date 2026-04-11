'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function MovingCarsBackground() {
  const [cars, setCars] = useState<Array<{ id: number; lane: number; speed: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random cars
    const carArray = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      lane: Math.floor(Math.random() * 3), // 3 lanes
      speed: 15 + Math.random() * 10, // 15-25 seconds
      delay: Math.random() * 10, // 0-10 seconds delay
    }));
    setCars(carArray);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5 z-0">
      {cars.map((car) => (
        <motion.div
          key={car.id}
          className="absolute"
          style={{
            top: `${20 + car.lane * 30}%`,
            left: '-10%',
          }}
          animate={{
            left: ['110%'],
          }}
          transition={{
            duration: car.speed,
            delay: car.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg
            width="120"
            height="60"
            viewBox="0 0 120 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600"
          >
            {/* Car body */}
            <path
              d="M20 35 L30 25 L50 25 L60 20 L80 20 L90 25 L100 35 L100 45 L95 45 L95 50 L85 50 L85 45 L35 45 L35 50 L25 50 L25 45 L20 45 Z"
              fill="currentColor"
              opacity="0.6"
            />
            {/* Windows */}
            <path
              d="M35 25 L45 25 L50 30 L40 30 Z M65 25 L75 25 L80 30 L70 30 Z"
              fill="currentColor"
              opacity="0.3"
            />
            {/* Wheels */}
            <circle cx="30" cy="50" r="8" fill="currentColor" opacity="0.8" />
            <circle cx="90" cy="50" r="8" fill="currentColor" opacity="0.8" />
            {/* Wheel details */}
            <circle cx="30" cy="50" r="4" fill="currentColor" opacity="0.4" />
            <circle cx="90" cy="50" r="4" fill="currentColor" opacity="0.4" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
