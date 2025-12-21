
import { fetchAllPosts, type Post } from "@/services/posts";
import Image from "next/image";
import Link from "next/link";
import { Rss, Loader2, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The pharmA2G Blog | Pharmacy Exams, Notes & Preparation Insights",
  description:
    "Exam-focused insights, preparation strategies, and academic guidance for GPAT, AIIMS, RRB Pharmacist, D.Pharm & B.Pharm students.",
};

async function BlogList() {
  const posts = await fetchAllPosts();

  return (
    <>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: Post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug || post.id}`}
              className="group block h-full"
            >
              <article className="bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col border transition-all hover:-translate-y-1 hover:shadow-lg">
                {post.banner && (
                  <div className="relative w-full h-48">
                    <Image
                      src={post.banner}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {post.category || "Pharmacy Education"}
                  </span>

                  <h2 className="mt-2 text-lg font-bold leading-snug text-gray-900 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-grow">
                    {post.summary}
                  </p>

                  <div className="mt-4 text-xs text-muted-foreground">
                    ✍️ pharmA2G Team •{" "}
                    {post.createdAt
                      ? new Date(
                          (post.createdAt as any).seconds * 1000
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : ""}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <h2 className="text-2xl font-semibold text-gray-700">
            No Articles Published Yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            We’re preparing exam-focused content. Please check back soon.
          </p>
        </div>
      )}
    </>
  );
}

export default function BlogPage() {
  return (
    <div className="bg-secondary/30">
      <div className="container mx-auto px-4 py-12 md:py-16 space-y-14">
        {/* HEADER */}
        <header className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
            <Rss className="w-7 h-7" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            The pharmA2G Blog
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            Exam-focused insights, preparation strategies, and academic guidance
            for pharmacy students.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Updated regularly for <strong>GPAT</strong>, <strong>AIIMS</strong>,
            <strong> RRB Pharmacist</strong>, <strong>D.Pharm</strong> &
            <strong> B.Pharm</strong> aspirants.
          </p>
        </header>

        {/* BLOG LIST */}
        <Suspense
          fallback={
            <div className="flex flex-col justify-center items-center min-h-[400px]">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">
                Loading Articles…
              </h2>
              <p className="text-muted-foreground">
                Fetching the latest updates.
              </p>
            </div>
          }
        >
          <BlogList />
        </Suspense>

        {/* INTERNAL CONVERSION BRIDGE */}
        <section className="text-center pt-10">
          <h3 className="text-xl font-semibold mb-2">
            Ready to test your preparation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Practice with real exam-style mock tests designed for pharmacy
            exams.
          </p>
          <Link
            href="/dashboard/mock-test"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Explore Mock Tests <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
