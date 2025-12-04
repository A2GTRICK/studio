// client-side MCQ service (uses your existing firebase client config)
import { db } from "@/firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export type MCQQuestion = {
  id?: string;
  q: string;
  options: string[];
  answer: number;
  explanation?: string;
};

export type MCQSet = {
  id: string;
  title: string;
  subject?: string;
  course?: string;
  description?: string;
  timeLimit?: number; // minutes
  questions: MCQQuestion[];
};

export async function fetchAllMCQSets(): Promise<MCQSet[]> {
  try {
    const q = query(collection(db, "mcqSets"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data.title || `MCQ Set ${d.id}`,
        subject: data.subject || "",
        course: data.course || "",
        description: data.description || "",
        timeLimit: data.timeLimit || null,
        questions: Array.isArray(data.questions) ? data.questions : [],
      } as MCQSet;
    });
  } catch (err) {
    console.error("fetchAllMCQSets error", err);
    return [];
  }
}
