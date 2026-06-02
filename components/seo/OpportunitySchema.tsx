import { SITE_NAME, SITE_URL } from '@/lib/seo';
import JsonLd from './JsonLd';

type OpportunitySchemaProps = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  validThrough?: string;
  organization?: string;
  location?: string;
  remote?: boolean;
};

export default function OpportunitySchema({
  title,
  description,
  slug,
  publishedAt,
  validThrough,
  organization,
  location,
  remote,
}: OpportunitySchemaProps) {
  return (
    <JsonLd
      id="opportunity-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title,
        description,
        datePosted: publishedAt,
        ...(validThrough ? { validThrough } : {}),
        employmentType: 'OTHER',
        hiringOrganization: {
          '@type': 'Organization',
          name: organization || SITE_NAME,
          sameAs: SITE_URL,
        },
        applicantLocationRequirements: {
          '@type': 'Country',
          name: 'Cameroun',
        },
        jobLocationType: remote ? 'TELECOMMUTE' : undefined,
        jobLocation: {
          '@type': 'Place',
          name: location || 'À confirmer',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'CM',
          },
        },
        url: `${SITE_URL}/opportunites/${slug}`,
      }}
    />
  );
}
