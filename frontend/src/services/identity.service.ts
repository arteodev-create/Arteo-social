import client from '@shared/api/httpClient';
import type { ApiResponse } from '@shared/api';
import type { User } from '@entities/user/model';
import type { AuthResponseData, RegisterData } from '@entities/session/model';
import { toSnakeCase } from '@shared/lib';

/**
 * IdentityService (ADS v1.1 Platinum)
 * Centralized service for the Arteo Identity System (AIS).
 * Refactored to eliminate duplication and legacy monolithic debts.
 */
export const IdentityService = {
    /**
     * Identification vectors.
     */
    authenticate: async (identifier: string, credential: string, lang?: string): Promise<ApiResponse<AuthResponseData>> => {
        const response = await client.post('/users/authenticate', { identifier, credential, language: lang });
        return response.data;
    },

    checkIdentifier: async (identifier: string, turnstileToken?: string) => {
        const response = await client.get(`/users/check?identifier=${identifier}${turnstileToken ? `&turnstileToken=${turnstileToken}` : ''}`);
        return response.data;
    },

    /**
     * Identity establishment.
     */
    establish: async (data: Partial<RegisterData> & { credential?: string; language?: string; turnstileToken?: string }) => {
        const payload = {
            username: data.username,
            email: data.email,
            credential: data.password || data.credential,
            fullName: data.fullName || data.username,
            language: data.language || data.lang || 'en',
            turnstileToken: data.turnstileToken
        };
        const response = await client.post('/users/establish', payload);
        return response.data;
    },

    /**
     * Verification & Recovery.
     */
    verify: async (email: string, code: string, lang?: string) => {
        const response = await client.post('/users/verify', { email, code, lang });
        return response.data;
    },

    resendVerification: async (email: string, lang?: string) => {
        const response = await client.post('/users/resend-verify', { email, language: lang });
        return response.data;
    },

    recover: async (email: string, lang?: string) => {
        const response = await client.post('/users/recover', { email, lang });
        return response.data;
    },

    completeRecovery: async (token: string, credential: string) => {
        const response = await client.post('/users/recover/complete', { token, credential });
        return response.data;
    },

    refreshSession: async (): Promise<ApiResponse<AuthResponseData>> => {
        const response = await client.post('/users/refresh-token');
        return response.data;
    },

    /**
     * Profile & Session Management.
     */
    getProfile: async (): Promise<ApiResponse<User>> => {
        const response = await client.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: any): Promise<ApiResponse<User>> => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value === undefined) return;

            if (value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(toSnakeCase(value)));
            } else {
                formData.append(key, String(value));
            }
        });

        const response = await client.put('/users/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    rotateCredential: async (oldCredential: string, newCredential: string) => {
        const response = await client.put('/users/rotate-credential', { oldCredential, newCredential });
        return response.data;
    },

    getSessions: async () => {
        const response = await client.get('/users/sessions');
        return response.data;
    },

    getLoginStats: async () => {
        const response = await client.get('/users/sessions/stats');
        return response.data;
    },

    revokeSession: async (sessionId: string) => {
        const response = await client.post('/users/revoke-session', { sessionId });
        return response.data;
    },

    logout: async (): Promise<ApiResponse> => {
        const response = await client.post('/users/logout');
        return response.data;
    }
};
