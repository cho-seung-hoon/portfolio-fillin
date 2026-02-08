import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types/auth";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateName: (name: string) => void;
    updateProfileImage: (imageUrl: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            login: (user, token) =>
                set({
                    user,
                    accessToken: token,
                    isAuthenticated: true,
                }),
            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                }),
            updateName: (name) =>
                set((state) => ({
                    user: state.user ? { ...state.user, name } : null,
                })),
            updateProfileImage: (profileImageUrl) =>
                set((state) => ({
                    user: state.user ? { ...state.user, profileImageUrl } : null,
                })),
        }),
        {
            name: "auth-storage", // local storage key
            storage: createJSONStorage(() => localStorage),
        }
    )
);
