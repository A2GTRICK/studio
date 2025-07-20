'use server';
/**
 * @fileOverview A flow to generate smart dashboard insights for a student.
 *
 * - generateDashboardInsights - A function that creates personalized dashboard data.
 * - GenerateDashboardInsightsInput - The input type for the function.
 * - GenerateDashboardInsightsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubjectProgressSchema = z.object({
  subject: z.string().describe('The name of the subject.'),
  topics: z.array(z.object({
    title: z.string().describe('The name of the topic.'),
    status: z.enum(['completed', 'pending']).describe('The completion status of the topic.'),
    lastAccessed: z.string().describe('When the topic was last accessed (e.g., "2 days ago", "Never").'),
    estTime: z.string().describe('Estimated time to complete the topic (e.g., "45 mins", "1.5 hours", "N/A" for completed).'),
  })).describe('A list of topics within the subject and their progress.'),
});

const WeeklyPerformanceSchema = z.object({
  week: z.string().describe('The label for the week (e.g., "Week 1").'),
  yourScore: z.number().int().min(0).max(100).describe("The student's average score for that week."),
  classAverage: z.number().int().min(0).max(100).describe("The class average score for that week."),
});

const GenerateDashboardInsightsInputSchema = z.object({
  studentName: z.string().describe("The name of the student."),
  course: z.string().describe("The student's course (e.g., B.Pharm)."),
  year: z.string().describe("The student's year of study (e.g., 2nd Year)."),
  // In a real app, this would come from a database. For this simulation, we'll generate it.
  subjectsProgress: z.array(SubjectProgressSchema).describe("The student's current progress across different subjects."),
});
export type GenerateDashboardInsightsInput = z.infer<typeof GenerateDashboardInsightsInputSchema>;

const GenerateDashboardInsightsOutputSchema = z.object({
  totalProgress: z.number().int().min(0).max(100).describe('The overall percentage of syllabus completion.'),
  subjectsCompleted: z.number().int().describe('The total number of subjects marked as fully completed.'),
  pendingTopics: z.number().int().describe('The total number of topics that are still pending.'),
  aiNextTopicSuggestion: z.string().describe('A specific, actionable suggestion for the very next topic the student should study, based on their pending topics and potential weaknesses.'),
  weeklyPerformance: z.array(WeeklyPerformanceSchema).length(4).describe('A list of the last 4 weeks of performance data, comparing the student to the class average.'),
  aiSuggestions: z.array(z.string()).length(3).describe('A list of 3 unique, personalized, and actionable tips for the student based on their progress and performance data. These should be insightful and encouraging.'),
});
export type GenerateDashboardInsightsOutput = z.infer<typeof GenerateDashboardInsightsOutputSchema>;

export async function generateDashboardInsights(input: GenerateDashboardInsightsInput): Promise<GenerateDashboardInsightsOutput> {
  return generateDashboardInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDashboardInsightsPrompt',
  input: {schema: GenerateDashboardInsightsInputSchema},
  output: {schema: GenerateDashboardInsightsOutputSchema},
  prompt: `You are a smart academic advisor AI for a pharmacy student named {{studentName}}. Your task is to analyze the student's progress and generate a set of personalized insights for their dashboard. The data must be realistic, encouraging, and actionable.

  Student Profile:
  - Name: {{studentName}}
  - Course: {{course}}
  - Year: {{year}}

  Student's Current Progress Data:
  {{#each subjectsProgress}}
  - Subject: {{subject}}
    {{#each topics}}
    - Topic: "{{title}}", Status: {{status}}, Last Accessed: {{lastAccessed}}, Est. Time: {{estTime}}
    {{/each}}
  {{/each}}

  CRITICAL INSTRUCTIONS:

  1.  **Calculate Summary Metrics:**
      - Calculate 'totalProgress' as the percentage of completed topics out of all topics. Round to the nearest whole number.
      - Calculate 'subjectsCompleted' by counting how many subjects have all their topics marked as 'completed'.
      - Calculate 'pendingTopics' by counting the total number of topics with a 'pending' status.

  2.  **Generate AI Next Topic Suggestion:**
      - Based on the list of pending topics, choose the *single best topic* for the student to tackle next. This could be a foundational topic or one from a subject they haven't accessed in a while. Be specific.

  3.  **Generate Weekly Performance Data:**
      - Create a realistic 4-week performance chart. The student's score ('yourScore') should generally trend upwards but can have slight dips. The 'classAverage' should be realistic and sometimes lower, sometimes higher than the student's score to create a believable scenario.

  4.  **Generate AI Auto Suggestions:**
      - Create exactly THREE unique, insightful, and actionable tips. Do not just state facts from the progress report.
      - Example of a *bad* suggestion: "You have completed 2 topics in Pharmacology."
      - Example of a *good* suggestion: "You're building great momentum in Pharmacology! To solidify that knowledge, try to review the 'General Pharmacology' topic for 15 minutes before starting the 'Drugs Acting on ANS' chapter."
      - Another good suggestion: "I noticed you haven't started 'Biochemistry' yet. It pairs well with 'Pathophysiology'. Starting it this week could help you connect concepts across subjects."
      - Make them sound like they're from a helpful mentor.

  Your entire output must be in the specified structured format.
  `,
});

const generateDashboardInsightsFlow = ai.defineFlow(
  {
    name: 'generateDashboardInsightsFlow',
    inputSchema: GenerateDashboardInsightsInputSchema,
    outputSchema: GenerateDashboardInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    