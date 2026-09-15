import React from 'react';
import { motion } from 'framer-motion';
import { easeEditorial } from '../lib/animations.js';

/**
 * Reusable viewport fade-in animation component.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.delay=0]
 * @param {number} [props.duration=0.7]
 * @param {number} [props.x=0]
 * @param {number} [props.y=30]
 * @param {string} [props.className='']
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className = '',
  ...rest
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: easeEditorial,
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;
