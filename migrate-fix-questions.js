/**
 * SAFE MIGRATION SCRIPT
 * Fixes missing question text in test_series questions
 *
 * Run with:
 *   node migrate-fix-questions.js
 */

const admin = require("firebase-admin");

// 🔑 Use your service account or application default
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function migrate() {
  console.log("🚀 Starting question migration...\n");

  const testSeriesSnap = await db.collection("test_series").get();

  let fixed = 0;
  let skipped = 0;

  for (const testDoc of testSeriesSnap.docs) {
    const testId = testDoc.id;
    const questionsRef = db
      .collection("test_series")
      .doc(testId)
      .collection("questions");

    const questionsSnap = await questionsRef.get();

    for (const qDoc of questionsSnap.docs) {
      const data = qDoc.data();

      // ✅ Determine best available question text
      let text =
        data.question?.text ||
        data.text ||
        data.question ||
        null;

      // ❌ No text found anywhere
      if (!text || typeof text !== "string" || !text.trim()) {
        text = "⚠ Question text was missing. Please edit.";
      }

      // ✅ Already correct schema → skip
      if (
        data.question &&
        typeof data.question === "object" &&
        typeof data.question.text === "string" &&
        data.question.text.trim()
      ) {
        skipped++;
        continue;
      }

      // 🔧 Apply migration
      await qDoc.ref.update({
        question: { text: text.trim() },
      });

      fixed++;
      console.log(
        `✔ Fixed question ${qDoc.id} in test ${testId}`
      );
    }
  }

  console.log("\n✅ Migration completed.");
  console.log(`✔ Fixed: ${fixed}`);
  console.log(`⏭ Skipped (already OK): ${skipped}`);
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
  });
