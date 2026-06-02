import type { MetadataRoute } from 'next';
import { SEO_SITEMAP_ROUTES, SITE_URL } from '@/lib/seo';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

  const staticUrls: MetadataRoute.Sitemap = SEO_SITEMAP_ROUTES.map(route => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [articlesRes, activitiesRes, opportunitiesRes] = await Promise.all([
    fetchJson<ApiResponse<ArticleItem[]>>('/api/v1/public/content'),
    fetchJson<ApiResponse<{ activities: ActivityItem[] }>>('/api/v1/public/activities'),
    fetchJson<ApiResponse<{ items: OpportunityItem[] }>>('/api/v1/public/opportunities'),
  ]);

  const articleUrls: MetadataRoute.Sitemap = (articlesRes?.data ?? [])
    .filter(item => item.slug || item._id)
    .map(item => ({
      url: `${SITE_URL}/actualites/${item.slug || item._id}`,
      lastModified: dateOrNow(item.updatedAt ?? item.createdAt, now),
      changeFrequency: 'daily',
      priority: 0.85,
    }));

  const activityUrls: MetadataRoute.Sitemap = (activitiesRes?.data?.activities ?? [])
    .filter(item => item.slug)
    .map(item => ({
      url: `${SITE_URL}/activites/${item.slug}`,
      lastModified: dateOrNow(item.updatedAt ?? item.startDate ?? item.createdAt, now),
      changeFrequency: 'daily',
      priority: 0.85,
    }));

  const opportunityUrls: MetadataRoute.Sitemap = (opportunitiesRes?.data?.items ?? [])
    .filter(item => item.slug || item._id)
    .map(item => ({
      url: `${SITE_URL}/opportunites/${item.slug || item._id}`,
      lastModified: dateOrNow(item.updatedAt ?? item.publishedAt ?? item.createdAt, now),
      changeFrequency: 'daily',
      priority: 0.85,
    }));

  return [...staticUrls, ...articleUrls, ...activityUrls, ...opportunityUrls];
}
