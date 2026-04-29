'use client';

import React from 'react';

/**
 * PorscheCar — a clean 911-style side profile rendered in pure SVG.
 *
 * Right-facing (front on the right) so it pairs naturally with a
 * left → right entrance animation. The body-only path keeps the
 * silhouette readable at any size; details (headlight, windows,
 * wheels, ducktail) sit on top.
 *
 * Use as a fallback when no Porsche photo is available — drop a
 * <img src="/your-porsche.png" /> in its place once you have one.
 */
export default function PorscheCar({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 130"
      xmlns="http://www.w3.org/2000/svg"
      className={`block h-auto w-full ${className}`}
      style={{ transform: 'scaleX(-1)' }}
      role="img"
      aria-label="Porsche 911 silhouette"
    >
      <defs>
        <linearGradient id="pcBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="60%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id="pcWindow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="pcHead" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="60%" stopColor="#bfdbfe" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Body */}
      <path
        d="
          M 8 90
          L 18 78
          Q 32 72 60 70
          L 90 65
          Q 110 56 140 50
          Q 175 32 230 32
          Q 290 32 330 50
          Q 360 62 380 70
          Q 395 75 405 80
          L 412 90
          L 412 96
          L 395 96
          Q 388 88 372 88
          Q 356 88 350 96
          L 80 96
          Q 74 88 58 88
          Q 42 88 36 96
          L 14 96
          Z
        "
        fill="url(#pcBody)"
      />

      {/* Greenhouse outline */}
      <path
        d="M 90 65 Q 110 56 140 50 Q 175 32 230 32 Q 290 32 330 50"
        fill="none"
        stroke="#374151"
        strokeWidth="1.2"
      />

      {/* Windows */}
      <path
        d="
          M 145 53
          Q 175 38 225 38
          Q 275 38 315 52
          L 305 56
          Q 270 46 225 46
          Q 180 46 152 58
          Z
        "
        fill="url(#pcWindow)"
      />

      {/* Door cut */}
      <path d="M 215 56 L 215 88" stroke="#1f2937" strokeWidth="0.8" opacity="0.7" />

      {/* Wheel wells */}
      <ellipse cx="62" cy="92" rx="22" ry="14" fill="#000" />
      <ellipse cx="358" cy="92" rx="22" ry="14" fill="#000" />

      {/* Front wheel */}
      <g transform="translate(62 92)">
        <circle r="14" fill="#000" />
        <circle r="11" fill="#1f2937" />
        <circle r="7" fill="#0a0a0a" />
        {[0, 60, 120, 180, 240, 300].map((d) => (
          <line
            key={d}
            x1="0"
            y1="0"
            x2={Math.cos((d * Math.PI) / 180) * 10}
            y2={Math.sin((d * Math.PI) / 180) * 10}
            stroke="#374151"
            strokeWidth="1.2"
          />
        ))}
        <circle r="2.5" fill="#9ca3af" />
      </g>

      {/* Rear wheel */}
      <g transform="translate(358 92)">
        <circle r="14" fill="#000" />
        <circle r="11" fill="#1f2937" />
        <circle r="7" fill="#0a0a0a" />
        {[0, 60, 120, 180, 240, 300].map((d) => (
          <line
            key={d}
            x1="0"
            y1="0"
            x2={Math.cos((d * Math.PI) / 180) * 10}
            y2={Math.sin((d * Math.PI) / 180) * 10}
            stroke="#374151"
            strokeWidth="1.2"
          />
        ))}
        <circle r="2.5" fill="#9ca3af" />
      </g>

      {/* Ducktail spoiler */}
      <path
        d="M 380 70 Q 395 68 408 76 L 408 80 Q 395 75 378 76 Z"
        fill="#0a0a0a"
        opacity="0.95"
      />

      {/* Headlight */}
      <ellipse cx="20" cy="84" rx="9" ry="5" fill="url(#pcHead)" />
      <ellipse cx="20" cy="84" rx="3.5" ry="2" fill="#ffffff" />

      {/* Brake light */}
      <rect x="402" y="78" width="4" height="6" rx="1" fill="#ef4444" opacity="0.85" />
    </svg>
  );
}
