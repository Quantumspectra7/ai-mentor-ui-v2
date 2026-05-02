// ─── Core Study Types ─────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';
export type SummaryMode = 'short' | 'detailed' | 'bullets' | 'highlights';

export interface MCQItem {
  question: string;
  options: string[];            // always 4
  correct: number;              // index 0–3
  explanation: string;
  difficulty: Difficulty;
  topic: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface SummaryResult {
  short: string;
  detailed: string;
  bullets: string[];
  highlights: string[];
}

export interface PerQuestionResult {
  correct: boolean;
  timeSec: number;
  topic: string;
  selectedIndex: number;
}

export interface TestResult {
  id: string;
  date: number;
  score: number;
  total: number;
  timeTaken: number;            // seconds
  perQuestion: PerQuestionResult[];
  weakTopics: string[];
  accuracy: number;             // 0–100
}

export interface VivaMessage {
  role: 'examiner' | 'student';
  content: string;
  feedback?: string;
  timestamp: number;
}

export interface Notebook {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  rawText: string;
  wordCount: number;
  summary?: SummaryResult;
  mcqs?: MCQItem[];
  flashcards?: Flashcard[];
  testHistory?: TestResult[];
}

export interface StudyPlanDay {
  day: number;
  label: string;
  topics: string[];
  goal: string;
  estimatedHours: number;
}

export interface StudyPlan {
  totalDays: number;
  plan: StudyPlanDay[];
  tips: string[];
}
