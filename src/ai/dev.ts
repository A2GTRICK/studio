import { config } from 'dotenv';
config();

import '@/ai/flows/generate-exam-questions.ts';
import '@/ai/flows/generate-notes-from-topic.ts';
import '@/ai/flows/answer-follow-up-question.ts';
import '@/ai/flows/subscribe-to-newsletter.ts';
import '@/ai/flows/generate-question-sets.ts';
import '@/ai/flows/generate-mock-test.ts';
import '@/ai/flows/generate-service-outline.ts';
