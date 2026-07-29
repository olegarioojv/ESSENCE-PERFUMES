import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setToken } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setSession: (user: User, token: string) => void;
}

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  user?: User;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      async login(email, password) {
        const res = await api<LoginResponse>("/auth/login", {
          method: "POST",
          body: { email, password },
          auth: false,
        });
        const token = res.accessToken ?? res.access_token ?? res.token ?? null;
        if (!token) throw new Error("Resposta de login inválida.");
        setToken(token);
        set({
          token,
          user: res.user ?? { id: "me", email },
          isAuthenticated: true,
        });
      },
      logout() {
        setToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },
      setSession(user, token) {
        setToken(token);
        set({ user, token, isAuthenticated: true });
      },
    }),
    {
      name: "essence.auth",
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setToken(state.token);
      },
    },
  ),
);
