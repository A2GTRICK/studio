// src/types/mcq-set.ts
export interface McqSet {
  id: string;
  title: string;
  subject: string;
  course: string;
  year: string;
  description?: string;
  questionCount: number;
  isPremium?: boolean;
  isPublished?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  questions?: any[];
}
