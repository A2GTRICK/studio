
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { config } from 'dotenv';

config();

export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is now automatically sourced from the
      // GEMINI_API_KEY environment variable.
    }),
  ],
  model: 'googleai/gemini-1.5-flash-latest',
});
