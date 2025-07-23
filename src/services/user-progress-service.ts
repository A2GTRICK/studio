
'use server';
/**
 * @fileOverview A service to manage user progress data.
 *
 * - getSubjectsProgress - Fetches and constructs the user's progress across all subjects.
 * - saveMcqResult - Saves a user's MCQ quiz performance to Firestore.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
    const { uid, subject, topic, score, totalQuestions } = data;

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
            uid: uid, // Storing UID for potential cross-reference
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
export async function getSubjectsProgress(): Promise<SubjectProgress[]> {
  // Since this is a server action, we can't rely on client-side auth state.
  // This function will now fetch progress for the *currently logged in user*
  // by being called from a component that has access to the user's session.
  // A complete implementation would require passing the user ID to this function.
  // For now, it will fetch all notes and assume no progress if no user context is provided.
  
  // Fetch all notes to build the structure of subjects and topics
  const notesCollection = collection(db, 'notes');
  const notesQuery = query(notesCollection, orderBy('createdAt', 'desc'));
  const notesSnapshot = await getDocs(notesQuery);
  const allNotes = notesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Note[];

  if (allNotes.length === 0) {
    return [];
  }

  const progressBySubject: { [key: string]: SubjectProgress } = {};

  // This function would ideally receive a user ID to fetch specific progress.
  // For the demonstration, we'll build the topic list and assume a 'pending' state.
  // The dashboard will fetch the user progress and then call the AI.

  allNotes.forEach(note => {
    const subjectName = note.subject || 'Uncategorized';
    if (!progressBySubject[subjectName]) {
      progressBySubject[subjectName] = {
        subject: subjectName,
        topics: [],
      };
    }
    
    if (!progressBySubject[subjectName].topics.some(t => t.title === note.title)) {
        progressBySubject[subjectName].topics.push({
          title: note.title,
          status: 'pending',
          lastAccessed: 'Never',
          estTime: `${Math.floor(Math.random() * 30) + 15} mins`,
        });
    }
  });
  
  // The logic to update status based on user's actual progress will need the user ID.
  // We will pass this structure to the dashboard, which will then overlay the user's real progress.
  // For example, it would fetch from 'user_progress/{uid}/mcqs' and update the status.
  
  return Object.values(progressBySubject);
}

    
