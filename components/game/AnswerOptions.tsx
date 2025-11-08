'use client';

import { motion } from 'framer-motion';
import { answerOptionVariants } from '@/lib/animations';

interface AnswerOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  explanation: string;
}

interface AnswerOptionsProps {
  options: AnswerOption[];
  onSelectAnswer: (optionId: string) => void;
  selectedAnswer?: string | null;
  showResults: boolean;
}

export default function AnswerOptions({
  options,
  onSelectAnswer,
  selectedAnswer,
  showResults
}: AnswerOptionsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.isCorrect;
          const showCorrect = showResults && isCorrect;
          const showIncorrect = showResults && isSelected && !isCorrect;

          return (
            <motion.button
              key={option.id}
              custom={index}
              variants={answerOptionVariants}
              initial="hidden"
              animate="visible"
              whileHover={!showResults ? "hover" : "visible"}
              whileTap={!showResults ? "tap" : "visible"}
              onClick={() => !showResults && onSelectAnswer(option.id)}
              disabled={showResults}
              className={`
                w-full text-left p-4 rounded-lg border-4 transition-all
                ${!showResults && 'cursor-pointer hover:border-blue-500'}
                ${showResults && 'cursor-default'}
                ${isSelected && !showResults ? 'border-blue-500 bg-blue-50' : 'border-black bg-white'}
                ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                ${showIncorrect ? 'border-red-500 bg-red-50' : ''}
                ${showResults && 'opacity-90'}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Option letter */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold
                  ${showCorrect ? 'bg-green-500 border-green-700 text-white' : ''}
                  ${showIncorrect ? 'bg-red-500 border-red-700 text-white' : ''}
                  ${!showResults ? 'bg-gray-100 border-gray-300' : ''}
                `}>
                  {String.fromCharCode(65 + index)}
                </div>

                {/* Option text */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{option.optionText}</p>
                  
                  {/* Show explanation when results are visible */}
                  {showResults && (isSelected || isCorrect) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.2 }}
                      className="mt-2 pt-2 border-t border-gray-300"
                    >
                      <p className="text-sm text-gray-800">
                        {isCorrect && '✓ '}
                        {showIncorrect && '✗ '}
                        {option.explanation}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Result indicator */}
                {showResults && (
                  <div className="flex-shrink-0">
                    {showCorrect && <span className="text-2xl">✅</span>}
                    {showIncorrect && <span className="text-2xl">❌</span>}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue button after showing results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-800 mb-2">
            Click anywhere to continue...
          </p>
        </motion.div>
      )}
    </div>
  );
}

