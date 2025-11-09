'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface UserStats {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  totalSessions: number;
  totalQuestions: number;
  accuracy: number;
}

interface UserDetail {
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
  };
  sessions: Array<{
    sessionId: string;
    date: string;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    categories: string[];
  }>;
  totalSessions: number;
  totalQuestions: number;
  overallAccuracy: number;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      loadUsers();
    }
  }, [status, session]);

  const loadUserDetail = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
      }
    } catch (error) {
      console.error('Error loading user detail:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="dialog-box bg-white p-8 rounded-lg">
          <p className="text-xl font-bold text-gray-900">Loading users...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            User Management
          </h1>
          <p className="text-lg text-gray-900">View and analyze user activity</p>
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
            <button className="pixel-button bg-purple-500 text-white font-bold py-2 px-4 rounded-lg">
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

        {!selectedUser ? (
          <>
            {/* Search */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-3 border-black rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </motion.div>

            {/* Users List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="dialog-box bg-white p-6 rounded-lg"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                All Users ({filteredUsers.length})
              </h2>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition cursor-pointer"
                    onClick={() => loadUserDetail(user.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{user.name || 'No name'}</h3>
                        <p className="text-sm text-gray-700">{user.email}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{user.accuracy}%</div>
                        <div className="text-sm text-gray-700">{user.totalSessions} sessions</div>
                        <div className="text-xs text-gray-600">{user.totalQuestions} questions</div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-gray-700 py-8">No users found</p>
                )}
              </div>
            </motion.div>
          </>
        ) : (
          /* User Detail View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setSelectedUser(null)}
              className="pixel-button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mb-6"
            >
              ← Back to Users
            </button>

            {/* User Info */}
            <div className="dialog-box bg-white p-6 rounded-lg mb-6">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">{selectedUser.user.name || 'No name'}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-700">Email</div>
                  <div className="font-semibold text-gray-900">{selectedUser.user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-700">Sessions</div>
                  <div className="font-semibold text-gray-900">{selectedUser.totalSessions}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-700">Questions</div>
                  <div className="font-semibold text-gray-900">{selectedUser.totalQuestions}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-700">Accuracy</div>
                  <div className="font-semibold text-gray-900">{selectedUser.overallAccuracy}%</div>
                </div>
              </div>
            </div>

            {/* Session History */}
            <div className="dialog-box bg-white p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Session History</h3>
              <div className="space-y-4">
                {selectedUser.sessions.map((s) => (
                  <div key={s.sessionId} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm text-gray-700">
                          {new Date(s.date).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Categories: {s.categories.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-purple-600">{s.accuracy}%</div>
                        <div className="text-sm text-gray-700">
                          {s.correctAnswers}/{s.totalQuestions}
                        </div>
                      </div>
                    </div>
                    <Link href={`/results/${s.sessionId}`}>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                        View Details →
                      </button>
                    </Link>
                  </div>
                ))}
                {selectedUser.sessions.length === 0 && (
                  <p className="text-center text-gray-700 py-8">No sessions yet</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

