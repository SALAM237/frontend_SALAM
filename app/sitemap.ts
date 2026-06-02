import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const publicRoutes = [
  '',
  '/a-propos',
  '/activites',
  '/actualites',
  '/adhesion',
  '/antennes',
  '/bureau-executif',
  '/commissions',
  '/conditions',
  '/confidentialite',
  '/conseil-des-sages',
  '/contact',
  '/cookies',
  '/don',
  '/galerie',
  '/mentions-legales',
  '/missions',
  '/mot-du-president',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/adhesion' || route === '/don' || route === '/contact' ? 0.9 : 0.7,
  }));
}
