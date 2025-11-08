'use client';

import { motion } from 'framer-motion';
import { ChairSVG, PatientSprite } from './PixelArt';

interface WaitingRoomProps {
  patientsWaiting: number;
}

export default function WaitingRoom({ patientsWaiting }: WaitingRoomProps) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  
  return (
    <div className="relative w-full py-8 bg-gradient-to-b from-blue-50 to-transparent">
      <div className="max-w-4xl mx-auto px-4">
        {/* Patient silhouettes in waiting room */}
        <div className="flex justify-center gap-4 md:gap-8">
          {Array.from({ length: Math.min(patientsWaiting, 4) }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Chair */}
              <div className="w-12 h-16 md:w-16 md:h-20 opacity-70">
                <ChairSVG />
              </div>
              
              {/* Patient sitting (small silhouette) */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 opacity-50">
                <PatientSprite color={colors[index % colors.length]} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

