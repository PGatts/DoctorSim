import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all unique sessions for the user
    const responses = await prisma.userResponse.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        sessionId: true,
        isCorrect: true,
        usedHint: true,
        timestamp: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Group by sessionId
    const sessionMap: Record<string, any> = {};
    
    responses.forEach(r => {
      if (!sessionMap[r.sessionId]) {
        sessionMap[r.sessionId] = {
          sessionId: r.sessionId,
          totalQuestions: 0,
          correctAnswers: 0,
          hintsUsed: 0,
          date: r.timestamp
        };
      }
      
      sessionMap[r.sessionId].totalQuestions++;
      if (r.isCorrect) sessionMap[r.sessionId].correctAnswers++;
      if (r.usedHint) sessionMap[r.sessionId].hintsUsed++;
      
      // Keep the earliest timestamp for the session
      if (r.timestamp < sessionMap[r.sessionId].date) {
        sessionMap[r.sessionId].date = r.timestamp;
      }
    });

    // Convert to array and add accuracy
    const sessions = Object.values(sessionMap).map((s: any) => ({
      sessionId: s.sessionId,
      totalQuestions: s.totalQuestions,
      correctAnswers: s.correctAnswers,
      accuracy: s.totalQuestions > 0 
        ? Math.round((s.correctAnswers / s.totalQuestions) * 100)
        : 0,
      hintsUsed: s.hintsUsed,
      date: s.date.toISOString()
    }));

    return NextResponse.json({
      sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

