import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const responseSchema = z.object({
  sessionId: z.string(),
  questionId: z.string(),
  selectedOptionId: z.string(),
  isCorrect: z.boolean(),
  timeSpentSeconds: z.number(),
  usedHint: z.boolean()
});

const bulkResponseSchema = z.array(responseSchema);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input - support both single and bulk responses
    let responses;
    try {
      responses = bulkResponseSchema.parse(body.responses || [body]);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Save all responses
    const savedResponses = await Promise.all(
      responses.map(async (response) => {
        return await prisma.userResponse.create({
          data: {
            userId: session.user.id,
            questionId: response.questionId,
            selectedOptionId: response.selectedOptionId,
            isCorrect: response.isCorrect,
            timeSpentSeconds: response.timeSpentSeconds,
            usedHint: response.usedHint,
            sessionId: response.sessionId
          }
        });
      })
    );

    return NextResponse.json({
      message: 'Responses saved successfully',
      count: savedResponses.length
    });
  } catch (error) {
    console.error('Error saving responses:', error);
    return NextResponse.json(
      { error: 'Failed to save responses' },
      { status: 500 }
    );
  }
}

// Get user responses for a session
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

    const responses = await prisma.userResponse.findMany({
      where: {
        userId: session.user.id,
        sessionId
      },
      include: {
        question: {
          select: {
            questionText: true,
            category: true
          }
        },
        selectedOption: {
          select: {
            optionText: true,
            isCorrect: true,
            explanation: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return NextResponse.json({
      responses,
      count: responses.length
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

