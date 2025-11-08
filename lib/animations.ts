import { Variants } from 'framer-motion';

// Patient character animation variants
export const patientVariants: Variants = {
  hidden: { 
    x: -200, 
    opacity: 0, 
    scale: 0.8 
  },
  enter: { 
    x: 0, 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 1.5, 
      ease: 'easeOut' 
    }
  },
  exit: { 
    x: 200, 
    opacity: 0, 
    scale: 0.8,
    transition: { 
      duration: 1, 
      ease: 'easeIn' 
    }
  },
  idle: {
    y: [0, -2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Hint notepad animation variants
export const hintVariants: Variants = {
  idle: { 
    scale: 1, 
    rotate: 0 
  },
  hover: { 
    scale: 1.1, 
    rotate: 2,
    transition: {
      duration: 0.2
    }
  },
  tap: { 
    scale: 0.95 
  },
  reveal: { 
    scale: 1.5, 
    y: -50,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    }
  }
};

// Answer option animation variants
export const answerOptionVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.1, 
      duration: 0.3 
    }
  }),
  hover: {
    scale: 1.02,
    x: 4,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.98
  }
};

// Dialog box animation variants
export const dialogVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.3
    }
  }
};

// Fade in animation
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Slide in from bottom
export const slideUpVariants: Variants = {
  hidden: { 
    y: 100, 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

