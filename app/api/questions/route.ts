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

    // Helper function for better shuffling (Fisher-Yates algorithm)
    const shuffle = <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Fetch ALL questions matching the filter (no limit, no ordering)
    // This ensures we get a truly random sample from all categories
    const allQuestions = await prisma.question.findMany({
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
      }
    });

    console.log(`📚 Found ${allQuestions.length} total questions in database`);

    // Apply shuffling if enabled
    let finalQuestions = allQuestions;
    
    if (shuffle_param) {
      // Shuffle ALL questions first to get random selection
      const shuffledQuestions = shuffle(allQuestions);
      
      // Take only the requested limit from the shuffled set
      const selectedQuestions = shuffledQuestions.slice(0, limit);
      
      // Shuffle answer options for each selected question
      finalQuestions = selectedQuestions.map(question => ({
        ...question,
        answerOptions: shuffle(question.answerOptions)
      }));
      
      // Log category distribution for verification
      const categoryDistribution = finalQuestions.reduce((acc: Record<string, number>, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log(`🎲 Randomly selected ${finalQuestions.length} questions from ${allQuestions.length} total`);
      console.log(`📊 Category distribution:`, categoryDistribution);
    } else {
      // If shuffling is disabled (admin view), just take the first `limit` questions
      finalQuestions = allQuestions.slice(0, limit);
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

