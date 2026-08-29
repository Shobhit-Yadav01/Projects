export type JournalMode = 'socratic' | 'brainstorm' | 'mindful' | 'action' | 'problem_solver';

export type MoodType = 'Calm' | 'Joyful' | 'Focused' | 'Grateful' | 'Anxious' | 'Fatigued' | 'Inspired' | 'Overwhelmed';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Finance' | 'Learning' | 'Creative' | 'Relationships';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ExtractedActionItem {
  id: string;
  userId: string;
  journalId?: string;
  journalTitle?: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  category: TaskCategory;
  status: TaskStatus;
  suggestedDeadline?: string;
  tags?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mode: JournalMode;
  mood: MoodType;
  tags: string[];
  messages: ChatMessage[];
  summary?: string;
  keyThemes?: string[];
  moodAnalysis?: string;
  actionItemsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSecurityProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  securityLevel: 'Enterprise Zero-Trust' | 'Cloud Firestore Isolated';
  encryptionVerified: boolean;
  createdAt?: string;
}

export interface JournalSummaryDoc {
  id: string;
  journalId: string;
  userId: string;
  title: string;
  summary: string;
  importantPoints?: string[];
  goals?: string[];
  actionItems?: string[];
  topics: string[];
  keyThemes: string[];
  moodAnalysis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyInsight {
  id: string;
  userId: string;
  weekLabel: string;
  dateRange: string;
  totalJournalsAnalyzed: number;
  recurringTopics: {
    topic: string;
    count: number;
    description: string;
  }[];
  frequentlyDiscussedGoals: {
    goal: string;
    status: 'In Progress' | 'Achieved' | 'Emerging';
    context: string;
  }[];
  actionItemStats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  unresolvedTopics: {
    topic: string;
    context: string;
    suggestedResolution: string;
  }[];
  commonThemes: string[];
  reflectionPatterns: string; // "What patterns appeared in my thoughts this week?"
  suggestedFocusAreas: string[];
  nextWeekPrompts: string[];
  createdAt: string;
}

export interface ExtractionResult {
  summary: string;
  keyThemes: string[];
  moodAnalysis: string;
  actionItems: {
    title: string;
    description?: string;
    priority: PriorityLevel;
    category: TaskCategory;
    suggestedDeadline?: string;
    tags?: string[];
  }[];
  importantPoints?: string[];
  goals?: string[];
  followUpQuestions?: string[];
}
