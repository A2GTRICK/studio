"use client";
import React, { useState } from "react";
import { bulkUploadQuestions } from "@/services/practice";

export default function BulkUpload({ testId }: { testId: string }) {
  const [text, setText] = useState("");
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function parseCSV(csv: string) {
    const rows = csv.trim().split(/\r?\n/);
    const sections: Record<string, any> = {};
    for (const r of rows) {
      if (!r.trim()) continue;
      const cols = r.split(",");
      const section = (cols[0] || "Section").trim();
      const question = (cols[1] || "").trim();
      const options = (cols[5] || "").split("|").map(s => s.trim()).filter(Boolean);
      const answerIndex = cols[6] ? parseInt(cols[6], 10) : null;
      const explanation = cols[7] || "";
      if (!sections[section]) sections[section] = { title: section, questions: [] };
      sections[section].questions.push({
        text: question,
        type: cols[2] || "single",
        marks: parseFloat(cols[3] || "1") || 1,
        negative: parseFloat(cols[4] || "0") || 0,
        options, answer: answerIndex, explanation
      });
    }
    return Object.values(sections);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      let sections: any[] = [];
      if (format === "json") {
        sections = JSON.parse(text);
      } else {
        sections = parseCSV(text);
      }
      const res = await bulkUploadQuestions(testId, sections);
      if (res?.error) {
        setMsg("Error: " + (res.error || "unknown"));
      } else {
        setMsg("Upload successful");
        setText("");
      }
    } catch (err: any) {
      setMsg("Parse or network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-2">
        <label className="mr-3"><input type="radio" checked={format==="csv"} onChange={()=>setFormat("csv")} /> CSV</label>
        <label className="ml-4"><input type="radio" checked={format==="json"} onChange={()=>setFormat("json")} /> JSON</label>
      </div>
      <textarea className="w-full border p-2 rounded" rows={10} value={text} onChange={(e)=>setText(e.target.value)}
        placeholder={format==="csv" ? "section,question,type,marks,negative,option1|option2|...,answerIndex,explanation" : "JSON array of sections"} />
      <div className="mt-3 flex items-center gap-3">
        <button className="px-3 py-2 bg-green-600 text-white rounded" type="submit" disabled={loading}>{loading ? "Uploading..." : "Upload"}</button>
        <div className="text-sm text-gray-600">{msg}</div>
      </div>
    </form>
  );
}