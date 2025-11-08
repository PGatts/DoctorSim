'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import WaitingRoom from '@/components/game/WaitingRoom';
import DeskScene from '@/components/game/DeskScene';
import PatientCharacter from '@/components/game/PatientCharacter';
import QuestionDialog from '@/components/game/QuestionDialog';
import AnswerOptions from '@/components/game/AnswerOptions';

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showPatient, setShowPatient] = useState(false);

  const {
    questions,
    currentQuestionIndex,
    responses,
    score,
    hintsRemaining,
    usedHintForCurrentQuestion,
    selectedAnswer,
    showResults,
    initializeGame,
    selectAnswer,
    showAnswerResult,
    nextQuestion,
    useHint,
    getCurrentQuestion,
    getTimeElapsed,
    isGameComplete,
    sessionId
  } = useGameStore();

  const currentQuestion = getCurrentQuestion();
  const timeElapsed = getTimeElapsed();
  const patientsWaiting = 4; // Visual only, no actual count

  // Redirect if not authenticated or if admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      // Admins cannot play the game, redirect to dashboard
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/questions?limit=10');
        
        if (!response.ok) {
          throw new Error('Failed to load questions');
        }

        const data = await response.json();
        
        if (data.questions.length === 0) {
          setError('No questions available. Please contact administrator.');
          return;
        }

        initializeGame(data.questions);
        // Show patient after a short delay
        setTimeout(() => setShowPatient(true), 500);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Failed to load game. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated' && questions.length === 0) {
      loadQuestions();
    }
  }, [status, questions.length, initializeGame]);

  // Handle answer selection
  const handleSelectAnswer = async (optionId: string) => {
    if (!selectedAnswer && !showResults && currentQuestion) {
      selectAnswer(optionId);
      
      // Automatically show results after selection
      setTimeout(() => {
        showAnswerResult();
        
        // Save response to database
        const selectedOption = currentQuestion.answerOptions.find(opt => opt.id === optionId);
        if (selectedOption) {
          const timeSpent = Math.floor((Date.now() - useGameStore.getState().questionStartTime) / 1000);
          
          fetch('/api/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              questionId: currentQuestion.id,
              selectedOptionId: optionId,
              isCorrect: selectedOption.isCorrect,
              timeSpentSeconds: timeSpent,
              usedHint: usedHintForCurrentQuestion
            })
          }).catch(err => console.error('Failed to save response:', err));
        }
      }, 500);
    }
  };

  // Handle continuing to next question
  const handleContinue = () => {
    if (showResults) {
      setShowPatient(false);
      setTimeout(() => {
        nextQuestion();
        // If we've reached the end, loop back to the beginning
        if (currentQuestionIndex >= questions.length - 1) {
          // Reset to first question but keep the score and session
          useGameStore.setState({ currentQuestionIndex: 0 });
        }
        setTimeout(() => setShowPatient(true), 300);
      }, 500);
    }
  };

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="dialog-box bg-white p-8 rounded-lg">
          <p className="text-xl font-bold">Loading game...</p>
        </div>
      </div>
    );
  }

  // Prevent admins from accessing the game
  if (session?.user?.role === 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="dialog-box bg-white p-8 rounded-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access</h2>
          <p className="text-gray-700 mb-6">Admins cannot play the game. Please use the dashboard to view analytics and manage questions.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="pixel-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-100 to-orange-100">
        <div className="dialog-box bg-white p-8 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="pixel-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const patientColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  const patientColor = patientColors[currentQuestionIndex % patientColors.length];

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-blue-100 via-purple-50 to-green-50 overflow-hidden"
      onClick={showResults ? handleContinue : undefined}
    >
      {/* Main game area */}
      <div className="pt-8 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Waiting room visual (no text) */}
          <WaitingRoom patientsWaiting={patientsWaiting} />

          {/* Game scene container */}
          <div className="relative min-h-[500px] md:min-h-[600px]">
            {/* Question dialog (above patient) */}
            <AnimatePresence>
              {showPatient && currentQuestion && (
                <QuestionDialog
                  question={currentQuestion.questionText}
                  patientContext={currentQuestion.patientContext}
                />
              )}
            </AnimatePresence>

            {/* Patient character */}
            <AnimatePresence>
              {showPatient && currentQuestion && (
                <PatientCharacter
                  name={currentQuestion.patientName}
                  age={currentQuestion.patientAge}
                  color={patientColor}
                  isVisible={showPatient}
                />
              )}
            </AnimatePresence>

            {/* Desk scene at bottom */}
            <div className="absolute bottom-0 left-0 right-0">
              <DeskScene
                key={currentQuestion.id}
                hintText={currentQuestion.hintText}
                hintsRemaining={hintsRemaining}
                canUseHint={!usedHintForCurrentQuestion && hintsRemaining > 0 && !showResults}
                onUseHint={() => {
                  useHint();
                  // Save hint usage to database
                  if (currentQuestion) {
                    fetch('/api/hints', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        sessionId,
                        questionId: currentQuestion.id
                      })
                    }).catch(err => console.error('Failed to save hint usage:', err));
                  }
                }}
              />
            </div>
          </div>

          {/* Answer options */}
          <div className="mt-8">
            <AnswerOptions
              options={currentQuestion.answerOptions}
              onSelectAnswer={handleSelectAnswer}
              selectedAnswer={selectedAnswer}
              showResults={showResults}
            />
          </div>

          {/* Exit button below answers */}
          <div className="mt-6 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
                  router.push('/dashboard');
                }
              }}
              className="pixel-button bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
            >
              Exit Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

