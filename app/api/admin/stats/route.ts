import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get total users
    const totalUsers = await prisma.user.count({
      where: {
        role: 'PATIENT'
      }
    });

    // Get total sessions (unique session IDs from responses)
    const sessions = await prisma.userResponse.findMany({
      select: {
        sessionId: true
      },
      distinct: ['sessionId']
    });
    const totalSessions = sessions.length;

    // Get total questions answered
    const totalResponses = await prisma.userResponse.count();

    // Calculate overall accuracy
    const correctResponses = await prisma.userResponse.count({
      where: {
        isCorrect: true
      }
    });
    const overallAccuracy = totalResponses > 0 
      ? Math.round((correctResponses / totalResponses) * 100) 
      : 0;

    // Get total hints used
    const totalHints = await prisma.hintUsage.count();

    // Get category performance
    const responses = await prisma.userResponse.findMany({
      include: {
        question: {
          select: {
            category: true
          }
        }
      }
    });

    const categoryStats: Record<string, { total: number; correct: number }> = {};
    responses.forEach(r => {
      const category = r.question.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, correct: 0 };
      }
      categoryStats[category].total++;
      if (r.isCorrect) {
        categoryStats[category].correct++;
      }
    });

    const categoryPerformance = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      total: stats.total
    }));

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.userResponse.groupBy({
      by: ['timestamp'],
      _count: true,
      where: {
        timestamp: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Get most difficult questions (lowest accuracy)
    const questionStats: Record<string, { correct: number; total: number; questionText: string }> = {};
    
    const allResponses = await prisma.userResponse.findMany({
      include: {
        question: {
          select: {
            id: true,
            questionText: true
          }
        }
      }
    });

    allResponses.forEach(r => {
      const qId = r.question.id;
      if (!questionStats[qId]) {
        questionStats[qId] = {
          correct: 0,
          total: 0,
          questionText: r.question.questionText
        };
      }
      questionStats[qId].total++;
      if (r.isCorrect) {
        questionStats[qId].correct++;
      }
    });

    const difficultQuestions = Object.entries(questionStats)
      .map(([id, stats]) => ({
        id,
        questionText: stats.questionText,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        attempts: stats.total
      }))
      .filter(q => q.attempts >= 3) // Only questions with at least 3 attempts
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalSessions,
        totalResponses,
        overallAccuracy,
        totalHints
      },
      categoryPerformance,
      recentActivity,
      difficultQuestions
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

