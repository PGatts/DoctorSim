/**
 * AI integration for knowledge gap analysis
 */

export interface SessionAnalysisData {
  questionsAnswered: Array<{
    id: string;
    category: string;
    question: string;
    isCorrect: boolean;
    usedHint: boolean;
    timeSpent: number;
  }>;
  correctAnswers: string[];
  incorrectAnswers: string[];
  hintsUsed: string[];
  categories: string[];
}

export interface AnalysisResult {
  strongAreas: string[];
  knowledgeGaps: string[];
  hintsRequired: string[];
  recommendations: string[];
  confidenceScores: Record<string, number>;
  analysisType?: 'ai' | 'basic';
}

export async function analyzeSessionWithAI(
  sessionData: SessionAnalysisData
): Promise<AnalysisResult & { analysisType?: 'ai' | 'basic' }> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    // Fallback to basic analysis if no API key
    console.log('⚠️  No AI API key configured, using basic analysis');
    console.log('To enable AI analysis, set OPENAI_API_KEY environment variable');
    return { ...performBasicAnalysis(sessionData), analysisType: 'basic' };
  }

  const prompt = createAnalysisPrompt(sessionData);
  
  try {
    // OpenAI API call
    if (process.env.OPENAI_API_KEY) {
      console.log('🤖 Attempting OpenAI analysis with model: gpt-4o-mini');
      const result = await analyzeWithOpenAI(prompt, sessionData);
      console.log('✅ OpenAI analysis completed successfully');
      return { ...result, analysisType: 'ai' };
    }
    
    return { ...performBasicAnalysis(sessionData), analysisType: 'basic' };
  } catch (error) {
    console.error('❌ AI analysis error, falling back to basic analysis:', error);
    // Always fall back to basic analysis on error
    return { ...performBasicAnalysis(sessionData), analysisType: 'basic' };
  }
}

function createAnalysisPrompt(data: SessionAnalysisData): string {
  return `Analyze this patient's healthcare knowledge based on their game session:

Session Data:
- Total questions answered: ${data.questionsAnswered.length}
- Correct answers: ${data.correctAnswers.length}
- Incorrect answers: ${data.incorrectAnswers.length}
- Hints used: ${data.hintsUsed.length}
- Categories covered: ${data.categories.join(', ')}

Questions breakdown:
${data.questionsAnswered.map(q => `
  - Category: ${q.category}
  - Question: ${q.question}
  - Result: ${q.isCorrect ? 'Correct' : 'Incorrect'}
  - Used hint: ${q.usedHint ? 'Yes' : 'No'}
  - Time spent: ${q.timeSpent}s
`).join('\n')}

Please provide a JSON response with the following structure:
{
  "strongAreas": ["array of areas where the patient showed good knowledge"],
  "knowledgeGaps": ["array of specific topics needing improvement"],
  "hintsRequired": ["array of topics where hints were needed"],
  "recommendations": ["array of specific study recommendations"],
  "confidenceScores": {
    "category_name": 0-100
  }
}`;
}

async function analyzeWithOpenAI(prompt: string, data: SessionAnalysisData): Promise<AnalysisResult> {
  console.log('📤 Sending request to OpenAI API...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // More affordable and accessible model
      messages: [
        {
          role: 'system',
          content: 'You are a healthcare education expert analyzing patient knowledge gaps.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  console.log(`📥 Received response from OpenAI (Status: ${response.status})`);
  
  const result = await response.json();
  
  // Check for API errors
  if (!response.ok || result.error) {
    console.error('❌ OpenAI API error:', JSON.stringify(result.error || result, null, 2));
    throw new Error(result.error?.message || `OpenAI API request failed with status ${response.status}`);
  }

  // Check if response has expected structure
  if (!result.choices || !result.choices[0] || !result.choices[0].message) {
    console.error('❌ Unexpected OpenAI response format:', JSON.stringify(result, null, 2));
    throw new Error('Unexpected response format from OpenAI');
  }

  console.log('✅ Successfully parsed OpenAI response');
  return JSON.parse(result.choices[0].message.content);
}

function performBasicAnalysis(data: SessionAnalysisData): AnalysisResult {
  console.log('📊 Starting basic analysis with data:', {
    questionsCount: data.questionsAnswered.length,
    categories: data.categories,
    correctCount: data.correctAnswers.length,
    incorrectCount: data.incorrectAnswers.length
  });

  const categoryScores: Record<string, { correct: number; total: number }> = {};
  
  data.questionsAnswered.forEach(q => {
    if (!categoryScores[q.category]) {
      categoryScores[q.category] = { correct: 0, total: 0 };
    }
    categoryScores[q.category].total++;
    if (q.isCorrect) {
      categoryScores[q.category].correct++;
    }
  });

  console.log('📈 Category scores calculated:', categoryScores);

  const confidenceScores: Record<string, number> = {};
  const strongAreas: string[] = [];
  const knowledgeGaps: string[] = [];

  Object.entries(categoryScores).forEach(([category, scores]) => {
    const percentage = (scores.correct / scores.total) * 100;
    confidenceScores[category] = Math.round(percentage);
    
    if (percentage >= 70) {
      strongAreas.push(category);
    } else if (percentage < 50) {
      knowledgeGaps.push(category);
    }
  });

  const hintsRequired = data.questionsAnswered
    .filter(q => q.usedHint)
    .map(q => q.category);

  const recommendations = knowledgeGaps.map(
    gap => `Review materials on ${gap} to improve understanding`
  );

  // Add default recommendations if none exist
  if (recommendations.length === 0) {
    recommendations.push('Continue practicing to maintain your knowledge level');
    if (strongAreas.length > 0) {
      recommendations.push(`Great job on ${strongAreas.join(', ')}! Keep it up!`);
    }
  }

  const result = {
    strongAreas,
    knowledgeGaps,
    hintsRequired: [...new Set(hintsRequired)],
    recommendations,
    confidenceScores
  };

  console.log('✅ Basic analysis result:', result);

  return result;
}

