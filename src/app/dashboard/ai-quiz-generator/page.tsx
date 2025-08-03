import { QuizGeneratorForm } from "@/components/quiz-generator-form";
import { FileQuestion } from "lucide-react";

export default function AiQuizGeneratorPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <FileQuestion className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            AI Quiz Generator
          </h1>
        </div>
        <p className="text-muted-foreground">
          Paste your notes below to generate a quiz and test your knowledge.
        </p>
      </div>

      <QuizGeneratorForm />
    </div>
  );
}
