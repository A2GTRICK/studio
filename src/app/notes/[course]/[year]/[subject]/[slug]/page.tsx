
import { fetchAllNotes, Note } from "@/services/notes";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  params: {
    course: string;
    year: string;
    subject: string;
    slug: string;
  };
};

/**
 * 🔒 STRIP ALL LINKS & EMBEDS
 * This ensures premium content cannot leak via:
 * - Google Drive links
 * - Markdown links
 * - Bare URLs
 * - iframes / embeds
 */
function stripLinks(text: string): string {
  if (!text) return "";

  return text
    // Remove markdown links: [text](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/gi, "$1")
    // Remove bare URLs
    .replace(/https?:\/\/\S+/gi, "")
    // Remove iframe blocks
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    // Remove embed tags
    .replace(/<embed[\s\S]*?>/gi, "")
    // Cleanup extra whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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

  const title = `${note.title} | ${subject} | ${course} Notes | pharmA2G`;
  const description = `Exam-focused ${subject} notes for ${course} ${year} on the topic "${note.title}", aligned with GPAT and university syllabus.`;

  const url = `${
    process.env.NEXT_PUBLIC_BASE_URL || "https://pharma2g.com"
  }/notes/${params.course}/${params.year}/${params.subject}/${params.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
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

  if (!note) {
    notFound();
  }

  const isPremium = note.isPremium === true;

  /**
   * 🔐 PREMIUM RULE
   * - Free notes → full content
   * - Premium notes → text-only sanitized preview
   */
  const rawPreview = note.short || note.content || "";

  const contentToShow = isPremium
    ? stripLinks(rawPreview).substring(0, 300) + "..."
    : note.content || "";

  /**
   * 🚫 Disable raw HTML rendering for premium notes
   */
  const rehypePlugins = isPremium ? [] : [rehypeRaw];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold">{note.title}</h1>

      <p className="text-muted-foreground mt-2">
        {note.course} • {note.year} • {note.subject}
      </p>

      <article className="prose lg:prose-lg mt-8 max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={rehypePlugins}
        >
          {contentToShow}
        </ReactMarkdown>
      </article>

      {isPremium && (
        <div className="mt-10 text-center p-6 border-dashed border-2 rounded-lg bg-secondary">
          <h3 className="font-bold text-lg">This is a premium note.</h3>
          <p className="text-muted-foreground mt-1">
            Continue reading on pharmA2G to unlock the full content.
          </p>

          <Button asChild className="mt-4">
            <Link href={`/dashboard/notes/view/${note.id}`}>
              Unlock Full Content
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
