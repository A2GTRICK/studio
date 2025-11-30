
import { z } from 'zod';

export const PharmacyNewsItemSchema = z.object({
  id: z.string().describe('A unique identifier for the notification item, e.g., "pci-update-1"'),
  title: z.string().describe('The name of the source or the type of information (e.g., "PharmaTutor Job Updates", "PCI Official Circulars").'),
  summary: z.string().describe('A brief, one or two-sentence summary describing what users can find at the source link (e.g., "Check here for the latest government and private pharmacist job openings.").'),
  category: z.enum([
      "University Update", 
      "Exam Alert", 
      "Job Notification", 
      "Content Update", 
      "General", 
      "PCI Circular", 
      "Industry Hiring", 
      "Student Alert", 
      "Paramedical Job"
  ]).describe("The category of the notification."),
  date: z.string().describe("A recent, realistic date for the announcement (e.g., within the last month)."),
  source: z.string().url().describe('A valid, working URL to a relevant, real, high-level pharmacy or medical website homepage (e.g., https://www.pci.nic.in/, https://pharmatutor.org/). DO NOT invent a deep link.'),
});

export const PharmacyNewsOutputSchema = z.array(PharmacyNewsItemSchema);

export type PharmacyNewsOutput = z.infer<typeof PharmacyNewsOutputSchema>;
