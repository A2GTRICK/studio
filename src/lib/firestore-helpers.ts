// src/lib/firestore-helpers.ts
import { DocumentSnapshot, QueryDocumentSnapshot, SnapshotMetadata } from "firebase/firestore";

/**
 * Convert Firestore value to plain JS safe value:
 * - Firestore Timestamp -> number (ms since epoch)
 * - Firestore GeoPoint / DocumentReference -> string (toString)
 * - Arrays / objects -> recursively process
 */
function safeValue(v: any): any {
  if (v == null) return v;
  // Firestore Timestamp detection (common)
  if (typeof v?.toDate === "function" && typeof v?.seconds === "number") {
    try {
      return v.toDate().getTime(); // return ms
    } catch {
      return null;
    }
  }
  // DocumentReference-like (toString)
  if (typeof v?.id === "string" && typeof v?.path === "string") {
    return String(v.path);
  }
  // GeoPoint-like
  if (typeof v?.latitude === "number" && typeof v?.longitude === "number") {
    return { latitude: v.latitude, longitude: v.longitude };
  }
  if (Array.isArray(v)) return v.map(safeValue);
  if (typeof v === "object" && !Buffer.isBuffer(v)) {
    const out: Record<string, any> = {};
    for (const [k, val] of Object.entries(v)) out[k] = safeValue(val);
    return out;
  }
  return v;
}

/** Convert a Firestore doc (QueryDocumentSnapshot | DocumentSnapshot) into a plain object safe for Server -> Client props */
export function docToPlain<T = any>(snap: QueryDocumentSnapshot | DocumentSnapshot): T {
  const data = snap.data() || {};
  const out: Record<string, any> = { id: snap.id };
  for (const [k, v] of Object.entries(data)) {
    out[k] = safeValue(v);
  }
  // include metadata if needed
  try {
    // if createdAt & updatedAt exist as timestamps already converted above they are numbers
  } catch {}
  return out as T;
}

/** Convert array of docs */
export function docsToPlain<T = any>(docs: (QueryDocumentSnapshot | DocumentSnapshot)[]): T[] {
  return docs.map(docToPlain);
}
