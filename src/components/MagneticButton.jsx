import React from 'react';

/**
 * Smooth Interactive Button Wrapper.
 * Keeps buttons anchored in place without jarring cursor-tracking physics,
 * providing clean, stable, and responsive interactions.
 */
export function MagneticButton({
  children,
  className = '',
  ...rest
}) {
  return (
    <div className={`inline-block ${className}`} {...rest}>
      {children}
    </div>
  );
}

export default MagneticButton;
