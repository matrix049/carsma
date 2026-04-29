'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MagneticLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** How strongly the element follows the cursor (0–1). 0.25 is a good default. */
  strength?: number;
  onClick?: () => void;
}

/**
 * MagneticLink subtly translates toward the cursor while it's hovering inside,
 * and springs back when the cursor leaves. The translation is small but
 * gives buttons a tactile, hand-tuned quality you don't get from a CSS hover.
 */
export default function MagneticLink({
  href,
  children,
  className = '',
  strength = 0.25,
  onClick,
}: MagneticLinkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    setPos({ x: mx * strength, y: my * strength });
  };

  const handleLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.5 }}
      className="inline-block"
    >
      <Link href={href} onClick={onClick} className={className}>
        <motion.span
          animate={{ x: pos.x * 0.4, y: pos.y * 0.4 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.5 }}
          className="inline-flex items-center justify-center"
        >
          {children}
        </motion.span>
      </Link>
    </motion.div>
  );
}
