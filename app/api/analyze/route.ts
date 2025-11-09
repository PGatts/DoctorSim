import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { analyzeSessionWithAI, SessionAnalysisData } from '@/lib/ai';

export async function POST(request: NextRequest) {
  console.log('🔵 POST /api/analyze called');
  try {
    const session = await getServerSession(authOptions);
    console.log('🔵 Session retrieved:', session ? 'exists' : 'null', 'User ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized analysis request - no session or user ID');
      console.log('Session details:', JSON.stringify(session, null, 2));
      return NextResponse.json(
        { error: 'Unauthorized - no valid session' },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();
    console.log(`📊 Analysis requested for session: ${sessionId} by user: ${session.user.id}`);
    
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
      console.log(`ℹ️  Analysis already exists for session: ${sessionId}, deleting and regenerating...`);
      // Delete the existing analysis to regenerate
      await prisma.analysisReport.delete({
        where: {
          id: existingAnalysis.id
        }
      });
    }

    // Fetch user responses for the session
    console.log(`📥 Fetching responses for session: ${sessionId}`);
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

    console.log(`📦 Found ${responses.length} responses for session: ${sessionId}`);

    if (responses.length === 0) {
      console.log(`⚠️  No responses found for session: ${sessionId}`);
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

    console.log(`🔍 Starting analysis for ${analysisData.questionsAnswered.length} questions across ${analysisData.categories.length} categories`);

    // Perform AI analysis
    const analysisResult = await analyzeSessionWithAI(analysisData);

    console.log(`✅ Analysis completed with type: ${analysisResult.analysisType || 'unknown'}`);

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

    console.log(`💾 Analysis saved to database for session: ${sessionId}`);

    return NextResponse.json({
      message: 'Analysis completed',
      analysis: savedAnalysis,
      result: analysisResult
    });
  } catch (error) {
    console.error('❌ Error analyzing session:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Send detailed error response
    return NextResponse.json(
      { 
        error: 'Failed to analyze session', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined
      },
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

    // Admins can view any session's analysis
    const whereClause = session.user.role === 'ADMIN' 
      ? { sessionId }
      : { userId: session.user.id, sessionId };

    const analysis = await prisma.analysisReport.findFirst({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
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
      result,
      user: analysis.user
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

