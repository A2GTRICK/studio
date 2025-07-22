
'use server';
/**
 * @fileOverview A service to manage user progress data.
 *
 * - getSubjectsProgress - Fetches and constructs the user's progress across all subjects.
 * - saveMcqResult - Saves a user's MCQ quiz performance to Firestore.
 */

import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, setDoc, serverTimestamp, where } from 'firebase/firestore';
import type { Note } from '@/app/(main)/admin/notes/page';
import type { GenerateDashboardInsightsInput } from '@/ai/flows/generate-dashboard-insights';
import { z } from 'zod';

type SubjectProgress = GenerateDashboardInsightsInput['subjectsProgress'][0];

const SaveMcqResultInputSchema = z.object({
  subject: z.string(),
  topic: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
});
export type SaveMcqResultInput = z.infer<typeof SaveMcqResultInputSchema>;

/**
 * Saves the result of an MCQ quiz to the user's progress record in Firestore.
 * Requires an authenticated user.
 * @param result The result of the MCQ quiz.
 */
export async function saveMcqResult(result: SaveMcqResultInput): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Authentication required: User must be logged in to save progress.");
    }
    
    const parsedResult = SaveMcqResultInputSchema.safeParse(result);
    if (!parsedResult.success) {
        throw new Error(`Invalid MCQ result data: ${parsedResult.error.message}`);
    }

    try {
        // Create a safe document ID by replacing invalid characters (like '/') with an underscore.
        const safeTopicId = result.topic.replace(/[/]/g, '_');
        const progressRef = doc(db, 'user_progress', user.uid, 'mcqs', safeTopicId);
        
        await setDoc(progressRef, {
            ...parsedResult.data,
            lastAttempted: serverTimestamp(),
            uid: user.uid,
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
  const user = auth.currentUser;

  // Fetch all notes to build the structure of subjects and topics
  const notesCollection = collection(db, 'notes');
  const notesQuery = query(notesCollection, orderBy('createdAt', 'desc'));
  const notesSnapshot = await getDocs(notesQuery);
  const allNotes = notesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Note[];

  if (allNotes.length === 0) {
    return [];
  }

  const progressBySubject: { [key: string]: SubjectProgress } = {};

  // Fetch user's actual progress from saved MCQ results
  let userMcqProgress: { [topic: string]: any } = {};
  if (user) {
      const userProgressCollection = collection(db, 'user_progress', user.uid, 'mcqs');
      const progressSnapshot = await getDocs(userProgressCollection);
      progressSnapshot.forEach(doc => {
          // Use the original topic name (doc.data().topic) for matching
          const originalTopic = doc.data().topic;
          if (originalTopic) {
            userMcqProgress[originalTopic] = doc.data();
          }
      });
  }

  // Initialize all topics as pending
  allNotes.forEach(note => {
    const subjectName = note.subject || 'Uncategorized';
    if (!progressBySubject[subjectName]) {
      progressBySubject[subjectName] = {
        subject: subjectName,
        topics: [],
      };
    }
    
    // Ensure we don't add duplicate topics if titles are the same
    if (!progressBySubject[subjectName].topics.some(t => t.title === note.title)) {
        progressBySubject[subjectName].topics.push({
          title: note.title,
          status: 'pending',
          lastAccessed: 'Never',
          estTime: `${Math.floor(Math.random() * 30) + 15} mins`,
        });
    }
  });

  // Update status based on actual user progress
  for (const subject of Object.values(progressBySubject)) {
      subject.topics.forEach(topic => {
          if (userMcqProgress[topic.title]) {
              topic.status = 'completed';
              // In a real app, you might format the timestamp more nicely
              topic.lastAccessed = 'Recently';
              topic.estTime = 'N/A';
          }
      });
  }

  return Object.values(progressBySubject);
}
