import { NoteGeneratorForm } from "@/components/note-generator-form";
import { Bot } from "lucide-react";

export default function AiNoteGeneratorPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            AI Note Generator
          </h1>
        </div>
        <p className="text-muted-foreground">
          Fill in the details below to generate comprehensive notes on any topic.
        </p>
      </div>

      <NoteGeneratorForm />
    </div>
  );
}
