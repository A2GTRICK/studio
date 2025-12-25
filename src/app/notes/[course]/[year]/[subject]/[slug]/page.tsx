
import { fetchAllNotes, Note } from "@/services/notes";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* =============================================================================
   SEO-ONLY PUBLIC NOTE PAGE
   Purpose:
   - Google indexing
   - Topic discovery
   - Preview only
   - All real reading happens in /dashboard/notes
============================================================================= */

/**
 * Removes links, embeds, and URLs to prevent premium leakage
 */
function sanitizeText(text: string): string {
  if (!text) return "";

  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/gi, "$1")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type Props = {
  params: {
    course: string;
    year: string;
    subject: string;
    slug: string;
  };
};

async function getNote(params: Props["params"]): Promise<Note | null> {
  const notes = await fetchAllNotes();

  const decodedCourse = decodeURIComponent(params.course);
  const decodedYear = decodeURIComponent(params.year);
  const decodedSubject = decodeURIComponent(params.subject);

  const note = notes.find((n) => n.id === params.slug);

  if (
    note &&
    note.course === decodedCourse &&
    note.year === decodedYear &&
    note.subject === decodedSubject
  ) {
    return note;
  }

  return null;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const note = await getNote(params);
  if (!note) return {};

  const course = decodeURIComponent(params.course);
  const year = decodeURIComponent(params.year);
  const subject = decodeURIComponent(params.subject);

  const title = `${note.title} | ${subject} | ${course} ${year} Notes`;
  const description =
    (note as any).seoSummary ||
    `Syllabus-aligned ${subject} notes for ${course} ${year}. Preview topics covered and read full structured notes inside the pharmA2G dashboard.`;

  const url = `${
    process.env.NEXT_PUBLIC_BASE_URL || "https://pharma2g.com"
  }/notes/${params.course}/${params.year}/${params.subject}/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
  };
}

export default async function PublicNotePage({ params }: Props) {
  const note = await getNote(params);
  if (!note) notFound();

  const isPremium = note.isPremium === true;

  /* --------------------------------------------------------------------------
     SEO CONTENT SOURCES
     Priority:
     1. seoSummary / seoPoints (explicit, best)
     2. Derived preview (sanitized, safe fallback)
  -------------------------------------------------------------------------- */

  const summary =
    (note as any).seoSummary ||
    sanitizeText(note.short || note.content || "").slice(0, 280);

  const points =
    (Array.isArray((note as any).seoPoints) && (note as any).seoPoints.length > 0)
      ? (note as any).seoPoints
      : sanitizeText(note.content || "")
          .split("\n")
          .filter((line) => line.length > 20)
          .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------------------------ */}
      <h1 className="text-3xl font-bold">{note.title}</h1>

      <p className="text-muted-foreground mt-2">
        {note.course} • {note.year} • {note.subject}
      </p>

      <p className="mt-3 text-sm text-muted-foreground">
        Preview for discovery. Full notes available inside the dashboard.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* SUMMARY */}
      {/* ------------------------------------------------------------------ */}
      {summary && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Summary</h2>
          <p className="mt-2 text-muted-foreground">{summary}</p>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TOPICS COVERED */}
      {/* ------------------------------------------------------------------ */}
      {points && points.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Topics Covered</h2>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-muted-foreground">
            {points.map((point: string, i: number) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CTA */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-10 text-center p-6 border rounded-lg bg-secondary">
        <h3 className="font-semibold text-lg">
          Read the full structured notes
        </h3>

        <p className="text-muted-foreground mt-1">
          Detailed explanations, examples, and downloadable resources are
          available inside the pharmA2G dashboard.
        </p>

        <Button asChild className="mt-4">
          <Link href={`/dashboard/notes/view/${note.id}`}>
            Open in Dashboard
          </Link>
        </Button>

        {isPremium && (
          <p className="mt-3 text-xs text-muted-foreground">
            Premium note • Full access requires login
          </p>
        )}
      </div>
    </div>
  );
}
