export function articleImage(article: any): string {
  return (
    article?.data?.imageUrl
    || article?.imageUrl
    || article?.data?.coverImage
    || article?.coverImage
    || article?.data?.image
    || article?.image
    || article?.thumbnailUrl
    || ''
  );
}
