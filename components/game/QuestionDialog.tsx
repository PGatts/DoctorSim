'use client';

import { motion } from 'framer-motion';
import { dialogVariants } from '@/lib/animations';

interface QuestionDialogProps {
  question: string;
  patientContext: string;
}

export default function QuestionDialog({ question, patientContext }: QuestionDialogProps) {
  return (
    <motion.div
      variants={dialogVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-8 left-1/2 transform -translate-x-1/2 w-11/12 md:w-3/4 max-w-2xl z-10"
    >
      {/* Speech bubble */}
      <div className="dialog-box bg-white p-4 md:p-6 rounded-2xl shadow-2xl border-4 border-black relative">
        {/* Speech bubble pointer */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[16px] border-t-black"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-white"></div>
        </div>

        {/* Patient context */}
        <div className="text-xs md:text-sm text-gray-700 mb-2 italic">
          {patientContext}
        </div>

        {/* Question */}
        <div className="text-base md:text-lg font-semibold text-gray-900">
          "{question}"
        </div>
      </div>
    </motion.div>
  );
}

