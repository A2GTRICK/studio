
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { course, subject, topic } = await req.json();

    // If any field missing
    if (!course || !subject || !topic) {
      return NextResponse.json({ notes: "Please fill all fields." }, { status: 400 });
    }

    // Temporary AI Response (we will replace with real AI soon)
    const generatedNotes = `
✔ Course: ${course}
✔ Subject: ${subject}
✔ Topic: ${topic}

Here are your auto-generated notes:

1. Introduction
2. Key Concepts
3. Mechanism of Action
4. Applications
5. Examples
6. Summary

(This is a temporary response. Real AI notes will be added soon!)
`;

    return NextResponse.json({ notes: generatedNotes });

  } catch (error) {
    return NextResponse.json({ notes: "Error generating notes." }, { status: 500 });
  }
}
