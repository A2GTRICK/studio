
'use server';
/**
 * @fileOverview A service to manage user progress data.
 *
 * - getSubjectsProgress - Fetches and constructs the user's progress across all subjects based on their interactions.
 * - saveMcqResult - Saves a user's MCQ quiz performance to Firestore.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { GenerateDashboardInsightsInput } from '@/ai/flows/generate-dashboard-insights';
import { z } from 'zod';

type SubjectProgress = GenerateDashboardInsightsInput['subjectsProgress'][0];
type TopicProgress = SubjectProgress['topics'][0];

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
 * Constructs a comprehensive subject progress report for a user.
 * It fetches all notes to create a complete syllabus structure and then
 * overlays the user's quiz attempt data on top of it.
 * @param uid The user's ID.
 * @returns A promise that resolves to an array of subject progress objects.
 */
export async function getSubjectsProgress(uid: string): Promise<SubjectProgress[]> {
  if (!uid) {
    return [];
  }

  // 1. Fetch all notes to build the complete structure of subjects and topics.
  const notesCollection = collection(db, 'notes');
  const notesSnapshot = await getDocs(query(notesCollection));
  const allTopicsBySubject: { [subject: string]: { [topic: string]: TopicProgress } } = {};

  notesSnapshot.forEach(doc => {
    const note = doc.data();
    const subjectName = note.subject || 'Uncategorized';
    if (!allTopicsBySubject[subjectName]) {
      allTopicsBySubject[subjectName] = {};
    }
    // Initialize all topics from the library as 'pending'.
    allTopicsBySubject[subjectName][note.title] = {
      title: note.title,
      status: 'pending',
      lastAccessed: 'Never',
      estTime: `${Math.floor(Math.random() * 30) + 30} mins`, // Random time for placeholder
    };
  });

  // 2. Fetch only the user's quiz progress from their sub-collection.
  const userProgressCollection = collection(db, 'users', uid, 'progress');
  const progressSnapshot = await getDocs(query(userProgressCollection));

  // 3. Overlay the user's progress on top of the complete topic list.
  progressSnapshot.forEach(doc => {
    const progressData = doc.data();
    const subjectName = progressData.subject || 'Uncategorized';
    const topicName = progressData.topic;

    if (allTopicsBySubject[subjectName] && allTopicsBySubject[subjectName][topicName]) {
      const isCompleted = progressData.score >= progressData.totalQuestions / 2;
      allTopicsBySubject[subjectName][topicName].status = isCompleted ? 'completed' : 'pending';
      allTopicsBySubject[subjectName][topicName].lastAccessed = 'Attempted';
      if(isCompleted) {
        allTopicsBySubject[subjectName][topicName].estTime = 'N/A';
      }
    }
  });

  // 4. Convert the nested object structure into the final array format.
  const finalProgress: SubjectProgress[] = Object.keys(allTopicsBySubject).map(subjectName => {
    return {
      subject: subjectName,
      topics: Object.values(allTopicsBySubject[subjectName]),
    };
  });

  return finalProgress;
}
