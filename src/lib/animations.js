/**
 * Shared animation configurations and Framer Motion easing curves.
 */

export const easeEditorial = [0.25, 0.1, 0.25, 1];

export const transitionHeavy = {
  duration: 0.9,
  ease: easeEditorial,
};

export const transitionStandard = {
  duration: 0.7,
  ease: easeEditorial,
};

export const transitionSnappy = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
};

// Variants for staggered children reveals
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Variants for heading mask reveals
export const headingReveal = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: easeEditorial,
      delay: 0.15,
    },
  },
};

// Variants for bottom content bar
export const bottomBarReveal = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeEditorial,
      delay: 0.45,
    },
  },
};
