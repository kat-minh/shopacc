import { create } from "zustand";

export interface UserSession {
  username: string;
  balance: number;
}

export type AppView =
  | "home"
  | "login"
  | "register"
  | "admin"
  | "history"
  | "product-detail"
  | "profile"
  | "change-password"
  | "user-history"
  | "recharge";

interface AuthState {
  currentUser: UserSession;
  isAdmin: boolean;
  activeView: AppView;
  selectedAccountId: string | null;
  theme: "light" | "dark";
  toggleTheme: () => void;
  syncUser: (user: UserSession, isAdminState: boolean) => void;
  login: (user: UserSession, isAdminState: boolean) => void;
  logout: () => void;
  setActiveView: (view: AppView) => void;
  setSelectedAccountId: (id: string | null) => void;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => void;
}

const readStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
};

export const useAuthStore = create<AuthState>((set) => {
  // Read initial states from localStorage if available
  const defaultUser = readStorage<UserSession>("haina_user", {
    username: "hoang_gamer99",
    balance: 500000,
  });
  const defaultAdmin = readStorage<boolean>("haina_is_admin", false);
  const defaultTheme = readStorage<"light" | "dark">("haina_theme", "dark");

  return {
    currentUser: defaultUser,
    isAdmin: defaultAdmin,
    activeView: "home",
    selectedAccountId: null,
    theme: defaultTheme,

    toggleTheme: () =>
      set((state) => {
        const nextTheme = state.theme === "dark" ? "light" : "dark";
        if (typeof window !== "undefined") {
          window.localStorage.setItem("haina_theme", nextTheme);
        }
        return { theme: nextTheme };
      }),

    syncUser: (user, isAdminState) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("haina_user", JSON.stringify(user));
        window.localStorage.setItem(
          "haina_is_admin",
          JSON.stringify(isAdminState),
        );
      }
      set({ currentUser: user, isAdmin: isAdminState });
    },

    login: (user, isAdminState) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("haina_user", JSON.stringify(user));
        window.localStorage.setItem(
          "haina_is_admin",
          JSON.stringify(isAdminState),
        );
      }
      set({
        currentUser: user,
        isAdmin: isAdminState,
        activeView: isAdminState ? "admin" : "home",
      });
    },

    logout: () => {
      const guestUser = { username: "Khách", balance: 0 };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("haina_user", JSON.stringify(guestUser));
        window.localStorage.setItem("haina_is_admin", JSON.stringify(false));
      }
      set({
        currentUser: guestUser,
        isAdmin: false,
        activeView: "home",
      });
    },

    setActiveView: (view) => set({ activeView: view }),

    setSelectedAccountId: (id) => set({ selectedAccountId: id }),

    addBalance: (amount) =>
      set((state) => {
        const updatedUser = {
          ...state.currentUser,
          balance: state.currentUser.balance + amount,
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "haina_user",
            JSON.stringify(updatedUser),
          );
        }
        return { currentUser: updatedUser };
      }),

    deductBalance: (amount) =>
      set((state) => {
        const updatedUser = {
          ...state.currentUser,
          balance: Math.max(0, state.currentUser.balance - amount),
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "haina_user",
            JSON.stringify(updatedUser),
          );
        }
        return { currentUser: updatedUser };
      }),
  };
});
