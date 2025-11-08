'use client';

import { motion } from 'framer-motion';
import { patientVariants } from '@/lib/animations';
import { PatientSprite } from './PixelArt';

interface PatientCharacterProps {
  name: string;
  age?: number;
  color?: string;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export default function PatientCharacter({
  name,
  age,
  color = '#FF6B6B',
  isVisible,
  onAnimationComplete
}: PatientCharacterProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="absolute left-1/2 bottom-32 transform -translate-x-1/2"
      variants={patientVariants}
      initial="hidden"
      animate="enter"
      exit="exit"
      onAnimationComplete={onAnimationComplete}
    >
      <div className="relative">
        {/* Patient sprite */}
        <motion.div 
          className="w-24 h-24 md:w-32 md:h-32"
          animate="idle"
          variants={patientVariants}
        >
          <PatientSprite color={color} name={name} />
        </motion.div>
        
        {/* Name label */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full border-2 border-black text-xs md:text-sm font-bold whitespace-nowrap">
          {name}, {age}
        </div>
      </div>
    </motion.div>
  );
}

