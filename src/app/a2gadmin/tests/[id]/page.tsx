"use client";
import { useParams } from "next/navigation";
import BulkUpload from "@/components/a2gadmin/BulkUpload";

export default function EditTestPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || "";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Test - {id}</h1>
      <div className="bg-white p-4 rounded">
        <BulkUpload testId={id} />
      </div>
    </div>
  );
}