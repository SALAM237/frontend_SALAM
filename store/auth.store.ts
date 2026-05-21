import { create } from 'zustand';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: 'homme' | 'femme';
  memberStatus: 'pending' | 'active' | 'suspended' | 'rejected';
  roles: { name: string; slug: string; permissions: string[] }[];
  avatar?: string;
  bureauPhoto?: string | null;
  bureauPoste?: string | null;
  customPermissions?: string[];
  deniedPermissions?: string[];
  effectivePermissions?: string[]; // ['*'] pour super_admin, sinon liste calculée
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;

  setAuth:     (user: AuthUser, accessToken: string) => void;
  restoreAuth: (user: AuthUser, accessToken: string) => void;
  setToken:    (accessToken: string) => void;
  patchUser:   (patch: Partial<AuthUser>) => void;
  clearAuth:   () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,

  // Connexion initiale — efface l'espace précédent pour forcer /choisir-espace
  setAuth: (user, accessToken) => {
    if (typeof document !== 'undefined') {
      document.cookie = 'salam_space=; path=/; max-age=0';
    }
    set({ user, accessToken });
  },

  // Restauration de session (refresh page) — ne touche pas salam_space
  restoreAuth: (user, accessToken) => set({ user, accessToken }),

  setToken:  (accessToken) => set({ accessToken }),
  patchUser: (patch) => set(state => ({
    user: state.user ? { ...state.user, ...patch } : null,
  })),
  clearAuth: () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'salam_space=; path=/; max-age=0';
    }
    set({ user: null, accessToken: null });
  },
}));
