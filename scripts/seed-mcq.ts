require('dotenv').config({ path: './.env.local' });

import { adminDb } from '../src/lib/firebaseAdmin'; // Using admin SDK for backend script
import { Timestamp } from 'firebase-admin/firestore';

async function seedDatabase() {
  console.log('Starting to seed database...');

  const mcqCollection = adminDb.collection('mcqSets');

  const mcqSetData = {
    title: "General Pharmacology – MCQ Set 1",
    subject: "Pharmacology",
    course: "B.Pharm",
    year: "2nd Year",
    description: "High-yield MCQs covering basics of pharmacology.",
    isPremium: false,
    questionCount: 10,
    createdAt: new Timestamp(1710000000, 0),
    updatedAt: new Timestamp(1710000000, 0),
    questions: [
      {
        question: "Which of the following best defines Pharmacology?",
        options: [
          "Study of drugs",
          "Study of poisons",
          "Study of microorganisms",
          "Study of tissues"
        ],
        correctAnswer: "Study of drugs",
        explanation: "Pharmacology is the science of drugs and their actions.",
        topic: "Introduction",
        difficulty: "Easy"
      },
      {
        question: "Which route has 100% bioavailability?",
        options: [
          "Oral",
          "IV",
          "Subcutaneous",
          "Rectal"
        ],
        correctAnswer: "IV",
        explanation: "Intravenous route bypasses all absorption barriers.",
        topic: "Routes of Administration",
        difficulty: "Easy"
      }
    ]
  };

  try {
    // Check if a document with this title already exists to prevent duplicates
    const snapshot = await mcqCollection.where('title', '==', mcqSetData.title).get();
    if (!snapshot.empty) {
      console.log(`MCQ Set "${mcqSetData.title}" already exists. Skipping.`);
      return;
    }

    const docRef = await mcqCollection.add(mcqSetData);
    console.log(`Successfully seeded MCQ Set: "${mcqSetData.title}" with ID: ${docRef.id}`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase().then(() => {
    console.log('Seeding process finished.');
    process.exit(0);
}).catch(err => {
    console.error('Unhandled error in seeding script', err);
    process.exit(1);
});
