import type { AuthUser } from '@/store/auth.store';

const ADMIN_SLUGS = ['admin', 'super_admin'];

export function hasAdminRole(user: AuthUser | null): boolean {
  return user?.roles.some(r => ADMIN_SLUGS.includes(r.slug)) ?? false;
}

export function hasMemberAccess(user: AuthUser | null): boolean {
  return user?.memberStatus === 'active';
}

export function getPostLoginRedirect(user: AuthUser): string {
  const isAdmin  = hasAdminRole(user);
  const isMember = hasMemberAccess(user);

  if (isMember && isAdmin) return '/choisir-espace';
  if (isAdmin)             return '/admin/dashboard';
  return '/member/dashboard';
}
