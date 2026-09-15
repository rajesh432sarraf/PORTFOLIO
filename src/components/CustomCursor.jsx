import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Subtle desktop custom cursor.
 * - Active only on pointer devices (pointer: fine)
 * - Disabled on touch and when prefers-reduced-motion is active
 * - Small dot + outer trailing ring that softly scales over interactive elements
 * - pointer-events: none to avoid blocking clicks
 */
export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Smooth springs for outer ring
  const springX = useSpring(rawX, { damping: 28, stiffness: 350, mass: 0.1 });
  const springY = useSpring(rawY, { damping: 28, stiffness: 350, mass: 0.1 });

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const checkEnabled = () => {
      setIsEnabled(pointerQuery.matches && !motionQuery.matches);
    };

    checkEnabled();
    pointerQuery.addEventListener('change', checkEnabled);
    motionQuery.addEventListener('change', checkEnabled);

    const onMouseMove = (e) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    // Interactive target detection
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('.interactive')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', onMouseLeave);
    document.body.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      pointerQuery.removeEventListener('change', checkEnabled);
      motionQuery.removeEventListener('change', checkEnabled);
      window.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      document.body.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible, rawX, rawY]);

  if (!isEnabled || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer trailing ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-white/30 backdrop-blur-[0.5px]"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 48 : 28,
          height: isHovered ? 48 : 28,
          backgroundColor: isHovered ? 'rgba(215, 226, 234, 0.08)' : 'transparent',
          borderColor: isHovered ? 'rgba(215, 226, 234, 0.5)' : 'rgba(215, 226, 234, 0.25)',
          transition: 'width 0.2s ease-out, height 0.2s ease-out, background-color 0.2s ease-out, border-color 0.2s ease-out',
        }}
      />

      {/* Center pinpoint dot */}
      <motion.div
        className="fixed top-0 left-0 rounded-full bg-[#D7E2EA]"
        style={{
          x: rawX,
          y: rawY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 6 : 4,
          height: isHovered ? 6 : 4,
          opacity: 0.9,
          transition: 'width 0.15s ease-out, height 0.15s ease-out',
        }}
      />
    </div>
  );
}

export default CustomCursor;
