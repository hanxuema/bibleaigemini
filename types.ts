export enum AppView {
  ONBOARDING = 'ONBOARDING',
  SEARCH = 'SEARCH',
  PASTOR = 'PASTOR',
  PRAYER = 'PRAYER',
  QUIZ = 'QUIZ',
  SETTINGS = 'SETTINGS',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum FaithStatus {
  BELIEVER = 'Believer',
  SEEKER = 'Seeker',
  SKEPTIC = 'Skeptic/Curious',
  LEADER = 'Church Leader/Pastor'
}

export interface UserPreferences {
  name: string;
  isCompleted: boolean;
  faithStatus: FaithStatus;
  denomination: string;
  bibleVersion: string;
  language: string;
  isPro: boolean;
}

export interface BibleReference {
  ref: string;
  text: string;
  chapter?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
  followUps?: string[];
  references?: BibleReference[];
}

export interface SearchResult {
  reference: string;
  text: string;
  context?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number; // 0-3
  explanation: string;
  reference: string;
}

// Service response type
export interface AIResponse {
  markdown: string;
  followUps?: string[];
  references?: BibleReference[];
}

export interface QuizResponse {
  questions: QuizQuestion[];
}