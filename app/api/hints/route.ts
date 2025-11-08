import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const hintSchema = z.object({
  sessionId: z.string(),
  questionId: z.string()
});

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
    const validatedData = hintSchema.parse(body);

    // Save hint usage
    const hintUsage = await prisma.hintUsage.create({
      data: {
        userId: session.user.id,
        questionId: validatedData.questionId,
        sessionId: validatedData.sessionId
      }
    });

    return NextResponse.json({
      message: 'Hint usage recorded',
      hintUsage
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    console.error('Error saving hint usage:', error);
    return NextResponse.json(
      { error: 'Failed to save hint usage' },
      { status: 500 }
    );
  }
}

// Get hint usage for a session
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

    const hints = await prisma.hintUsage.findMany({
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
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return NextResponse.json({
      hints,
      count: hints.length
    });
  } catch (error) {
    console.error('Error fetching hint usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hint usage' },
      { status: 500 }
    );
  }
}

