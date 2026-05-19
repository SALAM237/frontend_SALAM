import { create } from 'zustand';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  memberStatus: 'pending' | 'active' | 'suspended' | 'rejected';
  roles: { name: string; slug: string; permissions: string[] }[];
  avatar?: string;
  bureauPoste?: string | null;
  customPermissions?: string[];
  deniedPermissions?: string[];
  effectivePermissions?: string[]; // ['*'] for super_admin, else computed list
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;

  setAuth:    (user: AuthUser, accessToken: string) => void;
  setToken:   (accessToken: string) => void;
  patchUser:  (patch: Partial<AuthUser>) => void;
  clearAuth:  () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,

  setAuth: (user, accessToken) => {
    if (typeof document !== 'undefined') {
      document.cookie = 'salam_auth=1; path=/; SameSite=Lax; max-age=86400';
      // Clear any previously chosen space so choisir-espace is always shown at each login
      document.cookie = 'salam_space=; path=/; max-age=0';
    }
    set({ user, accessToken });
  },
  setToken:  (accessToken) => set({ accessToken }),
  patchUser: (patch) => set(state => ({
    user: state.user ? { ...state.user, ...patch } : null,
  })),
  clearAuth: () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'salam_auth=; path=/; max-age=0';
      document.cookie = 'salam_space=; path=/; max-age=0';
    }
    set({ user: null, accessToken: null });
  },
}));
