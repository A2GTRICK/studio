import { DocumentSummarizerForm } from "@/components/document-summarizer-form";
import { BookText } from "lucide-react";

export default function AiDocumentSummarizerPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <BookText className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            AI Document Summarizer
          </h1>
        </div>
        <p className="text-muted-foreground">
          Paste your document below to get a concise summary.
        </p>
      </div>

      <DocumentSummarizerForm />
    </div>
  );
}
