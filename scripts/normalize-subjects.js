/**
 * =============================================================================
 * ONE-TIME SAFE MIGRATION SCRIPT
 *
 * Normalizes the `subject` field in the `notes` collection to ensure
 * consistency for public-facing category pages and SEO.
 *
 * HOW IT WORKS:
 * 1. Defines a canonical mapping for known subject variations.
 * 2. Iterates through all documents in the `notes` collection.
 * 3. For each note, it checks if its `subject` field matches a known variant.
 * 4. If a variant is found, it updates the document with the canonical subject name.
 * 5. Updates are batched for efficiency.
 *
 * SAFETY FEATURES:
 * - DRY_RUN Mode: Set `DRY_RUN = true` to log all intended updates without
 *   writing any data to Firestore. This is the default.
 * - Idempotency: The script only updates subjects that need changing.
 *   Running it multiple times will not cause issues.
 * - Non-Destructive: Only the `subject` field is updated. No other data is
 *   touched.
 *
 * TO RUN THIS SCRIPT:
 * 1. Ensure you have Firebase Admin configured in your environment
 *    (e.g., via `GOOGLE_APPLICATION_CREDENTIALS`).
 * 2. Run in dry run mode first to verify: `node scripts/normalize-subjects.js`
 * 3. To apply changes, edit the script to set `DRY_RUN = false` and run again.
 * =============================================================================
 */

const admin = require("firebase-admin");

// --- ⚙️ CONFIGURATION ---
// Set to `false` to perform the actual database writes.
// In `true` (dry run) mode, the script will only log what it would do.
const DRY_RUN = true;

// --- CANONICAL SUBJECT MAPPING ---
// Maps a canonical name to a list of its found variants (case-insensitive).
const subjectMap = {
  "Human Anatomy and Physiology – I": [
    "human anatomy and physiology 1",
    "human anatomy and physiology i",
    "human anatomy and physiology 1st",
  ],
  "Pharmaceutical Organic Chemistry – I": [
    "pharmaceutical organic chemistry-1",
    "pharmaceutical organic chemistry 1",
  ],
  "Pharmaceutics – I": ["pharmaceutics 1", "pharmaceutics i"],
  "Pharmacognosy – II": ["pharmacognosy 2nd", "pharmacognosy-ii"],
  "Biochemistry": ["biochemistry"],
};

// --- 🔥 INITIALIZE FIREBASE ADMIN ---
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  console.log("✅ Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error(
    "❌ Firebase Admin SDK initialization failed. Ensure your environment is configured correctly.",
    error
  );
  process.exit(1);
}

const db = admin.firestore();
const notesCollection = "notes";
const BATCH_SIZE = 100;

/**
 * Creates a reverse map for quick lookups.
 * Maps a variant (lowercase) to its canonical name.
 */
function createReverseMap() {
  const reverseMap = new Map();
  for (const [canonical, variants] of Object.entries(subjectMap)) {
    for (const variant of variants) {
      // Normalize by making it lowercase and removing extra spaces/hyphens
      const cleanVariant = variant.toLowerCase().replace(/[-_\s]+/g, " ").trim();
      reverseMap.set(cleanVariant, canonical);
    }
  }
  return reverseMap;
}

/**
 * The main migration function.
 */
async function normalizeSubjects() {
  console.log(
    `\n🚀 Starting subject normalization in ${DRY_RUN ? "DRY RUN" : "WRITE"} mode.`
  );
  console.log("------------------------------------------------------");

  const reverseMap = createReverseMap();
  const snapshot = await db.collection(notesCollection).get();

  if (snapshot.empty) {
    console.log("🤷 No documents found in the `notes` collection. Exiting.");
    return;
  }

  let batch = db.batch();
  let updatesCount = 0;
  let processedCount = 0;

  for (const doc of snapshot.docs) {
    processedCount++;
    const data = doc.data();
    const currentSubject = data.subject;

    if (typeof currentSubject !== "string" || !currentSubject.trim()) {
      continue; // Skip notes with no subject
    }

    const cleanCurrentSubject = currentSubject.toLowerCase().replace(/[-_\s]+/g, " ").trim();
    const canonicalSubject = reverseMap.get(cleanCurrentSubject);

    // Check if an update is needed
    if (canonicalSubject && canonicalSubject !== currentSubject) {
      console.log(
        `   ✏️  Will update [${doc.id}]: "${currentSubject}" -> "${canonicalSubject}"`
      );
      
      if (!DRY_RUN) {
        batch.update(doc.ref, { subject: canonicalSubject });
        updatesCount++;
      } else {
        // In dry run, we still count it to show what would happen
        updatesCount++;
      }

      // Commit batch if it's full
      if (updatesCount > 0 && updatesCount % BATCH_SIZE === 0) {
        if (!DRY_RUN) {
          await batch.commit();
          console.log(`   ✅ Committed batch of ${BATCH_SIZE} updates.`);
          batch = db.batch();
        }
      }
    }
  }

  // Commit any remaining updates in the last batch
  if (updatesCount % BATCH_SIZE > 0 && !DRY_RUN) {
    await batch.commit();
    console.log(`   ✅ Committed final batch of ${updatesCount % BATCH_SIZE} updates.`);
  }

  console.log("\n------------------------------------------------------");
  console.log("🎉 Normalization Complete!");
  console.log(`- Mode: ${DRY_RUN ? "DRY RUN" : "WRITE"}`);
  console.log(`- Total Documents Processed: ${processedCount}`);
  console.log(`- Total Subjects to Update: ${updatesCount}`);
  console.log("------------------------------------------------------");

  if (DRY_RUN) {
    console.log(
      "\nℹ️  This was a dry run. No data was written. To apply the migration, set DRY_RUN to false in the script and run it again."
    );
  } else if (updatesCount > 0) {
     console.log("\n✅  Database has been successfully updated.");
  }
}

// --- 🏃‍♂️ EXECUTE SCRIPT ---
normalizeSubjects().catch((error) => {
  console.error("\n❌ An unexpected error occurred:", error);
  process.exit(1);
});
