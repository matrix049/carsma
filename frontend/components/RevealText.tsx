'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface RevealTextProps {
  text: string;
  className?: string;
  /** Stagger delay between words (seconds) */
  stagger?: number;
  /** Animate every reveal (false = once on entry) */
  repeat?: boolean;
  /** Wrap each word in a className for typography control */
  wordClassName?: string;
  /** Element to render as (defaults to span) */
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
}

/**
 * RevealText splits a string into words and reveals them one-by-one
 * with a soft blur+lift animation as the element enters the viewport.
 *
 * Designed for headlines and manifesto blocks where word-by-word reveal
 * adds a hand-built, editorial feel that a stock fade-in cannot.
 */
export default function RevealText({
  text,
  className = '',
  stagger = 0.06,
  repeat = false,
  wordClassName = '',
  as = 'span',
}: RevealTextProps) {
  const words = text.split(' ');

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: 0.05 },
    },
  };

  const word: Variants = {
    hidden: { opacity: 0, y: '60%', filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: '0%',
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const MotionTag = motion[as] as typeof motion.span;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeat, margin: '-10% 0px -10% 0px' }}
      variants={container}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden align-baseline"
          style={{ paddingBottom: '0.05em' }}
        >
          <motion.span
            variants={word}
            className={`inline-block ${wordClassName}`}
          >
            {w}
            {i !== words.length - 1 && ' '}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
