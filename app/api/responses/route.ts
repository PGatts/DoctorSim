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
  console.log('🔵 POST /api/responses called');
  try {
    const session = await getServerSession(authOptions);
    console.log('🔵 Session:', session ? 'exists' : 'null', 'User ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📥 Received body:', JSON.stringify(body, null, 2));
    
    // Validate input - support both single and bulk responses
    let responses;
    try {
      const dataToValidate = body.responses || [body];
      console.log('🔍 Validating data:', JSON.stringify(dataToValidate, null, 2));
      responses = bulkResponseSchema.parse(dataToValidate);
      console.log('✅ Validation passed, responses:', responses.length);
    } catch (validationError) {
      console.error('❌ Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid request data', details: validationError },
        { status: 400 }
      );
    }

    // Save all responses
    console.log('💾 Saving', responses.length, 'responses to database...');
    const savedResponses = await Promise.all(
      responses.map(async (response) => {
        console.log('💾 Saving response for question:', response.questionId);
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

    console.log('✅ Successfully saved', savedResponses.length, 'responses');
    return NextResponse.json({
      message: 'Responses saved successfully',
      count: savedResponses.length
    });
  } catch (error) {
    console.error('❌ Error saving responses:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to save responses', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Admins can view any session's responses
    const whereClause = session.user.role === 'ADMIN' 
      ? { sessionId }
      : { userId: session.user.id, sessionId };

    const responses = await prisma.userResponse.findMany({
      where: whereClause,
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
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Get user info from first response
    const userInfo = responses.length > 0 ? responses[0].user : null;

    return NextResponse.json({
      responses,
      count: responses.length,
      user: userInfo
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

