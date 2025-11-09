import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // If userId provided, return detailed user info
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Get user's sessions
      const responses = await prisma.userResponse.findMany({
        where: { userId },
        include: {
          question: {
            select: {
              category: true,
              questionText: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      });

      // Group by session
      const sessionMap: Record<string, any> = {};
      responses.forEach(r => {
        if (!sessionMap[r.sessionId]) {
          sessionMap[r.sessionId] = {
            sessionId: r.sessionId,
            responses: [],
            correctCount: 0,
            totalCount: 0,
            categories: new Set(),
            date: r.timestamp
          };
        }
        sessionMap[r.sessionId].responses.push(r);
        sessionMap[r.sessionId].totalCount++;
        if (r.isCorrect) sessionMap[r.sessionId].correctCount++;
        sessionMap[r.sessionId].categories.add(r.question.category);
      });

      const sessions = Object.values(sessionMap).map(s => ({
        sessionId: s.sessionId,
        date: s.date,
        totalQuestions: s.totalCount,
        correctAnswers: s.correctCount,
        accuracy: Math.round((s.correctCount / s.totalCount) * 100),
        categories: Array.from(s.categories)
      }));

      // Get analysis reports
      const analyses = await prisma.analysisReport.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      return NextResponse.json({
        user,
        sessions,
        analyses,
        totalSessions: sessions.length,
        totalQuestions: responses.length,
        overallAccuracy: responses.length > 0 
          ? Math.round((responses.filter(r => r.isCorrect).length / responses.length) * 100)
          : 0
      });
    }

    // Otherwise, return list of all users with stats
    const users = await prisma.user.findMany({
      where: {
        role: 'PATIENT'
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const responses = await prisma.userResponse.findMany({
          where: { userId: user.id }
        });

        const sessions = new Set(responses.map(r => r.sessionId)).size;
        const correctCount = responses.filter(r => r.isCorrect).length;
        const accuracy = responses.length > 0 
          ? Math.round((correctCount / responses.length) * 100)
          : 0;

        return {
          ...user,
          totalSessions: sessions,
          totalQuestions: responses.length,
          accuracy
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      total: usersWithStats.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

