import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyCjxpXINGBgKj1nJj84hEAeLdQc4kIH6YE"})],
  model: 'googleai/gemini-1.5-flash-latest',
});
