import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "No content provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key missing." },
        { status: 500 }
      );
    }

    const prompt = `
Refine the following academic pharmacy note.
Make it clean, structured, readable, with headings, bullet points, examples, and improved formatting.
Do NOT add any new topics. Keep meaning and accuracy same.

CONTENT:
${content}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    const refined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Refinement unavailable.";

    return NextResponse.json({ refined });
  } catch (err) {
    console.error("AI refine error:", err);
    return NextResponse.json(
      { error: "AI refine failed." },
      { status: 500 }
    );
  }
}
