import { useState, useEffect } from 'react';

/**
 * Custom hook to track mouse position and detect pointer device capability.
 */
export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isPointerDevice, setIsPointerDevice] = useState(false);

  useEffect(() => {
    // Only enable if the primary pointing device is fine (mouse/trackpad, not touch)
    const pointerQuery = window.matchMedia('(pointer: fine)');
    setIsPointerDevice(pointerQuery.matches);

    const handlePointerChange = (e) => {
      setIsPointerDevice(e.matches);
    };

    pointerQuery.addEventListener('change', handlePointerChange);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      pointerQuery.removeEventListener('change', handlePointerChange);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { ...mousePosition, isPointerDevice };
}

export default useMousePosition;
