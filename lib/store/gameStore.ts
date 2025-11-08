import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  category: string;
  questionText: string;
  patientContext: string;
  patientName: string;
  patientAge?: number;
  difficultyLevel: string;
  hintText: string;
  answerOptions: AnswerOption[];
}

interface AnswerOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  explanation: string;
}

interface GameResponse {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent: number;
  usedHint: boolean;
}

interface GameState {
  // Session info
  sessionId: string;
  startTime: number;
  
  // Questions
  questions: Question[];
  currentQuestionIndex: number;
  
  // Progress
  responses: GameResponse[];
  score: number;
  
  // Hint system
  hintsRemaining: number;
  maxHints: number;
  usedHintForCurrentQuestion: boolean;
  
  // UI state
  selectedAnswer: string | null;
  showResults: boolean;
  questionStartTime: number;
  
  // Actions
  initializeGame: (questions: Question[], maxHints?: number) => void;
  selectAnswer: (optionId: string) => void;
  showAnswerResult: () => void;
  nextQuestion: () => void;
  useHint: () => void;
  getCurrentQuestion: () => Question | null;
  getTimeElapsed: () => number;
  isGameComplete: () => boolean;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  sessionId: uuidv4(),
  startTime: Date.now(),
  questions: [],
  currentQuestionIndex: 0,
  responses: [],
  score: 0,
  hintsRemaining: 3,
  maxHints: 3,
  usedHintForCurrentQuestion: false,
  selectedAnswer: null,
  showResults: false,
  questionStartTime: Date.now(),

  // Initialize game with questions
  initializeGame: (questions, maxHints = 3) => {
    set({
      sessionId: uuidv4(),
      startTime: Date.now(),
      questions,
      currentQuestionIndex: 0,
      responses: [],
      score: 0,
      hintsRemaining: maxHints,
      maxHints,
      usedHintForCurrentQuestion: false,
      selectedAnswer: null,
      showResults: false,
      questionStartTime: Date.now()
    });
  },

  // Select an answer
  selectAnswer: (optionId) => {
    const state = get();
    if (state.selectedAnswer || state.showResults) return;
    
    set({ selectedAnswer: optionId });
  },

  // Show the result of the selected answer
  showAnswerResult: () => {
    const state = get();
    if (!state.selectedAnswer || state.showResults) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const selectedOption = currentQuestion.answerOptions.find(
      (opt) => opt.id === state.selectedAnswer
    );

    if (!selectedOption) return;

    const timeSpent = Math.floor((Date.now() - state.questionStartTime) / 1000);
    const isCorrect = selectedOption.isCorrect;

    const response: GameResponse = {
      questionId: currentQuestion.id,
      selectedOptionId: state.selectedAnswer,
      isCorrect,
      timeSpent,
      usedHint: state.usedHintForCurrentQuestion
    };

    set({
      showResults: true,
      responses: [...state.responses, response],
      score: isCorrect ? state.score + 1 : state.score
    });
  },

  // Move to next question
  nextQuestion: () => {
    const state = get();
    const nextIndex = (state.currentQuestionIndex + 1) % state.questions.length;
    set({
      currentQuestionIndex: nextIndex,
      selectedAnswer: null,
      showResults: false,
      questionStartTime: Date.now(),
      usedHintForCurrentQuestion: false
    });
  },

  // Use a hint
  useHint: () => {
    const state = get();
    if (state.hintsRemaining > 0 && !state.usedHintForCurrentQuestion) {
      set({
        hintsRemaining: state.hintsRemaining - 1,
        usedHintForCurrentQuestion: true
      });
    }
  },

  // Get current question
  getCurrentQuestion: () => {
    const state = get();
    return state.questions[state.currentQuestionIndex] || null;
  },

  // Get total time elapsed in seconds
  getTimeElapsed: () => {
    const state = get();
    return Math.floor((Date.now() - state.startTime) / 1000);
  },

  // Check if game is complete
  isGameComplete: () => {
    const state = get();
    return (
      state.currentQuestionIndex >= state.questions.length - 1 &&
      state.showResults
    );
  },

  // Reset game
  resetGame: () => {
    set({
      sessionId: uuidv4(),
      startTime: Date.now(),
      questions: [],
      currentQuestionIndex: 0,
      responses: [],
      score: 0,
      hintsRemaining: 3,
      usedHintForCurrentQuestion: false,
      selectedAnswer: null,
      showResults: false,
      questionStartTime: Date.now()
    });
  }
}));

