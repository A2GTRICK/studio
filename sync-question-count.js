const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function syncCounts() {
  const tests = await db.collection("test_series").get();

  for (const test of tests.docs) {
    const qSnap = await test.ref.collection("questions").get();
    const count = qSnap.size;

    await test.ref.update({
      questionCount: count,
    });

    console.log(`✔ ${test.id} → ${count} questions`);
  }

  console.log("🎉 Question count sync complete");
}

syncCounts().catch(console.error);
