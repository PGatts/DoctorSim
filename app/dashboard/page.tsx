'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SessionSummary {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  hintsUsed: number;
  date: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      // Redirect admins to admin dashboard
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
        return;
      }
      loadSessions();
    }
  }, [status, session, router]);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="dialog-box bg-white p-8 rounded-lg">
          <p className="text-xl font-bold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-purple-50 to-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'var(--font-pixel)' }}>
            Your Dashboard
          </h1>
          <p className="text-lg text-gray-900">Welcome back, {session?.user?.name}!</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="dialog-box bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Games Played</h3>
            <div className="text-4xl font-bold text-blue-600">{sessions.length}</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg. Accuracy</h3>
            <div className="text-4xl font-bold text-green-600">
              {sessions.length > 0 
                ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
                : 0}%
            </div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions Answered</h3>
            <div className="text-4xl font-bold text-purple-600">
              {sessions.reduce((sum, s) => sum + s.totalQuestions, 0)}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <Link href="/game" className="flex-1">
            <button className="pixel-button bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg w-full">
              🎮 Start New Game
            </button>
          </Link>
        </motion.div>

        {/* Session History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="dialog-box bg-white p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Recent Sessions</h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-900 text-lg mb-4">No game sessions yet</p>
              <p className="text-gray-700">Start your first game to see your progress here!</p>
              <Link href="/game">
                <button className="pixel-button bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg mt-4">
                  Play Now
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((gameSession, index) => (
                <div key={gameSession.sessionId} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Session #{sessions.length - index}</h3>
                      <p className="text-sm text-gray-700">{new Date(gameSession.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{gameSession.accuracy}%</div>
                      <div className="text-sm text-gray-700">
                        {gameSession.correctAnswers}/{gameSession.totalQuestions} correct
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-700 mb-3">
                    <span>💡 {gameSession.hintsUsed} hints used</span>
                  </div>
                  <Link href={`/results/${gameSession.sessionId}`}>
                    <button className="pixel-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto">
                      🤖 View AI Insights & Results
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 dialog-box bg-blue-50 p-6 rounded-lg border-2 border-blue-300"
        >
          <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Tips for Better Learning</h3>
          <ul className="space-y-2 text-sm text-gray-900">
            <li>• Play regularly to reinforce your healthcare knowledge</li>
            <li>• Review your results to identify areas for improvement</li>
            <li>• Use hints strategically when you're unsure</li>
            <li>• Try to improve your accuracy with each session</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

