'use server';

import { z } from 'zod';

export const PharmacyNewsItemSchema = z.object({
  id: z.string().describe('A unique identifier for the notification item, e.g., "pci-update-1"'),
  title: z.string().describe("A concise, descriptive title for the announcement or link."),
  summary: z.string().describe("A brief, one-sentence summary explaining what the notification is about."),
  category: z.enum([
      "Exam Alert",
      "University Update",
      "Job Notification",
      "PCI Circular",
      "Content Update",
      "Industry Hiring",
      "Other"
  ]).describe("The category of the notification."),
  date: z.string().describe("The estimated date of the announcement in YYYY-MM-DD format."),
  source: z.string().url().describe("The direct, valid URL to the official announcement or source.")
});

export const PharmacyNewsOutputSchema = z.array(PharmacyNewsItemSchema);

export type PharmacyNewsOutput = z.infer<typeof PharmacyNewsOutputSchema>;
