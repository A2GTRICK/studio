import { MetadataRoute } from 'next';
import { fetchAllPosts } from '@/services/posts';
import { fetchAllNotes } from '@/services/notes';

const BASE_URL = 'https://pharma2g.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages (unchanged)
  const staticRoutes = [
    '',
    '/blog',
    '/dashboard',
    '/dashboard/notes',
    '/dashboard/mcq-practice',
    '/dashboard/services',
    '/dashboard/notifications',
    '/dashboard/about',
    '/dashboard/help',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic blog posts (unchanged)
  const posts = await fetchAllPosts();
  const postRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug || post.id}`,
    lastModified: post.updatedAt ? (post.updatedAt as any).toDate().toISOString() : new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // --- ADDITIVE CHANGE: NEW PUBLIC NOTE ROUTES ---
  const notes = await fetchAllNotes();
  const noteRoutes = notes.map((note) => ({
    url: `${BASE_URL}/notes/${note.course}/${note.year}/${note.subject}/${note.id}`,
    lastModified: note.updatedAt ? new Date(note.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const noteCategories = new Set<string>();
  notes.forEach(note => {
      noteCategories.add(`/notes/${note.course}`);
      noteCategories.add(`/notes/${note.course}/${note.year}`);
      noteCategories.add(`/notes/${note.course}/${note.year}/${note.subject}`);
  });

  const categoryRoutes = Array.from(noteCategories).map(route => ({
      url: `${BASE_URL}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
  }));
  
  // Combine all routes
  return [...staticRoutes, ...postRoutes, ...noteRoutes, ...categoryRoutes];
}
