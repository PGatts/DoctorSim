'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { hintVariants } from '@/lib/animations';
import { NotepadSVG } from './PixelArt';

interface HintNotepadProps {
  hintText: string;
  hintsRemaining: number;
  canUseHint: boolean;
  onUseHint: () => void;
}

export default function HintNotepad({
  hintText,
  hintsRemaining,
  canUseHint,
  onUseHint
}: HintNotepadProps) {
  const [showHint, setShowHint] = useState(false);

  const handleClick = () => {
    if (canUseHint && !showHint) {
      onUseHint();
      setShowHint(true);
    }
  };

  return (
    <div className="relative">
      {/* Notepad */}
      <motion.div
        variants={hintVariants}
        initial="idle"
        whileHover={canUseHint && !showHint ? "hover" : "idle"}
        whileTap={canUseHint && !showHint ? "tap" : "idle"}
        onClick={handleClick}
        className={`w-16 h-20 md:w-20 md:h-24 cursor-pointer ${
          canUseHint && !showHint ? '' : 'opacity-50 cursor-not-allowed'
        }`}
      >
        <NotepadSVG hasHint={canUseHint && !showHint} />
      </motion.div>

      {/* Hints remaining indicator */}
      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-black">
        {hintsRemaining}
      </div>

      {/* Hint popup */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 md:w-80"
          >
            <div className="dialog-box bg-yellow-50 p-4 rounded-lg shadow-xl border-4 border-yellow-400">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-yellow-900">💡 Hint:</h4>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-yellow-900 hover:text-yellow-950 font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-900">{hintText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

