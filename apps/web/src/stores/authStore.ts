import { create } from "zustand";
import { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User, token: string) => {
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("neroute_token");
      localStorage.removeItem("neroute_user");
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: () => {
    // Clear any old persisted sessions to force manual login
    if (typeof window !== "undefined") {
      localStorage.removeItem("neroute_token");
      localStorage.removeItem("neroute_user");
    }
    set({ isLoading: false, isAuthenticated: false, user: null, token: null });
  },
}));
