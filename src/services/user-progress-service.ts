
'use server';
/**
 * @fileOverview A service to manage user progress data.
 *
 * - getSubjectsProgress - Fetches and constructs the user's progress across all subjects based on their interactions.
 * - saveMcqResult - Saves a user's MCQ quiz performance to Firestore.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, setDoc, serverTimestamp, writeBatch, collectionGroup } from 'firestore/lite';
import type { GenerateDashboardInsightsInput } from '@/ai/flows/generate-dashboard-insights';
import { z } from 'zod';

type SubjectProgress = GenerateDashboardInsightsInput['subjectsProgress'][0];

const SaveMcqResultInputSchema = z.object({
  uid: z.string().min(1, 'User ID is required.'),
  subject: z.string(),
  topic: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
});

export type SaveMcqResultInput = z.infer<typeof SaveMcqResultInputSchema>;

/**
 * Saves the result of an MCQ quiz to the user's progress record in Firestore.
 * Requires the user's UID.
 * @param data The user's UID and the quiz result.
 */
export async function saveMcqResult(data: SaveMcqResultInput): Promise<void> {
    const parsedData = SaveMcqResultInputSchema.safeParse(data);
    if (!parsedData.success) {
        throw new Error(`Invalid data provided to saveMcqResult: ${parsedData.error.message}`);
    }
    const { uid, subject, topic, score, totalQuestions } = parsedData.data;

    if (!uid) {
        throw new Error("User is not authenticated. Cannot save progress.");
    }
    
    try {
        const safeTopicId = topic.replace(/[.\\#$[\]/]/g, '_') || 'general';
        // Securely write to a sub-collection within the specific user's document
        const progressRef = doc(db, 'users', uid, 'progress', safeTopicId);
        
        await setDoc(progressRef, {
            subject,
            topic,
            score,
            totalQuestions,
            lastAttempted: serverTimestamp(),
            uid: uid,
        }, { merge: true });

    } catch (error) {
        console.error("Error saving MCQ result to Firestore:", error);
        throw new Error("Could not save your progress to the database.");
    }
}

/**
 * Fetches only the user's progress data and constructs a subject progress report.
 * This is much more efficient as it doesn't load the entire notes collection.
 * @returns A promise that resolves to an array of subject progress objects.
 */
export async function getSubjectsProgress(uid: string): Promise<SubjectProgress[]> {
  
  if (!uid) {
    return [];
  }

  // 1. Fetch only the user's quiz progress from their sub-collection.
  const userProgressCollection = collection(db, 'users', uid, 'progress');
  const progressSnapshot = await getDocs(userProgressCollection);

  if (progressSnapshot.empty) {
      return [];
  }

  // 2. Group the results by subject.
  const progressBySubject: { [key: string]: SubjectProgress } = {};

  progressSnapshot.forEach(doc => {
    const data = doc.data();
    const subjectName = data.subject || 'Uncategorized';

    if (!progressBySubject[subjectName]) {
      progressBySubject[subjectName] = {
        subject: subjectName,
        topics: [],
      };
    }
    
    const isCompleted = data.score >= data.totalQuestions / 2;

    progressBySubject[subjectName].topics.push({
      title: data.topic,
      status: isCompleted ? 'completed' : 'pending',
      lastAccessed: 'Attempted', // We know it's been attempted because it exists in progress
      estTime: `${Math.floor(Math.random() * 30) + 15} mins`,
    });
  });
  
  return Object.values(progressBySubject);
}
