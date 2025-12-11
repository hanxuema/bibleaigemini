export enum AppView {
  ONBOARDING = 'ONBOARDING',
  SEARCH = 'SEARCH',
  PASTOR = 'PASTOR',
  PRAYER = 'PRAYER',
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface SearchResult {
  reference: string;
  text: string;
  context?: string;
}
