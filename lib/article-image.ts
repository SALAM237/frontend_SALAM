export function articleImage(article: any): string {
  const raw = (
    article?.data?.thumbnailUrl
    || article?.thumbnailUrl
    || article?.data?.mediumUrl
    || article?.mediumUrl
    || article?.data?.largeUrl
    || article?.largeUrl
    || article?.data?.imageUrl
    || article?.imageUrl
    || article?.data?.coverImage
    || article?.coverImage
    || article?.data?.image
    || article?.image
    || ''
  );
  if (!raw || /^data:|^blob:/i.test(raw)) return raw;

  const version = article?.updatedAt || article?.createdAt;
  if (!version) return raw;

  const [base, hash = ''] = String(raw).split('#');
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}v=${encodeURIComponent(String(version))}${hash ? `#${hash}` : ''}`;
}
