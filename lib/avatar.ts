import { assetUrl } from './assets';

export function memberInitialsClass(gender?: string | null) {
  return gender === 'femme'
    ? 'bg-gradient-to-br from-rose-500 to-fuchsia-700'
    : 'bg-gradient-to-br from-emerald-600 to-emerald-800';
}

export function memberPhotoUrl(user?: { avatar?: string | null; bureauPhoto?: string | null } | null) {
  return assetUrl(user?.avatar) || assetUrl(user?.bureauPhoto) || '';
}
