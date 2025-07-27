
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-exam-questions.ts';
import '@/ai/flows/generate-notes-from-topic.ts';
import '@/ai/flows/answer-follow-up-question.ts';
import '@/ai/flows/generate-question-sets.ts';
import '@/ai/flows/generate-mock-test.ts';
import '@/ai/flows/generate-service-outline.ts';
import '@/ai/flows/generate-mcq-practice.ts';
import '@/ai/flows/generate-mcq-feedback.ts';
import '@/ai/flows/generate-dashboard-insights.ts';
import '@/ai/flows/refine-generated-notes.ts';
