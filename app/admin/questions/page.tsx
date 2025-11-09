'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Question {
  id: string;
  category: string;
  questionText: string;
  patientName: string;
  patientAge: number | null;
  difficultyLevel: string;
  hintText: string;
  isActive: boolean;
  answerOptions: Array<{
    id: string;
    optionText: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export default function AdminQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Admin view: disable shuffling to see original order
        const response = await fetch('/api/questions?limit=100&shuffle=false');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      loadQuestions();
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="dialog-box bg-white p-8 rounded-lg">
          <p className="text-xl font-bold text-gray-900">Loading questions...</p>
        </div>
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(questions.map(q => q.category)))];
  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  const categoryStats = questions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'var(--font-pixel)' }}>
            Question Management
          </h1>
          <p className="text-lg text-gray-900">Manage healthcare questions and categories</p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8 flex-wrap"
        >
          <Link href="/admin/dashboard">
            <button className="pixel-button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              Dashboard
            </button>
          </Link>
          <Link href="/admin/users">
            <button className="pixel-button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              Users
            </button>
          </Link>
          <Link href="/admin/questions">
            <button className="pixel-button bg-purple-500 text-white font-bold py-2 px-4 rounded-lg">
              Questions
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="pixel-button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              Exit Admin
            </button>
          </Link>
        </motion.div>

        {!selectedQuestion ? (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              <div className="dialog-box bg-white p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">{questions.length}</div>
                <div className="text-sm text-gray-900">Total Questions</div>
              </div>
              <div className="dialog-box bg-white p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{categories.length - 1}</div>
                <div className="text-sm text-gray-900">Categories</div>
              </div>
              <div className="dialog-box bg-white p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">
                  {questions.filter(q => q.isActive).length}
                </div>
                <div className="text-sm text-gray-900">Active</div>
              </div>
              <div className="dialog-box bg-white p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600">
                  {questions.filter(q => !q.isActive).length}
                </div>
                <div className="text-sm text-gray-900">Inactive</div>
              </div>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`pixel-button font-bold py-2 px-4 rounded-lg ${
                      selectedCategory === cat
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    {cat} {cat !== 'all' && `(${categoryStats[cat] || 0})`}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Questions List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="dialog-box bg-white p-6 rounded-lg"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Questions ({filteredQuestions.length})
              </h2>
              <div className="space-y-4">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition cursor-pointer"
                    onClick={() => setSelectedQuestion(q)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                            {q.category}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                            {q.difficultyLevel}
                          </span>
                          {!q.isActive && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                              INACTIVE
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900">{q.questionText}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          Patient: {q.patientName}, {q.patientAge}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-700">
                          {q.answerOptions.length} options
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredQuestions.length === 0 && (
                  <p className="text-center text-gray-700 py-8">No questions in this category</p>
                )}
              </div>
            </motion.div>
          </>
        ) : (
          /* Question Detail View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setSelectedQuestion(null)}
              className="pixel-button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mb-6"
            >
              ← Back to Questions
            </button>

            <div className="dialog-box bg-white p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded font-semibold">
                  {selectedQuestion.category}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                  {selectedQuestion.difficultyLevel}
                </span>
                <span className={`px-3 py-1 rounded font-semibold ${
                  selectedQuestion.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedQuestion.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-gray-900">Question Details</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Patient Context:</div>
                  <div className="text-gray-900">
                    {selectedQuestion.patientName}, {selectedQuestion.patientAge} years old
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Question:</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedQuestion.questionText}</div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Hint:</div>
                  <div className="text-gray-900 italic">{selectedQuestion.hintText}</div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Answer Options:</div>
                  <div className="space-y-3">
                    {selectedQuestion.answerOptions.map((opt, index) => (
                      <div
                        key={opt.id}
                        className={`border-2 rounded-lg p-3 ${
                          opt.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-900">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {opt.optionText}
                              {opt.isCorrect && <span className="ml-2 text-green-600">✓ Correct</span>}
                            </div>
                            <div className="text-sm text-gray-700 mt-1">{opt.explanation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

