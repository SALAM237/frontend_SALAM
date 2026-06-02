import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
  '/opportunites',
];

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type ArticleItem = {
  _id: string;
  slug?: string;
  updatedAt?: string;
  createdAt?: string;
};

type ActivityItem = {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
  startDate?: string;
};

type OpportunityItem = {
  _id: string;
  slug?: string;
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
};

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

function dateOrNow(value: string | undefined, now: Date) {
  return value ? new Date(value) : now;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = publicRoutes.map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
    priority: route === '' ? 1 : route === '/adhesion' || route === '/don' || route === '/contact' ? 0.9 : 0.7,
  }));

  const [articlesRes, activitiesRes, opportunitiesRes] = await Promise.all([
    fetchJson<ApiResponse<ArticleItem[]>>('/api/v1/public/content'),
    fetchJson<ApiResponse<{ activities: ActivityItem[] }>>('/api/v1/public/activities'),
    fetchJson<ApiResponse<{ items: OpportunityItem[] }>>('/api/v1/public/opportunities'),
  ]);

  const articleUrls = (articlesRes?.data ?? []).map(item => ({
    url: `${SITE_URL}/actualites/${item.slug || item._id}`,
    lastModified: dateOrNow(item.updatedAt ?? item.createdAt, now),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const activityUrls = (activitiesRes?.data?.activities ?? []).map(item => ({
    url: `${SITE_URL}/activites/${item.slug}`,
    lastModified: dateOrNow(item.updatedAt ?? item.startDate ?? item.createdAt, now),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const opportunityUrls = (opportunitiesRes?.data?.items ?? []).map(item => ({
    url: `${SITE_URL}/opportunites/${item.slug || item._id}`,
    lastModified: dateOrNow(item.updatedAt ?? item.publishedAt ?? item.createdAt, now),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  return [...staticUrls, ...articleUrls, ...activityUrls, ...opportunityUrls];
}
