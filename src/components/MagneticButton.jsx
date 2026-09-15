import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * Magnetic Button component.
 * Subtle physics-based pull toward cursor with configurable strength,
 * quick snap-in and smooth release on pointer leave.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.strength=0.3] - Magnetic attraction factor (0.1 - 0.5 recommended)
 * @param {string} [props.className='']
 */
export function MagneticButton({
  children,
  strength = 0.3,
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanHover(isFine && !reducedMotion);
  }, []);

  // Smooth, high-precision spring physics for professional feel
  const springConfig = { damping: 25, stiffness: 220, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (!canHover || !ref.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      style={{ x, y, willChange: 'transform' }}
      className={`inline-block ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default MagneticButton;
