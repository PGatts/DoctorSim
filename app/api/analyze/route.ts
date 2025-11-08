import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { analyzeSessionWithAI, SessionAnalysisData } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Check if analysis already exists for this session
    const existingAnalysis = await prisma.analysisReport.findFirst({
      where: {
        userId: session.user.id,
        sessionId
      }
    });

    if (existingAnalysis) {
      return NextResponse.json({
        message: 'Analysis already exists',
        analysis: existingAnalysis
      });
    }

    // Fetch user responses for the session
    const responses = await prisma.userResponse.findMany({
      where: {
        userId: session.user.id,
        sessionId
      },
      include: {
        question: {
          select: {
            id: true,
            category: true,
            questionText: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found for this session' },
        { status: 404 }
      );
    }

    // Prepare data for AI analysis
    const analysisData: SessionAnalysisData = {
      questionsAnswered: responses.map(r => ({
        id: r.question.id,
        category: r.question.category,
        question: r.question.questionText,
        isCorrect: r.isCorrect,
        usedHint: r.usedHint,
        timeSpent: r.timeSpentSeconds
      })),
      correctAnswers: responses.filter(r => r.isCorrect).map(r => r.question.questionText),
      incorrectAnswers: responses.filter(r => !r.isCorrect).map(r => r.question.questionText),
      hintsUsed: responses.filter(r => r.usedHint).map(r => r.question.questionText),
      categories: [...new Set(responses.map(r => r.question.category))]
    };

    // Perform AI analysis
    const analysisResult = await analyzeSessionWithAI(analysisData);

    // Save analysis to database
    const savedAnalysis = await prisma.analysisReport.create({
      data: {
        userId: session.user.id,
        sessionId,
        analysisText: JSON.stringify(analysisResult),
        knowledgeGaps: analysisResult.knowledgeGaps,
        recommendations: analysisResult.recommendations,
        confidenceScores: analysisResult.confidenceScores
      }
    });

    return NextResponse.json({
      message: 'Analysis completed',
      analysis: savedAnalysis,
      result: analysisResult
    });
  } catch (error) {
    console.error('Error analyzing session:', error);
    return NextResponse.json(
      { error: 'Failed to analyze session' },
      { status: 500 }
    );
  }
}

// Get existing analysis for a session
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const analysis = await prisma.analysisReport.findFirst({
      where: {
        userId: session.user.id,
        sessionId
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Parse the stored analysis
    const result = JSON.parse(analysis.analysisText);

    return NextResponse.json({
      analysis,
      result
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

