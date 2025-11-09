'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminStats {
  overview: {
    totalUsers: number;
    totalSessions: number;
    totalResponses: number;
    overallAccuracy: number;
    totalHints: number;
  };
  categoryPerformance: Array<{
    category: string;
    accuracy: number;
    total: number;
  }>;
  difficultQuestions: Array<{
    id: string;
    questionText: string;
    accuracy: number;
    attempts: number;
  }>;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      loadStats();
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="dialog-box bg-white p-8 rounded-lg">
          <p className="text-xl font-bold text-gray-900">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

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
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-900">System Overview & Analytics</p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8 flex-wrap"
        >
          <Link href="/admin/dashboard">
            <button className="pixel-button bg-purple-500 text-white font-bold py-2 px-4 rounded-lg">
              Dashboard
            </button>
          </Link>
          <Link href="/admin/users">
            <button className="pixel-button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              Users
            </button>
          </Link>
          <Link href="/admin/questions">
            <button className="pixel-button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              Questions
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="pixel-button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              Exit Admin
            </button>
          </Link>
        </motion.div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="dialog-box bg-white p-4 rounded-lg mb-8"
        >
          <h3 className="text-lg font-bold mb-3 text-gray-900">Export Data</h3>
          <div className="flex gap-3 flex-wrap">
            <a href="/api/admin/export?type=users" download>
              <button className="pixel-button bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                📊 Export Users CSV
              </button>
            </a>
            <a href="/api/admin/export?type=responses" download>
              <button className="pixel-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                📝 Export Responses CSV
              </button>
            </a>
            <a href="/api/admin/export?type=analytics" download>
              <button className="pixel-button bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                📈 Export Analytics CSV
              </button>
            </a>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-blue-600">{stats.overview.totalUsers}</div>
            <div className="text-sm text-gray-900 mt-1">Total Users</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-600">{stats.overview.totalSessions}</div>
            <div className="text-sm text-gray-900 mt-1">Game Sessions</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-purple-600">{stats.overview.totalResponses}</div>
            <div className="text-sm text-gray-900 mt-1">Questions Answered</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-orange-600">{stats.overview.overallAccuracy}%</div>
            <div className="text-sm text-gray-900 mt-1">Overall Accuracy</div>
          </div>

          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-yellow-600">{stats.overview.totalHints}</div>
            <div className="text-sm text-gray-900 mt-1">Hints Used</div>
          </div>
        </motion.div>

        {/* Category Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dialog-box bg-white p-6 rounded-lg mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Category Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy %" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Difficult Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="dialog-box bg-white p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Most Difficult Questions</h2>
          <div className="space-y-4">
            {stats.difficultQuestions.map((q, index) => (
              <div key={q.id} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-bold text-gray-900">#{index + 1}</span>
                    <p className="text-gray-900 mt-1">{q.questionText}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-red-600">{q.accuracy}%</div>
                    <div className="text-sm text-gray-700">{q.attempts} attempts</div>
                  </div>
                </div>
              </div>
            ))}
            {stats.difficultQuestions.length === 0 && (
              <p className="text-center text-gray-700 py-8">Not enough data yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

