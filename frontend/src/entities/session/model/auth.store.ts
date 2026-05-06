import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@entities/user/model';
import type { AuthResponseData, AuthState } from './types';
import { IdentityService } from '@services/identity.service';
import { tokenStorage } from '@shared/api';

interface AuthStore extends AuthState {
    isSubmitting: boolean;
    showRenewalNotice: boolean;
    setAuth: (data: Partial<AuthState>) => void;
    setShowRenewalNotice: (show: boolean) => void;
    login: (identifier: string, credential: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    refreshProfile: () => Promise<void>;
    refreshSession: () => Promise<void>;
    setLoading: (isLoading: boolean) => void;
    pendingEmail: string | null;
    setPendingEmail: (email: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            isSubmitting: false,
            showRenewalNotice: false,

            setAuth: (data) => set((state) => ({ ...state, ...data })),
            setShowRenewalNotice: (show) => set({ showRenewalNotice: show }),

            setLoading: (isLoading) => set({ isLoading }),
            
            pendingEmail: typeof window !== 'undefined' ? localStorage.getItem('pending_verify_email') : null,
            setPendingEmail: (email) => {
                if (email) localStorage.setItem('pending_verify_email', email);
                else localStorage.removeItem('pending_verify_email');
                set({ pendingEmail: email });
            },

            login: async (identifier, credential) => {
                set({ isSubmitting: true });
                try {
                    const response = await IdentityService.authenticate(identifier, credential, 'en');
                    if (response.success && response.data) {
                        const { user, tokens } = response.data as AuthResponseData;
                        const accessToken = tokens?.accessToken || (response.data as AuthResponseData).token;
                        const refreshToken = tokens?.refreshToken;

                        tokenStorage.setTokens(accessToken, refreshToken);

                        set({
                            user,
                            token: accessToken,
                            isAuthenticated: true,
                            isLoading: false,
                            isSubmitting: false
                        });
                    } else {
                        throw new Error(response.message || 'Login failed');
                    }
                } catch (error) {
                    set({ isSubmitting: false });
                    throw error;
                }
            },

            logout: () => {
                IdentityService.logout().catch(() => {
                    // Local logout should still complete even if the server is unreachable.
                });
                tokenStorage.clear();
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false
                });
                window.location.href = '/login';
            },

            updateUser: (user) => {
                set({ user });
            },

            refreshProfile: async () => {
                const token = get().token || tokenStorage.getAccessToken();
                
                // Initialize loading state if it is not present.
                set({ isLoading: true });

                if (!token) {
                    // Add a short delay so the flash logo has time to appear before hiding.
                    await new Promise(resolve => setTimeout(resolve, 800));
                    set({ isLoading: false });
                    return;
                }

                try {
                    // Keep the logo visible for at least one second for a more polished feel.
                    const [response] = await Promise.all([
                        IdentityService.getProfile(),
                        new Promise(resolve => setTimeout(resolve, 1200))
                    ]);

                    if (response.success && response.data) {
                        const userData = (response.data as any).user || response.data;
                        set({ user: userData, isAuthenticated: true });
                    }
                } catch (error: any) {
                    console.error('[AuthStore] Failed to refresh profile:', error);
                    if (error.response?.status === 401) {
                        get().logout();
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            refreshSession: async () => {
                set({ isLoading: true });
                try {
                    const response = await IdentityService.refreshSession();
                    if (response.success && response.data) {
                        const { user, tokens } = response.data as AuthResponseData;
                        const accessToken = tokens?.accessToken || response.data.token;
                        tokenStorage.setTokens(accessToken, tokens?.refreshToken);
                        set({
                            user,
                            token: accessToken || null,
                            isAuthenticated: true,
                            isLoading: false
                        });
                        return;
                    }
                    throw new Error(response.message || 'Session refresh failed');
                } catch (error) {
                    tokenStorage.clear();
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                }
            }
        }),
        {
            name: 'arteo-auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
            onRehydrateStorage: () => (state) => {
                const token = tokenStorage.getAccessToken();
                if (state && token) {
                    state.setAuth({ token });
                    state.refreshProfile();
                } else if (state?.isAuthenticated) {
                    state.refreshSession();
                } else {
                    // If there is no persisted token, end loading shortly so the landing page can render.
                    setTimeout(() => {
                        useAuthStore.getState().setLoading(false);
                    }, 1000);
                }
            }
        }
    )
);
