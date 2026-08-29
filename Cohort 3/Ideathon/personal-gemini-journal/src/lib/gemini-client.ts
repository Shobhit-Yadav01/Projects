import { ChatMessage, ExtractionResult, JournalMode, MoodType, WeeklyInsight, JournalEntry, ExtractedActionItem } from '../types';
import { auth } from './firebase';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Timestamp': new Date().toISOString()
  };
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn('Silent token attach notice:', err);
  }
  return headers;
}

export interface ChatApiParams {
  messages: { role: string; content: string }[];
  currentDraft?: string;
  mode?: JournalMode;
  mood?: MoodType;
  userGoal?: string;
}

export async function sendGeminiChatMessage(params: ChatApiParams): Promise<string> {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const data = await response.json();
  return data.reply || 'I am listening closely. What else comes to mind?';
}

export interface ExtractActionsParams {
  title: string;
  journalContent: string;
  transcript: string;
}

export async function extractActionItemsWithGemini(params: ExtractActionsParams): Promise<ExtractionResult> {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to extract summary and action items');
  }

  const data = await response.json();
  return {
    summary: data.summary || 'Journal reflection completed.',
    importantPoints: data.importantPoints || [],
    goals: data.goals || [],
    keyThemes: data.keyThemes || data.topics || ['Reflection'],
    moodAnalysis: data.moodAnalysis || 'Calm & Reflective',
    followUpQuestions: data.followUpQuestions || [],
    actionItems: data.actionItems || [],
  };
}

export async function generateWeeklyInsightsWithGemini(
  journals: JournalEntry[],
  actionItems: ExtractedActionItem[],
  weekRange: string = 'Current Week'
): Promise<WeeklyInsight> {
  const headers = await getAuthHeaders();
  const journalSummaries = journals.map(j => ({
    title: j.title,
    createdAt: j.createdAt,
    mood: j.mood,
    summary: j.summary || j.content.slice(0, 300),
    keyThemes: j.keyThemes || j.tags,
    goals: j.tags
  }));

  const actionItemsSummary = {
    total: actionItems.length,
    completed: actionItems.filter(a => a.status === 'Completed').length,
    pending: actionItems.filter(a => a.status === 'Pending').length,
    inProgress: actionItems.filter(a => a.status === 'In Progress').length,
    topCategories: actionItems.map(a => a.category).slice(0, 5)
  };

  const response = await fetch('/api/insights/weekly', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      journalSummaries,
      actionItemsSummary,
      weekRange
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate weekly reflection');
  }

  const data = await response.json();
  const completed = actionItems.filter(a => a.status === 'Completed').length;
  const total = actionItems.length;

  return {
    id: `insight-${Date.now()}`,
    userId: journals[0]?.userId || auth.currentUser?.uid || 'anonymous',
    weekLabel: weekRange,
    dateRange: `${new Date(Date.now() - 7 * 86400000).toLocaleDateString()} – ${new Date().toLocaleDateString()}`,
    totalJournalsAnalyzed: journals.length,
    recurringTopics: data.recurringTopics || [],
    frequentlyDiscussedGoals: data.frequentlyDiscussedGoals || [],
    actionItemStats: {
      total,
      completed,
      pending: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    },
    unresolvedTopics: data.unresolvedTopics || [],
    commonThemes: data.commonThemes || [],
    reflectionPatterns: data.reflectionPatterns || 'Your reflections reveal thoughtful dedication to balanced personal growth and disciplined goal execution.',
    suggestedFocusAreas: data.suggestedFocusAreas || [],
    nextWeekPrompts: data.nextWeekPrompts || [],
    createdAt: new Date().toISOString()
  };
}

export async function fetchDynamicPrompts(category: string, currentMood: string): Promise<string[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch('/api/gemini/prompts', {
      method: 'POST',
      headers,
      body: JSON.stringify({ category, currentMood }),
    });

    if (!response.ok) throw new Error('Prompts fetch failed');
    const data = await response.json();
    return data.prompts && data.prompts.length > 0
      ? data.prompts
      : [
          'What is the most energizing thought on your mind today?',
          'What is a quiet challenge you navigated recently that deserves recognition?',
          'What is one boundary you can set this week to protect your focus?',
          'What step, if taken today, would make everything else easier?',
        ];
  } catch (error) {
    return [
      'What gave you the most energy today, and what silently drained you?',
      'What is a decision you have been postponing, and what is the fear behind it?',
      'If today was a chapter in your autobiography, what would the chapter title be?',
      'What are three subtle things you can be genuinely grateful for right now?',
    ];
  }
}

