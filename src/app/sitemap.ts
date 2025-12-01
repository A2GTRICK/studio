import { MetadataRoute } from 'next';
import { fetchAllPosts } from '@/services/posts';

const BASE_URL = 'https://pharma2g.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
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
  }));

  // Dynamic blog posts
  const posts = await fetchAllPosts();
  const postRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.id}`,
    lastModified: post.updatedAt ? post.updatedAt.toDate().toISOString() : new Date().toISOString(),
  }));

  return [...staticRoutes, ...postRoutes];
}
