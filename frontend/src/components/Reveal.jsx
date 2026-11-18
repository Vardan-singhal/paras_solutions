'use client';
import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
export default function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, amount: 0.08 });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!visible || reduced) return;
    const control = animate(
      ref.current,
      { opacity: [0.6, 1], y: [14, 0] },
      { duration: 0.5, delay: Math.min(delay, 0.24), ease: 'easeOut' },
    );
    return () => control.stop();
  }, [visible, reduced, delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
