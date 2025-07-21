
'use server';
/**
 * @fileOverview A service to cache AI-generated images in Firestore.
 *
 * This service provides methods to get and set images in a 'generated_images'
 * collection, using the image hint as the document ID for caching.
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const IMAGE_CACHE_COLLECTION = 'generated_images';

/**
 * Retrieves a cached image data URI from Firestore based on a hint.
 * @param hint The text hint used to generate the image (acts as cache key).
 * @returns The Base64 encoded data URI string if found, otherwise null.
 */
export async function getCachedImage(hint: string): Promise<string | null> {
  try {
    const docRef = doc(db, IMAGE_CACHE_COLLECTION, hint);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().imageDataUri;
    }
    return null;
  } catch (error) {
    console.error(`Error getting cached image for hint "${hint}":`, error);
    // If there's an error, proceed as if there's no cache.
    return null;
  }
}

/**
 * Saves a newly generated image data URI to the Firestore cache.
 * @param hint The text hint used for generation (acts as cache key).
 * @param imageDataUri The Base64 encoded data URI of the generated image.
 */
export async function setCachedImage(hint: string, imageDataUri: string): Promise<void> {
  try {
    const docRef = doc(db, IMAGE_CACHE_COLLECTION, hint);
    await setDoc(docRef, {
      imageDataUri: imageDataUri,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error setting cached image for hint "${hint}":`, error);
    // Failing to cache is not a critical error, so we just log it.
  }
}
