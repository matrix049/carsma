'use client';

import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: 'slow' | 'normal' | 'fast';
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
}

export default function Marquee({
  children,
  speed = 'normal',
  reverse = false,
  className = '',
  pauseOnHover = false,
}: MarqueeProps) {
  const trackClass = reverse
    ? 'marquee-track-reverse'
    : speed === 'fast'
      ? 'marquee-track-fast'
      : speed === 'slow'
        ? 'marquee-track-reverse'
        : 'marquee-track';

  return (
    <div className={`group relative w-full overflow-hidden ${className}`}>
      <div
        className={`flex w-max ${trackClass} ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        aria-hidden={false}
      >
        {/* Render the children twice so the loop is seamless */}
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
