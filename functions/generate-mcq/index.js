const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// Middleware: simple admin-key check (replace with IAM or proper auth)
const requireAdminKey = (req, res, next) => {
  const key = req.get("x-admin-key");
  if (!key || key !== process.env.ADMIN_KEY) {
    res.status(403).send("Forbidden");
    return;
  }
  next();
};

exports.generateMcq = functions.https.onRequest(async (req, res) => {
  requireAdminKey(req, res, async () => {
    try {
      const { title, examType, topics, nQuestions = 20, difficulty = "Mixed", syllabusExamples } = req.body;
      if (!title || !examType || !topics) return res.status(400).send("Missing fields");

      // Build prompt for Genkit / Gemini
      const prompt = `
You are an expert pharmacy exam writer. Generate ${nQuestions} MCQs for examType: ${examType} on topics: ${topics.join(", ")}.
Return valid JSON array EXACTLY in this format:
[
 { "id":"q1", "question":"...", "options":["a","b","c","d"], "correctAnswer":"a", "explanation":"...", "topic":"...", "difficulty":"Easy|Medium|Hard", "examRelevance":0.0 }
]
Rules:
- Exactly 4 options each.
- correctAnswer must match one option exactly.
- Provide diverse difficulty levels (Easy/Medium/Hard).
- Keep explanations concise (1-2 sentences).
- Use exam-style language and emphasize high-probability questions.
  `;

      // TODO: Replace below with real Genkit/Gemini call. Example using axios to your AI-endpoint:
      // const aiResp = await axios.post(process.env.GENKIT_ENDPOINT, { prompt }, { headers: { Authorization: `Bearer ${process.env.GENKIT_KEY}` } });
      // For now, we simulate with local parsing or fail.
      const aiResp = { data: { text: "[]" } }; // placeholder

      // Parse & validate JSON
      let questions;
      try {
        questions = JSON.parse(aiResp.data.text);
        if (!Array.isArray(questions)) throw new Error("Invalid result");
      } catch (err) {
        console.error("AI parse error", err);
        return res.status(500).send("AI output parse failed");
      }

      // Minimal validation
      const valid = questions.every(q => q.question && Array.isArray(q.options) && q.options.length === 4 && q.correctAnswer);
      if (!valid) return res.status(500).send("AI returned invalid schema");

      // Save set
      const doc = {
        title,
        course: examType,
        subject: topics.join(", "),
        description: `AI generated ${nQuestions} questions for ${examType} on topics: ${topics.join(", ")}`,
        isPremium: true,
        questionCount: questions.length,
        questions,
        generatedBy: "ai-v1",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const ref = await admin.firestore().collection("mcqSets").add(doc);
      return res.json({ ok: true, id: ref.id });
    } catch (err) {
      console.error("generateMcq error", err);
      return res.status(500).send("Server error");
    }
  });
});
