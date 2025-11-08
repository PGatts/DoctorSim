import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filter
    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficultyLevel = difficulty.toUpperCase();
    }

    // Fetch random questions
    const questions = await prisma.question.findMany({
      where,
      include: {
        answerOptions: {
          select: {
            id: true,
            optionText: true,
            isCorrect: true,
            explanation: true,
            educationalResourceLink: true
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Shuffle questions for variety
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      questions: shuffledQuestions,
      count: shuffledQuestions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

