'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnalysisResult {
  strongAreas: string[];
  knowledgeGaps: string[];
  hintsRequired: string[];
  recommendations: string[];
  confidenceScores: Record<string, number>;
}

export default function ResultsPage({ params }: { params: { sessionId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const sessionId = params.sessionId;

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

      // Fetch responses
      const responsesRes = await fetch(`/api/responses?sessionId=${sessionId}`);
      if (responsesRes.ok) {
        const data = await responsesRes.json();
        setResponses(data.responses);
      }

      // Try to fetch existing analysis
      const analysisRes = await fetch(`/api/analyze?sessionId=${sessionId}`);
      
      if (analysisRes.ok) {
        const data = await analysisRes.json();
        setAnalysis(data.result);
      } else {
        // If no analysis exists, create one
        await performAnalysis();
      }
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const performAnalysis = async () => {
    try {
      setAnalyzing(true);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.result);
      }
    } catch (err) {
      console.error('Error analyzing session:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="dialog-box bg-white p-8 rounded-lg">
          <p className="text-xl font-bold">Loading results...</p>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="dialog-box bg-white p-8 rounded-lg text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-bold">🤖 AI is analyzing your performance...</p>
          <p className="text-gray-600 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-100 to-orange-100">
        <div className="dialog-box bg-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p>{error}</p>
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
  const radarData = analysis?.confidenceScores
    ? Object.entries(analysis.confidenceScores).map(([category, score]) => ({
        category: category.replace(/_/g, ' '),
        score
      }))
    : [];

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'var(--font-pixel)' }}>
            Game Complete! 🎉
          </h1>
          <p className="text-lg text-gray-700">Here's how you performed</p>
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
            <div className="text-sm text-gray-600 mt-1">Accuracy</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</div>
            <div className="text-sm text-gray-600 mt-1">Correct</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600">{hintsUsed}</div>
            <div className="text-sm text-gray-600 mt-1">Hints Used</div>
          </div>
          
          <div className="dialog-box bg-white p-6 rounded-lg text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-600">{averageTime}s</div>
            <div className="text-sm text-gray-600 mt-1">Avg. Time</div>
          </div>
        </motion.div>

        {/* Charts */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-8 mb-8"
          >
            {/* Radar Chart */}
            {radarData.length > 0 && (
              <div className="dialog-box bg-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Knowledge by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" style={{ fontSize: '12px' }} />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar Chart */}
            <div className="dialog-box bg-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Accuracy by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" style={{ fontSize: '12px' }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#82ca9d" name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* AI Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6 mb-8"
          >
            {/* Strong Areas */}
            {analysis.strongAreas.length > 0 && (
              <div className="dialog-box bg-green-50 p-6 rounded-lg border-4 border-green-400">
                <h3 className="text-xl font-bold text-green-800 mb-3">💪 Strong Areas</h3>
                <ul className="space-y-2">
                  {analysis.strongAreas.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Knowledge Gaps */}
            {analysis.knowledgeGaps.length > 0 && (
              <div className="dialog-box bg-yellow-50 p-6 rounded-lg border-4 border-yellow-400">
                <h3 className="text-xl font-bold text-yellow-800 mb-3">📚 Areas for Improvement</h3>
                <ul className="space-y-2">
                  {analysis.knowledgeGaps.map((gap, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">!</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="dialog-box bg-blue-50 p-6 rounded-lg border-4 border-blue-400">
                <h3 className="text-xl font-bold text-blue-800 mb-3">🎯 Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
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

