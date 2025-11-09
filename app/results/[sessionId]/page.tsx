'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnalysisResult {
  strongAreas: string[];
  knowledgeGaps: string[];
  hintsRequired: string[];
  recommendations: string[];
  confidenceScores: Record<string, number>;
  analysisType?: 'ai' | 'basic';
}

interface UserInfo {
  email: string;
  name: string | null;
}

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [sessionUser, setSessionUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState('');

  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;
  const isAdmin = session?.user?.role === 'ADMIN';
  const isOwnSession = !isAdmin; // If not admin, assume it's their own session (API will verify)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      loadResults();
    }
  }, [status, sessionId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading results for session:', sessionId);

      // Fetch responses
      const responsesRes = await fetch(`/api/responses?sessionId=${sessionId}`);
      if (responsesRes.ok) {
        const data = await responsesRes.json();
        console.log('✅ Loaded responses:', data.responses.length);
        setResponses(data.responses);
        setSessionUser(data.user);
      } else {
        console.error('❌ Failed to load responses:', responsesRes.status);
        setError('Could not load session data');
        setLoading(false);
        return;
      }

      // Try to fetch existing analysis
      console.log('🔍 Checking for existing analysis...');
      const analysisRes = await fetch(`/api/analyze?sessionId=${sessionId}`);
      
      if (analysisRes.ok) {
        const data = await analysisRes.json();
        console.log('✅ Found existing analysis:', data.result);
        setAnalysis(data.result);
        // Update session user from analysis if available
        if (data.user) {
          setSessionUser(data.user);
        }
      } else {
        console.log('⚠️ No existing analysis found, status:', analysisRes.status);
        // If no analysis exists and user owns the session, create one
        if (!isAdmin) {
          console.log('🔨 Creating new analysis...');
          await performAnalysis();
        } else {
          console.log('ℹ️ Admin view - not creating analysis automatically');
        }
      }
    } catch (err) {
      console.error('❌ Error loading results:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const performAnalysis = async () => {
    try {
      setAnalyzing(true);
      console.log('📤 Sending analysis request...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      console.log('📥 Analysis response status:', response.status);
      console.log('📥 Analysis response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Analysis completed:', data.result);
        setAnalysis(data.result);
      } else {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseErr) {
          const text = await response.text();
          console.error('❌ Failed to parse error response:', text);
          errorData = { error: 'Failed to parse response', rawText: text };
        }
        console.error('❌ Analysis failed:', errorData);
        console.error('❌ Response status:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('❌ Error analyzing session:', err);
      if (err instanceof Error) {
        console.error('❌ Error message:', err.message);
        console.error('❌ Error stack:', err.stack);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="dialog-box bg-white p-8 rounded-lg">
          <p className="text-xl font-bold text-gray-900">Loading results...</p>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="dialog-box bg-white p-8 rounded-lg text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-bold text-gray-900">🤖 AI is analyzing performance...</p>
          <p className="text-gray-700 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-100 to-orange-100">
        <div className="dialog-box bg-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-900">{error}</p>
          <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"}>
            <button className="pixel-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mt-4">
              Go Back
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const totalQuestions = responses.length;
  const correctAnswers = responses.filter(r => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const hintsUsed = responses.filter(r => r.usedHint).length;
  const averageTime = totalQuestions > 0 
    ? Math.round(responses.reduce((sum, r) => sum + r.timeSpentSeconds, 0) / totalQuestions) 
    : 0;


  // Prepare chart data
  const categoryData = responses.reduce((acc: any[], response) => {
    const category = response.question.category;
    const existing = acc.find(item => item.category === category);
    
    if (existing) {
      existing.total++;
      if (response.isCorrect) existing.correct++;
    } else {
      acc.push({
        category,
        total: 1,
        correct: response.isCorrect ? 1 : 0
      });
    }
    
    return acc;
  }, []).map(item => ({
    ...item,
    accuracy: Math.round((item.correct / item.total) * 100)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Admin Header - Only shown for admins */}
        {isAdmin && sessionUser && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dialog-box bg-purple-50 border-4 border-purple-400 p-4 rounded-lg mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-purple-900">ADMIN VIEW - Viewing User Session</div>
                <div className="text-lg font-bold text-gray-900">{sessionUser.name || 'No name'}</div>
                <div className="text-sm text-gray-700">{sessionUser.email}</div>
              </div>
              <Link href="/admin/users">
                <button className="pixel-button bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">
                  ← Back to Users
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'var(--font-pixel)' }}>
            {isOwnSession ? 'Game Complete! 🎉' : 'Session Results'}
          </h1>
          <p className="text-lg text-gray-700">
            {isOwnSession ? "Here's how you performed" : 'Session performance analysis'}
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600">{accuracy}%</div>
            <div className="text-sm text-gray-700 mt-1">Accuracy</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</div>
            <div className="text-sm text-gray-700 mt-1">Correct</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600">{hintsUsed}</div>
            <div className="text-sm text-gray-700 mt-1">Hints Used</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-600">{averageTime}s</div>
            <div className="text-sm text-gray-700 mt-1">Avg. Time</div>
          </div>
        </motion.div>

        {/* AI Analysis Section - Most Important */}
        {analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="dialog-box bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-400 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🤖</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {analysis.analysisType === 'ai' ? 'AI-Powered Insights' : 'Performance Analysis'}
                    </h2>
                    <p className="text-sm text-gray-700">
                      Personalized analysis of {isOwnSession ? 'your' : 'user'} performance
                    </p>
                  </div>
                </div>
                {analysis.analysisType && (
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    analysis.analysisType === 'ai' 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {analysis.analysisType === 'ai' ? '✨ AI-Generated' : '📊 Basic Analysis'}
                  </div>
                )}
              </div>
              {analysis.analysisType === 'basic' && (
                <div className="mt-2 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded">
                  <p className="text-xs text-yellow-900">
                    <span className="font-bold">Note:</span> AI analysis is currently unavailable. 
                    This analysis is based on statistical patterns from your session data.
                    {isAdmin && ' To enable AI insights, configure the OPENAI_API_KEY in Vercel settings.'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Strong Areas */}
              {analysis.strongAreas && analysis.strongAreas.length > 0 && (
                <div className="dialog-box bg-green-50 p-6 rounded-lg border-4 border-green-400">
                  <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💪</span> Strong Areas
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    {isOwnSession ? 'You' : 'This user'} demonstrated excellent understanding in these areas:
                  </p>
                  <ul className="space-y-2">
                    {analysis.strongAreas.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold text-xl">✓</span>
                        <span className="text-gray-900 font-semibold">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Knowledge Gaps */}
              {analysis.knowledgeGaps && analysis.knowledgeGaps.length > 0 && (
                <div className="dialog-box bg-yellow-50 p-6 rounded-lg border-4 border-yellow-400">
                  <h3 className="text-xl font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">📚</span> Areas for Improvement
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    {isOwnSession ? 'You may benefit' : 'This user may benefit'} from reviewing these topics:
                  </p>
                  <ul className="space-y-2">
                    {analysis.knowledgeGaps.map((gap, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold text-xl">!</span>
                        <span className="text-gray-900 font-semibold">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hints Analysis */}
              {analysis.hintsRequired && analysis.hintsRequired.length > 0 && (
                <div className="dialog-box bg-orange-50 p-6 rounded-lg border-4 border-orange-400">
                  <h3 className="text-xl font-bold text-orange-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💡</span> Topics Where Hints Were Needed
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    {isOwnSession ? 'You' : 'User'} requested hints for questions in these categories:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.hintsRequired.map((hint, index) => (
                      <span key={index} className="px-3 py-1 bg-orange-200 text-orange-900 rounded-full font-semibold text-sm">
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="dialog-box bg-blue-50 p-6 rounded-lg border-4 border-blue-400">
                  <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🎯</span> Personalized Recommendations
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Based on this session, here are targeted recommendations:
                  </p>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold text-xl">→</span>
                        <span className="text-gray-900">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empty Analysis Warning */}
              {(!analysis.strongAreas || analysis.strongAreas.length === 0) &&
               (!analysis.knowledgeGaps || analysis.knowledgeGaps.length === 0) &&
               (!analysis.hintsRequired || analysis.hintsRequired.length === 0) &&
               (!analysis.recommendations || analysis.recommendations.length === 0) && (
                <div className="dialog-box bg-red-50 p-6 rounded-lg border-4 border-red-400">
                  <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span> Empty Analysis
                  </h3>
                  <p className="text-gray-900 mb-2">
                    The analysis was created but contains no data. This might be because:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>No responses were found for this session</li>
                    <li>There was an error during analysis</li>
                    <li>The analysis data was not saved properly</li>
                  </ul>
                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        // Delete old analysis and regenerate
                        console.log('🔄 Regenerating analysis...');
                        await performAnalysis();
                      }}
                      className="pixel-button bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      🔄 Regenerate Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="dialog-box bg-yellow-50 border-4 border-yellow-400 p-6 rounded-lg text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Not Available</h3>
              <p className="text-gray-700 mb-4">
                No performance analysis found for this session.
              </p>
              {!isAdmin && (
                <button
                  onClick={performAnalysis}
                  disabled={analyzing}
                  className="pixel-button bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg"
                >
                  {analyzing ? '⏳ Analyzing...' : '🤖 Generate Analysis Now'}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Accuracy Chart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="dialog-box bg-white p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Accuracy by Category</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" style={{ fontSize: '14px' }} />
                <YAxis domain={[0, 100]} label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#82ca9d" name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Question-by-Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="dialog-box bg-white p-6 rounded-lg mb-8"
        >
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Question Breakdown</h3>
          <div className="space-y-4">
            {responses.map((response, index) => (
              <div 
                key={index} 
                className={`border-2 rounded-lg p-4 ${
                  response.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold ${response.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Question {index + 1}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-semibold">
                        {response.question.category}
                      </span>
                      {response.usedHint && (
                        <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs font-semibold">
                          💡 Hint Used
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 font-semibold mb-2">{response.question.questionText}</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Answer:</span> {response.selectedOption.optionText}
                    </p>
                    {!response.isCorrect && (
                      <p className="text-sm text-gray-700 mt-1 italic">
                        {response.selectedOption.explanation}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold ${response.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {response.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-gray-600">{response.timeSpentSeconds}s</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {!isAdmin && (
            <>
              <Link href="/game">
                <button className="pixel-button bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto">
                  Play Again
                </button>
              </Link>
              
              <Link href="/dashboard">
                <button className="pixel-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto">
                  View Dashboard
                </button>
              </Link>
            </>
          )}
          
          {isAdmin && (
            <Link href="/admin/users">
              <button className="pixel-button bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto">
                Back to Users
              </button>
            </Link>
          )}
          
          <Link href="/">
            <button className="pixel-button bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto">
              Home
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
