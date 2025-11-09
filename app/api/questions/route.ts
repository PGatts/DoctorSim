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
    const shuffle_param = searchParams.get('shuffle') !== 'false'; // Default to true, disable with shuffle=false

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

    // Helper function for better shuffling (Fisher-Yates algorithm)
    const shuffle = <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Apply shuffling if enabled
    let finalQuestions = questions;
    
    if (shuffle_param) {
      // Shuffle questions
      const shuffledQuestions = shuffle(questions);
      
      // Shuffle answer options for each question
      finalQuestions = shuffledQuestions.map(question => ({
        ...question,
        answerOptions: shuffle(question.answerOptions)
      }));
    }

    return NextResponse.json({
      questions: finalQuestions,
      count: finalQuestions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

