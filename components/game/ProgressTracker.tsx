'use client';

import { motion } from 'framer-motion';

interface ProgressTrackerProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  timeElapsed: number;
}

export default function ProgressTracker({
  currentQuestion,
  totalQuestions,
  score,
  timeElapsed
}: ProgressTrackerProps) {
  const accuracy = currentQuestion > 0 ? Math.round((score / currentQuestion) * 100) : 0;
  const progress = (currentQuestion / totalQuestions) * 100;
  
  // Format time as MM:SS
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-b from-purple-600 to-purple-500 text-white px-4 py-3 shadow-lg z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm md:text-base">
          {/* Question progress */}
          <div className="flex items-center gap-2">
            <span className="font-bold">Question:</span>
            <span>{currentQuestion} / {totalQuestions}</span>
          </div>

          {/* Progress bar */}
          <div className="flex-1 min-w-[120px] max-w-xs">
            <div className="h-6 bg-purple-800 rounded-full overflow-hidden border-2 border-purple-900">
              <motion.div
                className="h-full bg-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2">
            <span className="font-bold">Score:</span>
            <span>{score} ({accuracy}%)</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2">
            <span className="font-bold">⏱️</span>
            <span>{timeString}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

