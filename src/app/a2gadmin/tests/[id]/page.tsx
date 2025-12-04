"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import BulkUpload from "@/components/a2gadmin/BulkUpload";
import { bulkUploadQuestions } from "@/services/practice";

export default function EditTestPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || "";
  const [bulkUploadMsg, setBulkUploadMsg] = useState("");


  async function handleBulkUpload(questions: any[]) {
    if (!id) return;
    setBulkUploadMsg("Uploading...");
    
    // The new BulkUpload gives a simple format. We adapt it to the more complex
    // section/question structure the API expects.
    const sections = [{
        title: 'Imported Questions',
        questions: questions.map(q => ({
            text: q.question,
            type: 'single', // Assuming 'single' choice for this bulk format
            options: [q.optionA, q.optionB, q.optionC, q.optionD],
            answer: q.answer,
        }))
    }];

    const res = await bulkUploadQuestions(id, sections);
    if (res?.error) {
        setBulkUploadMsg("Error: " + res.error);
    } else {
        setBulkUploadMsg(`${questions.length} questions uploaded successfully!`);
    }
  }


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Test - {id}</h1>
      <div className="bg-white p-4 rounded text-black">
        <BulkUpload onUpload={handleBulkUpload} />
        {bulkUploadMsg && <p className="mt-2 text-sm text-gray-600">{bulkUploadMsg}</p>}
      </div>
    </div>
  );
}
