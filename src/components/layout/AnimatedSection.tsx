'use client';

import { motion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale';

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  direction?: Direction;
};

const directionOffsets: Record<Exclude<Direction, 'scale'>, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
};

export default function AnimatedSection({
  children,
  className,
  delay = 0.1,
  duration = 0.6,
  once = true,
  amount = 0.2,
  direction = 'up',
}: AnimatedSectionProps) {
  const { initial, animate } = useMemo(() => {
    if (direction === 'scale') {
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
      };
    }

    const offsets = directionOffsets[direction] || directionOffsets.up;
    return {
      initial: { opacity: 0, x: offsets.x, y: offsets.y },
      animate: { opacity: 1, x: 0, y: 0 },
    };
  }, [direction]);

  return (
    <motion.div
      className={['will-change-transform', className].filter(Boolean).join(' ')}
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

