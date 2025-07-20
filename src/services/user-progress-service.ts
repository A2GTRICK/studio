'use server';
/**
 * @fileOverview A service to manage user progress data.
 *
 * - getSubjectsProgress - Fetches and constructs the user's progress across all subjects.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Note } from '@/app/(main)/admin/notes/page';
import type { GenerateDashboardInsightsInput } from '@/ai/flows/generate-dashboard-insights';

type SubjectProgress = GenerateDashboardInsightsInput['subjectsProgress'][0];

/**
 * Fetches all notes from the database and constructs a subject progress report.
 * In a real-world, fully-implemented application, this function would fetch
 * the user's actual saved progress. For now, it simulates completion status
 * for some topics to demonstrate the feature.
 * @returns A promise that resolves to an array of subject progress objects.
 */
export async function getSubjectsProgress(): Promise<SubjectProgress[]> {
  const notesCollection = collection(db, 'notes');
  const q = query(notesCollection, orderBy('createdAt', 'desc'));
  const notesSnapshot = await getDocs(q);
  const allNotes = notesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Note[];

  if (allNotes.length === 0) {
    return [];
  }

  const progressBySubject: { [key: string]: SubjectProgress } = {};

  allNotes.forEach((note, index) => {
    const subjectName = note.subject || 'Uncategorized';
    if (!progressBySubject[subjectName]) {
      progressBySubject[subjectName] = {
        subject: subjectName,
        topics: [],
      };
    }

    // Simulate completion for a few topics to make the dashboard look realistic.
    // This logic can be replaced when real user progress tracking is implemented.
    const isCompleted = index % 4 === 0;

    progressBySubject[subjectName].topics.push({
      title: note.title,
      status: isCompleted ? 'completed' : 'pending',
      lastAccessed: isCompleted ? `${index + 1} days ago` : 'Never',
      estTime: isCompleted ? 'N/A' : `${Math.floor(Math.random() * 60) + 30} mins`,
    });
  });

  return Object.values(progressBySubject);
}
