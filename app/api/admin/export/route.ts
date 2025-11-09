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
    const exportType = searchParams.get('type') || 'users';

    if (exportType === 'users') {
      // Export user data with statistics
      const users = await prisma.user.findMany({
        where: {
          role: 'PATIENT'
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
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
            Email: user.email,
            Name: user.name || 'N/A',
            'Total Sessions': sessions,
            'Total Questions': responses.length,
            'Accuracy (%)': accuracy,
            'Joined Date': new Date(user.createdAt).toLocaleDateString()
          };
        })
      );

      // Convert to CSV
      const headers = Object.keys(usersWithStats[0] || {});
      const csvRows = [
        headers.join(','),
        ...usersWithStats.map(row => 
          headers.map(header => JSON.stringify(row[header as keyof typeof row] || '')).join(',')
        )
      ];
      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${Date.now()}.csv"`
        }
      });
    } else if (exportType === 'responses') {
      // Export all response data
      const responses = await prisma.userResponse.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          },
          question: {
            select: {
              category: true,
              questionText: true
            }
          },
          selectedOption: {
            select: {
              optionText: true,
              isCorrect: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      });

      const exportData = responses.map(r => ({
        'User Email': r.user.email,
        'User Name': r.user.name || 'N/A',
        'Session ID': r.sessionId,
        'Category': r.question.category,
        'Question': r.question.questionText,
        'Answer': r.selectedOption.optionText,
        'Correct': r.isCorrect ? 'Yes' : 'No',
        'Time Taken (s)': r.timeTaken,
        'Timestamp': new Date(r.timestamp).toLocaleString()
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => JSON.stringify(row[header as keyof typeof row] || '')).join(',')
        )
      ];
      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="responses-export-${Date.now()}.csv"`
        }
      });
    } else if (exportType === 'analytics') {
      // Export aggregate analytics
      const totalUsers = await prisma.user.count({ where: { role: 'PATIENT' } });
      const totalResponses = await prisma.userResponse.count();
      const correctResponses = await prisma.userResponse.count({ where: { isCorrect: true } });
      
      const responses = await prisma.userResponse.findMany({
        include: {
          question: {
            select: {
              category: true
            }
          }
        }
      });

      const categoryStats: Record<string, { total: number; correct: number }> = {};
      responses.forEach(r => {
        const category = r.question.category;
        if (!categoryStats[category]) {
          categoryStats[category] = { total: 0, correct: 0 };
        }
        categoryStats[category].total++;
        if (r.isCorrect) {
          categoryStats[category].correct++;
        }
      });

      const exportData = [
        {
          'Metric': 'Total Users',
          'Value': totalUsers
        },
        {
          'Metric': 'Total Responses',
          'Value': totalResponses
        },
        {
          'Metric': 'Overall Accuracy (%)',
          'Value': totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0
        },
        ...Object.entries(categoryStats).map(([category, stats]) => ({
          'Metric': `${category} Accuracy (%)`,
          'Value': Math.round((stats.correct / stats.total) * 100)
        }))
      ];

      // Convert to CSV
      const headers = ['Metric', 'Value'];
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => JSON.stringify(row[header as keyof typeof row] || '')).join(',')
        )
      ];
      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-export-${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

