
'use server';
/**
 * @fileOverview A service to manage marketing settings, like the lead magnet path.
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MARKETING_CONFIG_DOC = 'app_config';
const LEAD_MAGNET_DOC_ID = 'lead_magnet';
const DEFAULT_LEAD_MAGNET_PATH = 'https://drive.google.com/file/d/1N-YTeLQXYGv8yShWsZDh6y_ETkg9WJRi/view?usp=drivesdk';

/**
 * Retrieves the current lead magnet path from Firestore.
 * If it doesn't exist, it creates a default one.
 * @returns The URL path to the lead magnet file.
 */
export async function getLeadMagnetPath(): Promise<string> {
    const docRef = doc(db, MARKETING_CONFIG_DOC, LEAD_MAGNET_DOC_ID);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().path;
        } else {
            // Document doesn't exist, so create it with the default value
            await setDoc(docRef, { path: DEFAULT_LEAD_MAGNET_PATH });
            return DEFAULT_LEAD_MAGNET_PATH;
        }
    } catch (error) {
        console.error("Error getting lead magnet path:", error);
        // Fallback to default if there's an error
        return DEFAULT_LEAD_MAGNET_PATH;
    }
}

/**
 * Updates the lead magnet path in Firestore.
 * @param newPath The new URL or path for the lead magnet.
 */
export async function updateLeadMagnetPath(newPath: string): Promise<void> {
     if (typeof newPath !== 'string' || newPath.trim() === '') {
        throw new Error('Invalid path provided.');
    }
    const docRef = doc(db, MARKETING_CONFIG_DOC, LEAD_MAGNET_DOC_ID);
    try {
        await setDoc(docRef, { path: newPath });
    } catch (error) {
        console.error("Error updating lead magnet path:", error);
        throw new Error("Could not update the lead magnet path in the database.");
    }
}
