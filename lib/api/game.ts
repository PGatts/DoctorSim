/**
 * API client functions for game operations
 */

export interface SaveResponseData {
  sessionId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  usedHint: boolean;
}

export async function saveResponse(data: SaveResponseData) {
  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to save response');
  }

  return response.json();
}

export async function saveBulkResponses(responses: SaveResponseData[]) {
  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ responses })
  });

  if (!response.ok) {
    throw new Error('Failed to save responses');
  }

  return response.json();
}

export async function recordHintUsage(sessionId: string, questionId: string) {
  const response = await fetch('/api/hints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId,
      questionId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to record hint usage');
  }

  return response.json();
}

export async function getSessionResponses(sessionId: string) {
  const response = await fetch(`/api/responses?sessionId=${sessionId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch session responses');
  }

  return response.json();
}

