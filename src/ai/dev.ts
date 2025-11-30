
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-notes.ts';
import '@/ai/flows/summarize-document.ts';
import '@/ai/flows/generate-feedback.ts';
import '@/ai/flows/follow-up-on-notes.ts';
import '@/ai/flows/fetch-pharmacy-news.ts';
