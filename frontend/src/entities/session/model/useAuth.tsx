import React, { ReactNode, useEffect } from 'react';
import { useAuthStore } from './auth.store';
import { IdentityService } from '@services/identity.service';

/**
 * useAuth Proxy Hook (ADS v1.1 Platinum)
 * Professional abstraction layer for Arteo Identity System (AIS).
 * Refactored to eliminate fragmentation debt and point to core services.
 */
export const useAuth = () => {
    const store = useAuthStore();

    return {
        // State
        user: store.user,
        token: store.token,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,

        // Actions
        login: store.login,
        logout: store.logout,
        updateUser: store.updateUser,
        refreshUser: store.refreshProfile,
        
        /**
         * Identity Vectors
         */
        register: async (data: any) => {
            const response = await IdentityService.establish({ ...data, lang: 'en' });
            if (!response.success && !response.data) {
                const err: any = new Error(response.message || 'Registration failed');
                err.response = { data: response };
                throw err;
            }
            return response;
        },

        verifyEmail: async (email: string, code: string) => {
            const response = await IdentityService.verify(email, code, 'en');
            const payload = response.data || response;
            
            if (payload.user) {
                store.setAuth({
                    user: payload.user,
                    token: payload.tokens?.accessToken || payload.token,
                    isAuthenticated: true,
                    isLoading: false
                });
                return payload.user;
            }
            throw new Error(response.message || 'Verification failed');
        },

        resendVerification: async (email: string) => {
            return await IdentityService.recover(email, 'en');
        },

        forgotPassword: async (email: string) => {
            return await IdentityService.recover(email, 'en');
        },

        resetPassword: async (token: string, newPassword: string) => {
            return await IdentityService.completeRecovery(token, newPassword);
        },

        getLoginSessions: async () => {
            const response = await IdentityService.getSessions();
            return response.sessions || response.data?.sessions || [];
        }
    };
};

/**
 * AuthProvider (Consolidated)
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    useEffect(() => {
        const handleRefreshed = (e: any) => {
            const newToken = e.detail?.token;
            if (newToken) {
                useAuthStore.getState().setAuth({ token: newToken, isAuthenticated: true });
            }
        };

        window.addEventListener('arteo-token-refreshed' as any, handleRefreshed);
        return () => window.removeEventListener('arteo-token-refreshed' as any, handleRefreshed);
    }, []);

    return <>{children}</>;
};
