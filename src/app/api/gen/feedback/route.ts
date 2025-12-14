
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define a basic type for the question to satisfy TypeScript
interface Question {
  question: string;
  correctAnswer: string;
  explanation: string;
  topic: string;
  // Add other properties if they exist
}

export async function POST(req: NextRequest) {
  try {
    const { questions, selectedAnswers, score } = await req.json();

    // Basic validation
    if (!questions || !selectedAnswers || score === undefined) {
      return NextResponse.json({ feedback: "Missing required data to generate feedback." }, { status: 400 });
    }

    const totalQuestions = questions.length;
    const incorrectAnswers = questions.filter((q: Question, index: number) => selectedAnswers[index] !== q.correctAnswer);
    const percentage = Math.round((score / totalQuestions) * 100);

    let summary = `You scored ${score}/${totalQuestions} (${percentage}%). `;
    if (percentage === 100) {
        summary += "An outstanding performance! You have a perfect understanding of the material. Keep up the excellent work.";
    } else if (percentage >= 75) {
        summary += "A very strong performance! You have a solid grasp of the key concepts.";
    } else if (percentage >= 50) {
        summary += "A good effort. You understand the basics, but there are a few areas where you can improve.";
    } else {
        summary += "There are significant gaps in your understanding. Let's focus on the key areas you missed.";
    }

    const weakTopics = incorrectAnswers
      .map((q: Question) => q.topic)
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index); // Unique topics

    let topicAnalysis = "";
    if (weakTopics.length > 0) {
        topicAnalysis = `Based on your answers, you should focus on reviewing these topics: **${weakTopics.join(", ")}**.`;
    }

    const detailedBreakdown = incorrectAnswers.map((q: Question) => {
        const questionIndex = questions.findIndex((origQ: Question) => origQ.question === q.question);
        return `  - **Question:** "${q.question}"\n    - **Your Answer:** ${selectedAnswers[questionIndex]}\n    - **Correct Answer:** ${q.correctAnswer}\n    - **Key Takeaway:** ${q.explanation}`;
    }).join("\n\n");

    const generatedFeedback = `
### AI Feedback Report

**1. Overall Summary**
${summary}

**2. Key Areas for Improvement**
${topicAnalysis || "No specific weak topics identified, but a general review is recommended."}

**3. Detailed Incorrect Answer Breakdown**
${detailedBreakdown || "No incorrect answers to review. Great job!"}

**4. Next Steps**
- Review the explanations for the questions you got wrong.
- Re-read your notes on the identified weak topics.
- Try another practice quiz in a few days to check your improvement.

*(This is an auto-generated analysis to guide your studies.)*
`;

    return NextResponse.json({ feedback: generatedFeedback });

  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return NextResponse.json({ feedback: "An unexpected error occurred while generating feedback." }, { status: 500 });
  }
}
