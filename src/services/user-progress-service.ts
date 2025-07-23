
'use server';
/**
 * @fileOverview A service to manage user progress data.
 *
 * - getSubjectsProgress - Fetches and constructs the user's progress across all subjects.
 * - saveMcqResult - Saves a user's MCQ quiz performance to Firestore.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, setDoc, serverTimestamp, writeBatch, collectionGroup } from 'firebase/firestore';
import type { Note } from '@/app/(main)/admin/notes/page';
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
        const progressRef = doc(db, 'user_progress', uid, 'mcqs', safeTopicId);
        
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
 * Fetches all notes from the database and constructs a subject progress report
 * based on the user's saved MCQ attempts.
 * @returns A promise that resolves to an array of subject progress objects.
 */
export async function getSubjectsProgress(uid: string): Promise<SubjectProgress[]> {
  
  // 1. Fetch all notes to build the complete structure of subjects and topics
  const notesCollection = collection(db, 'notes');
  const notesQuery = query(notesCollection, orderBy('createdAt', 'desc'));
  const notesSnapshot = await getDocs(notesQuery);
  const allNotes = notesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Note[];

  if (allNotes.length === 0) {
    return [];
  }

  // 2. Fetch the user's MCQ progress
  let userProgress: { [topic: string]: { score: number; totalQuestions: number } } = {};
  if (uid) {
      const userProgressCollection = collection(db, 'user_progress', uid, 'mcqs');
      const progressSnapshot = await getDocs(userProgressCollection);
      progressSnapshot.forEach(doc => {
          const data = doc.data();
          userProgress[data.topic] = { score: data.score, totalQuestions: data.totalQuestions };
      });
  }

  // 3. Construct the progress report by merging notes and user data
  const progressBySubject: { [key: string]: SubjectProgress } = {};

  allNotes.forEach(note => {
    const subjectName = note.subject || 'Uncategorized';
    if (!progressBySubject[subjectName]) {
      progressBySubject[subjectName] = {
        subject: subjectName,
        topics: [],
      };
    }
    
    // Check if topic already exists to avoid duplicates
    if (!progressBySubject[subjectName].topics.some(t => t.title === note.title)) {
        const userTopicProgress = userProgress[note.title];
        const isCompleted = userTopicProgress && userTopicProgress.score >= userTopicProgress.totalQuestions / 2;

        progressBySubject[subjectName].topics.push({
          title: note.title,
          // Mark as 'completed' if user has scored at least 50%
          status: isCompleted ? 'completed' : 'pending',
          lastAccessed: userTopicProgress ? 'Attempted' : 'Never',
          estTime: `${Math.floor(Math.random() * 30) + 15} mins`,
        });
    }
  });
  
  return Object.values(progressBySubject);
}

    
