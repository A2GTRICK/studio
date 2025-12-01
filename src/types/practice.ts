// src/types/practice.ts
export type QuestionType = 'single' | 'multiple' | 'integer' | 'assertion' | 'case';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: Option[];
  answer?: any;
  marks?: number;
  negativeMarks?: number;
  explanation?: string;
  section?: string;
  tags?: string[];
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks?: number;
  sections?: { name: string; order: number; questionCount: number }[];
  tags?: string[];
}
