
'use server';
/**
 * @fileOverview A service to manage user progress data.
 *
 * - getSubjectsProgress - Fetches and constructs the user's progress across all subjects based on their interactions.
 * - saveMcqResult - Saves a user's MCQ quiz performance to Firestore.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { z } from 'zod';

// Simplified local types, no longer dependent on the deleted AI flow.
type TopicProgress = {
    title: string;
    status: 'completed' | 'pending';
};
type SubjectProgress = {
    subject: string;
    topics: TopicProgress[];
};


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
        // Silently fail as requested by user to not show error toasts.
    }
}


/**
 * Constructs a comprehensive subject progress report for a user based on their saved quiz data.
 * @param uid The user's ID.
 * @returns A promise that resolves to an array of subject progress objects.
 */
export async function getSubjectsProgress(uid: string): Promise<SubjectProgress[]> {
  if (!uid) {
    return [];
  }

  // 1. Fetch all of the user's saved quiz progress. This is the single source of truth.
  const userProgressCollection = collection(db, 'users', uid, 'progress');
  const progressSnapshot = await getDocs(query(userProgressCollection));

  if (progressSnapshot.empty) {
    return [];
  }

  // 2. Process the fetched quiz data into a structured format.
  const progressBySubject: { [subjectName: string]: TopicProgress[] } = {};

  progressSnapshot.forEach(doc => {
    const progressData = doc.data();
    const subjectName = progressData.subject || 'Uncategorized';
    
    if (!progressBySubject[subjectName]) {
      progressBySubject[subjectName] = [];
    }

    const isCompleted = progressData.score >= progressData.totalQuestions / 2;

    progressBySubject[subjectName].push({
      title: progressData.topic,
      status: isCompleted ? 'completed' : 'pending',
    });
  });

  // 3. Convert the processed data into the final array format required by the dashboard.
  const finalProgress: SubjectProgress[] = Object.keys(progressBySubject).map(subjectName => {
    return {
      subject: subjectName,
      topics: progressBySubject[subjectName],
    };
  });

  return finalProgress;
}
