/**
 * =============================================================================
 * ONE-TIME SAFE MIGRATION SCRIPT
 *
 * Fixes denormalized fields within the `questions` subcollection for mock tests.
 * This script addresses the "Question text missing" issue in the CBT player.
 *
 *
 * HOW IT WORKS:
 * 1. Iterates through every document in the `test_series` collection.
 * 2. For each test, it iterates through every document in its `questions`
 *    subcollection.
 * 3. It checks if a question document is malformed:
 *    - `question.text` field is missing.
 *    - `questionText` field exists.
 * 4. If a document needs fixing, it performs two main actions:
 *    - Creates the `question` object with the text: `{ text: questionText }`.
 *    - Converts the `correctAnswer` string into the correct zero-based index
 *      by matching it against the `options` array.
 * 5. All updates for a given test are batched and committed together.
 *
 *
 * SAFETY FEATURES:
 * - DRY_RUN Mode: Set `DRY_RUN = true` to log all intended updates without
 *   writing any data to Firestore.
 * - Idempotency: The script checks if a document needs fixing before updating it.
 *   Correctly formatted documents are untouched, making it safe to run multiple times.
 * - Non-Destructive: No fields are deleted. The original `questionText` field
 *   is preserved. Updates are merged into the existing document.
 *
 *
 * TO RUN THIS SCRIPT:
 * 1. Ensure you have Firebase Admin configured in your environment.
 *    (e.g., via `GOOGLE_APPLICATION_CREDENTIALS` pointing to your service account key)
 * 2. Run the script from your terminal: `node migrate-fix-questions.js`
 *
 * =============================================================================
 */

const admin = require("firebase-admin");

// --- ⚙️ CONFIGURATION ---
// Set to `false` to perform the actual database writes.
// In `true` (dry run) mode, the script will only log what it would do.
const DRY_RUN = true;
// ------------------------ -

// --- 🔥 INITIALIZE FIREBASE ADMIN ---
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  console.log("✅ Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error(
    "❌ Firebase Admin SDK initialization failed. Ensure your environment is configured correctly (e.g., GOOGLE_APPLICATION_CREDENTIALS).",
    error
  );
  process.exit(1);
}

const db = admin.firestore();
const mainCollection = "test_series";

/**
 * The main migration function.
 */
async function fixIncorrectQuestions() {
  console.log(
    `\n🚀 Starting question fix-up in ${DRY_RUN ? "DRY RUN" : "WRITE"} mode.`
  );
  console.log("------------------------------------------------------");

  const testSeriesSnapshot = await db.collection(mainCollection).get();

  if (testSeriesSnapshot.empty) {
    console.log("🤷 No documents found in the `test_series` collection. Exiting.");
    return;
  }

  let testsProcessed = 0;
  let questionsFixed = 0;
  let questionsSkipped = 0;

  for (const testDoc of testSeriesSnapshot.docs) {
    const testId = testDoc.id;
    const questionsSubcollectionRef = testDoc.ref.collection("questions");
    const questionsSnapshot = await questionsSubcollectionRef.get();

    if (questionsSnapshot.empty) {
      // This is normal, many tests might not have questions yet.
      // console.log(`-  INFO [${testId}]: No questions subcollection found.`);
      continue;
    }

    testsProcessed++;
    let currentTestFixedCount = 0;
    const batch = db.batch();

    console.log(`\n➡️  PROCESSING [${testId}]: Found ${questionsSnapshot.size} questions.`);

    for (const questionDoc of questionsSnapshot.docs) {
      const questionData = questionDoc.data();
      const questionId = questionDoc.id;

      // 1️⃣ Requirement: Check if `question.text` is missing AND `questionText` exists.
      const needsFixing = !questionData.question?.text && questionData.questionText;

      if (!needsFixing) {
        questionsSkipped++;
        continue;
      }

      // This question needs to be fixed.
      const updatePayload = {};

      // 2️⃣ Requirement: Create `question: { text: questionText }`
      updatePayload.question = { text: String(questionData.questionText) };

      // 3️⃣ Requirement: Convert `correctAnswer` string to index.
      if (
        typeof questionData.correctAnswer === "string" &&
        Array.isArray(questionData.options)
      ) {
        const correctAnswerIndex = questionData.options.findIndex(
          (opt) =>
            String(opt.text).trim() === String(questionData.correctAnswer).trim()
        );

        if (correctAnswerIndex !== -1) {
          updatePayload.correctAnswer = correctAnswerIndex;
        } else {
          console.warn(
            `   ⚠️  WARNING for [${testId}/${questionId}]: Correct answer text "${questionData.correctAnswer}" not found in options. The 'correctAnswer' field will NOT be updated for this question.`
          );
        }
      }

      // 5️⃣ Requirement: Update IN-PLACE (non-destructive)
      if (Object.keys(updatePayload).length > 0) {
        if (!DRY_RUN) {
          batch.update(questionDoc.ref, updatePayload);
        }
        questionsFixed++;
        currentTestFixedCount++;
      } else {
        questionsSkipped++;
      }
    }

    if (currentTestFixedCount > 0) {
      if (!DRY_RUN) {
        await batch.commit();
      }
      console.log(
        `   ✅ Fixed ${currentTestFixedCount} questions for [${testId}].`
      );
    } else {
      console.log(`   👍 All questions in [${testId}] are already correct.`);
    }
  }

  console.log("\n------------------------------------------------------");
  console.log("🎉 Migration Complete!");
  console.log(`\n- Mode: ${DRY_RUN ? "DRY RUN" : "WRITE"}`);
  console.log(`- Tests Processed: ${testsProcessed}`);
  console.log(`- Total Questions Fixed: ${questionsFixed}`);
  console.log(`- Questions Skipped (already correct): ${questionsSkipped}`);
  console.log("------------------------------------------------------");
  if (DRY_RUN) {
    console.log(
      "\nℹ️  This was a dry run. No data was written. To perform the migration, set DRY_RUN to false and run the script again."
    );
  }
}

// --- 🏃‍♂️ EXECUTE SCRIPT ---
fixIncorrectQuestions().catch((error) => {
  console.error("\n❌ An unexpected error occurred:", error);
  process.exit(1);
});
