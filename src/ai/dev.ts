import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-notes.ts';
import '@/ai/flows/summarize-document.ts';
import '@/ai/flows/answer-follow-up-question.ts';
