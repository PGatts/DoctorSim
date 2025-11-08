/**
 * Hint system utilities
 */

export const DEFAULT_HINTS_PER_SESSION = 3;

export interface HintState {
  hintsRemaining: number;
  hintsUsed: number;
  usedHintQuestionIds: string[];
}

export function initializeHintState(maxHints: number = DEFAULT_HINTS_PER_SESSION): HintState {
  return {
    hintsRemaining: maxHints,
    hintsUsed: 0,
    usedHintQuestionIds: []
  };
}

export function canUseHint(hintState: HintState, questionId: string): boolean {
  // Check if there are hints remaining
  if (hintState.hintsRemaining <= 0) {
    return false;
  }
  
  // Check if hint has already been used for this question
  if (hintState.usedHintQuestionIds.includes(questionId)) {
    return false;
  }
  
  return true;
}

export function useHint(hintState: HintState, questionId: string): HintState {
  if (!canUseHint(hintState, questionId)) {
    return hintState;
  }
  
  return {
    hintsRemaining: hintState.hintsRemaining - 1,
    hintsUsed: hintState.hintsUsed + 1,
    usedHintQuestionIds: [...hintState.usedHintQuestionIds, questionId]
  };
}

