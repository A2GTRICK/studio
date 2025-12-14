
export type MockQuestion = {
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
};

export type MockResult = {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
};

export function calculateMockResult(
  questions: MockQuestion[],
  answers: Record<number, string>,
  marksPerQuestion = 1,
  negativeMarks = 0.25
): MockResult {
  let correct = 0;
  let wrong = 0;
  let attempted = 0;

  questions.forEach((q, index) => {
    const given = answers[index];
    if (!given) return;

    attempted++;

    if (given === q.correctAnswer) {
      correct++;
    } else {
      wrong++;
    }
  });

  const skipped = questions.length - attempted;
  const score =
    correct * marksPerQuestion - wrong * negativeMarks;

  return {
    totalQuestions: questions.length,
    attempted,
    correct,
    wrong,
    skipped,
    score: Math.max(0, Number(score.toFixed(2))),
  };
}
