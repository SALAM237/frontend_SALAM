import { SITE_NAME, SITE_URL } from '@/lib/seo';
import JsonLd from './JsonLd';

type EventSchemaProps = {
  title: string;
  description?: string;
  slug: string;
  startDate: string;
  endDate?: string;
  locationName?: string;
  image?: string;
};

export default function EventSchema({ title, description, slug, startDate, endDate, locationName, image }: EventSchemaProps) {
  return (
    <JsonLd
      id="event-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: title,
        description: description ?? title,
        startDate,
        endDate: endDate ?? startDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        image: [image || `${SITE_URL}/og-image.jpg`],
        location: {
          '@type': 'Place',
          name: locationName || SITE_NAME,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'CM',
          },
        },
        organizer: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
        url: `${SITE_URL}/activites/${slug}`,
      }}
    />
  );
}
