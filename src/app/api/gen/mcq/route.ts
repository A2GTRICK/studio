import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { topic, count } = await req.json();

  if (!topic) {
    return NextResponse.json({ mcqs: [] });
  }

  const total = Number(count) || 5;

  // temporary fake MCQs (we replace with AI later)
  const generated = [];

  for (let i = 1; i <= total; i++) {
    generated.push({
      question: `(${i}) Sample question on ${topic}?`,
      options: [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ]
    });
  }

  return NextResponse.json({ mcqs: generated });
}
