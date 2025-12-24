import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = 'https://pharma2g.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/notes/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
