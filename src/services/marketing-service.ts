
'use server';
/**
 * @fileOverview A service to manage marketing configuration, specifically the lead magnet path.
 * This service interacts with a configuration document in Firestore to allow dynamic updates from the admin panel.
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CONFIG_DOC_PATH = 'marketing_config/lead_magnet';

/**
 * Retrieves the current lead magnet path from Firestore.
 * @returns The URL of the lead magnet file.
 */
export async function getLeadMagnetPath(): Promise<string> {
  try {
    const configDoc = await getDoc(doc(db, CONFIG_DOC_PATH));
    if (configDoc.exists() && configDoc.data().path) {
      return configDoc.data().path;
    }
    // Return a default or empty path if not set
    return '';
  } catch (error) {
    console.error("Error fetching lead magnet path from Firestore:", error);
    throw new Error("Could not load the lead magnet path from the database.");
  }
}

/**
 * Updates the lead magnet path in Firestore.
 * @param newPath The new URL to be saved.
 */
export async function updateLeadMagnetPath(newPath: string): Promise<void> {
  if (!newPath || typeof newPath !== 'string') {
    throw new Error('A valid path must be provided.');
  }

  try {
    await setDoc(doc(db, CONFIG_DOC_PATH), { path: newPath });
  } catch (error: any) {
    console.error("Error updating lead magnet path in Firestore:", error);
    // Provide a more specific error message if it's a permission issue
    if (error.code === 'permission-denied') {
        throw new Error("Database permission denied. Ensure Firestore rules allow admin writes to 'marketing_config/lead_magnet'.");
    }
    throw new Error("Could not update the lead magnet path in the database.");
  }
}
