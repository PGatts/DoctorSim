'use client';

import { DeskSVG, CoffeeCupSVG, MedicalBookSVG } from './PixelArt';
import HintNotepad from './HintNotepad';

interface DeskSceneProps {
  hintText: string;
  hintsRemaining: number;
  canUseHint: boolean;
  onUseHint: () => void;
}

export default function DeskScene({
  hintText,
  hintsRemaining,
  canUseHint,
  onUseHint
}: DeskSceneProps) {
  return (
    <div className="relative w-full h-48 md:h-64">
      {/* Main desk */}
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40">
        <DeskSVG />
      </div>

      {/* Items on desk */}
      <div className="absolute bottom-20 md:bottom-28 left-0 right-0 flex justify-between items-end px-8 md:px-16">
        {/* Medical book (left side) */}
        <div className="w-12 h-16 md:w-16 md:h-20">
          <MedicalBookSVG />
        </div>

        {/* Coffee cup (center-left) */}
        <div className="w-8 h-10 md:w-10 md:h-12 mb-2">
          <CoffeeCupSVG />
        </div>

        {/* Notepad with hint (right side) */}
        <div className="mb-2">
          <HintNotepad
            hintText={hintText}
            hintsRemaining={hintsRemaining}
            canUseHint={canUseHint}
            onUseHint={onUseHint}
          />
        </div>
      </div>

      {/* Desk label (optional) */}
      <div className="absolute bottom-2 right-4 text-xs text-gray-700 italic font-semibold">
        Dr. [Your Name]'s Desk
      </div>
    </div>
  );
}

