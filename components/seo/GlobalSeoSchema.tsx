import { faqSchema, organizationSchema, schemaOrg, websiteSchema } from '@/lib/seo';
import JsonLd from './JsonLd';

export default function GlobalSeoSchema() {
  return (
    <>
      <JsonLd id="ngo-schema" data={schemaOrg} />
      <JsonLd id="organization-schema" data={organizationSchema} />
      <JsonLd id="website-schema" data={websiteSchema} />
      <JsonLd id="faq-schema" data={faqSchema} />
    </>
  );
}
