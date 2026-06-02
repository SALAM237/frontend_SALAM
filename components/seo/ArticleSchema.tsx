import { SITE_NAME, SITE_URL } from '@/lib/seo';
import JsonLd from './JsonLd';

type ArticleSchemaProps = {
  title: string;
  description?: string;
  slug: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
};

export default function ArticleSchema({ title, description, slug, image, publishedAt, updatedAt }: ArticleSchemaProps) {
  return (
    <JsonLd
      id="article-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description ?? title,
        image: [image || `${SITE_URL}/og-image.jpg`],
        datePublished: publishedAt,
        dateModified: updatedAt ?? publishedAt,
        author: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/images/logo/logo_salam_192.webp`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/actualites/${slug}`,
        },
      }}
    />
  );
}
