'use client';
import Link from 'next/link';

type PostSmall = { id: string; title: string; summary?: string; createdAt?: string | null };

export default function RecommendedPosts({ posts }: { posts: PostSmall[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <aside className="bg-white rounded-lg p-4 shadow-sm">
      <h4 className="text-lg font-semibold mb-3">Read this also</h4>
      <ul className="space-y-3">
        {posts.map(p => {
          return (
            <li key={p.id} className="border-b pb-2 last:border-0">
              <Link href={`/blog/${p.id}`} className="block hover:underline">
                <h5 className="font-medium">{p.title}</h5>
                {p.createdAt && <div className="text-xs text-muted-foreground">{p.createdAt}</div>}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
