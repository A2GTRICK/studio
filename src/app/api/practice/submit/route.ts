// src/app/api/practice/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    /**
      payload: {
        testId: string,
        guestId?: string,
        userId?: string, // optional when logged in
        timeTakenSeconds: number,
        answers: [{ questionId, given, type }]
      }
    */
    const { testId, userId = null, guestId = null, timeTakenSeconds, answers } = payload;

    if (!testId || !answers) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Load questions
    const questionsSnap = await adminDb.collection(`tests/${testId}/questions`).get();
    const questionsMap: Record<string, any> = {};
    questionsSnap.docs.forEach(d => (questionsMap[d.id] = d.data()));

    // Score calculations
    let totalMarks = 0, score = 0, correctCount = 0, incorrectCount = 0, skippedCount = 0;
    const answerDetails = [];

    for (const a of answers) {
      const q = questionsMap[a.questionId];
      if (!q) continue;
      const qMarks = q.marks ?? 1;
      totalMarks += qMarks;
      const negative = q.negativeMarks ?? 0;

      const given = a.given; // could be string, array, number
      let awarded = 0, correct = false;

      if (given === null || given === undefined || (Array.isArray(given) && given.length === 0) || given === '') {
        skippedCount++;
        awarded = 0;
        correct = false;
      } else {
        // Evaluate based on type
        if (q.type === 'single') {
          correct = String(given) === String(q.answer);
          if (correct) awarded = qMarks; else awarded = -Math.abs(negative);
        } else if (q.type === 'multiple') {
          const expected = (q.answer || []).map(String).sort();
          const user = (Array.isArray(given) ? given : []).map(String).sort();
          if (JSON.stringify(expected) === JSON.stringify(user)) {
            correct = true; awarded = qMarks;
          } else {
            correct = false; awarded = -Math.abs(negative);
          }
        } else if (q.type === 'integer') {
          correct = Number(given) === Number(q.answer);
          awarded = correct ? qMarks : -Math.abs(negative);
        } else if (q.type === 'assertion') {
          // Assuming q.answer is {statement: true|false, reason: true|false, relation: 'A'|'B'|'C' etc}
          correct = JSON.stringify(given) === JSON.stringify(q.answer);
          awarded = correct ? qMarks : -Math.abs(negative);
        } else {
          // fallback
          correct = String(given) === String(q.answer);
          awarded = correct ? qMarks : -Math.abs(negative);
        }
        if (correct) correctCount++; else incorrectCount++;
      }

      score += awarded;
      answerDetails.push({
        questionId: a.questionId,
        given,
        correct: !!correct,
        marksAwarded: awarded
      });
    }

    const accuracy = totalMarks > 0 ? Math.round((correctCount / (correctCount + incorrectCount || 1)) * 100) : 0;
    const resultDoc = {
      testId,
      userId,
      guestId,
      score,
      totalMarks,
      correctCount,
      incorrectCount,
      skippedCount,
      accuracy,
      timeTakenSeconds,
      answers: answerDetails,
      createdAt: adminDb.FieldValue ? adminDb.FieldValue.serverTimestamp() : new Date(),
    };

    // Save result using Admin SDK (server context)
    const resRef = await adminDb.collection('results').add(resultDoc);

    // Compute simple percentile: count results with less than or equal score / total
    const allResSnap = await adminDb.collection('results').where('testId', '==', testId).get();
    const scores = allResSnap.docs.map(d => d.data().score ?? 0);
    const total = scores.length;
    const lessOrEqual = scores.filter(s => s <= score).length;
    const percentile = total > 0 ? Math.round((lessOrEqual / total) * 100) : 100;

    // Recommend notes: collect tag counts from answered incorrect questions and query notes by tags
    const badTags: Record<string, number> = {};
    for (const det of answerDetails.filter(a => !a.correct)) {
      const q = questionsMap[det.questionId];
      if (q?.tags?.length) q.tags.forEach((t: string) => badTags[t] = (badTags[t] ?? 0) + 1);
    }
    const topTags = Object.entries(badTags).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]);

    let recommendedNotes = [];
    if (topTags.length) {
      const notesSnap = await adminDb.collection('notes').where('tags', 'array-contains-any', topTags).limit(6).get();
      recommendedNotes = notesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    }

    return NextResponse.json({
      resultId: resRef.id,
      score,
      totalMarks,
      correctCount,
      incorrectCount,
      skippedCount,
      accuracy,
      percentile,
      recommendedNotes,
    });
  } catch (err) {
    console.error('Submit API err', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
