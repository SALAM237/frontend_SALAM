export function fallbackMemberNumber(userId?: string | null, promotionYear?: number | null) {
  if (!userId) return '-';
  const year = promotionYear && Number.isInteger(promotionYear) ? promotionYear : new Date().getFullYear();
  return `SALAM-${year}-${userId.slice(-4).toUpperCase()}`;
}

export function displayMemberNumber(user?: { _id?: string; memberNumber?: string | null; promotionYear?: number | null } | null) {
  return user?.memberNumber || fallbackMemberNumber(user?._id, user?.promotionYear);
}

export function previewMemberNumber(gender?: string | null, promotionYear?: string | number | null) {
  const genderCode = gender === 'femme' ? '2' : '1';
  const year = Number(promotionYear) || new Date().getFullYear();
  return `SALAM-${genderCode}${year}0000`;
}
