export interface CourseDocument {
  id: string;
  name: string;
  content: string;
  type: string; // 'text/plain', 'application/json', etc.
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizResult {
  score: number;
  total: number;
  answers: number[]; // User selected indices
}

export interface Flashcard {
  front: string;
  back: string;
}

export enum AppTab {
  CHAT = 'CHAT',
  SUMMARY = 'SUMMARY',
  QUIZ = 'QUIZ',
  FLASHCARDS = 'FLASHCARDS'
}