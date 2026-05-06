import client from '@shared/api/httpClient';
import type { ApiResponse } from '@shared/api';
import type { User } from '@entities/user/model';

/**
 * UserService (ADS v1.1 Platinum)
 * Manages advanced user profiles and AI profile metadata.
 */
export const UserService = {
  getProfile: async (uuid: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await client.get(`/users/${uuid}`);
    return response.data;
  },

  getProfileByUsername: async (username: string): Promise<User> => {
    const response = await client.get(`/users/check?username=${username}`);
    const result = response.data;
    if (!result.data?.exists || !result.data?.user) {
      throw new Error('Identity not found');
    }
    return result.data.user;
  },

  getSuggestions: async (limit: number = 3): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await client.get('/users/suggestions', { params: { limit } });
    return response.data;
  },

  pinPost: async (uuid: string): Promise<ApiResponse> => {
    const response = await client.post(`/users/pin-post/${uuid}`);
    return response.data;
  },

  /**
   * AI Profile Management
   */
  getAIProfiles: async (params?: { mine?: boolean }): Promise<ApiResponse<{ profiles: User[] }>> => {
    const response = await client.get('/users/ai-profiles', { params });
    return response.data;
  },

  getAISuggestions: async (limit: number = 10): Promise<ApiResponse<{ profiles: User[] }>> => {
    const response = await client.get('/users/ai-profiles/suggestions', { params: { limit } });
    return response.data;
  },

  getArenaProfiles: async (): Promise<ApiResponse<{ profiles: User[] }>> => {
    const response = await client.get('/users/arena/profiles');
    return response.data;
  },

  syncAIAvatars: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await client.post('/users/ai-profiles/sync-avatars');
    return response.data;
  },

  getStudioStats: async (): Promise<ApiResponse<any>> => {
    const response = await client.get('/users/ai-profiles/stats');
    return response.data;
  },

  createAIProfile: async (data: any): Promise<ApiResponse<{ user: User }>> => {
    const response = await client.post('/users/ai-profiles', data);
    return response.data;
  },

  updateAIProfile: async (data: any): Promise<ApiResponse<any>> => {
    const response = await client.put('/users/ai-profiles', data);
    return response.data;
  },

  getAIProfile: async (uuid: string): Promise<ApiResponse<any>> => {
    const response = await client.get(`/users/ai-profiles/${uuid}`);
    return response.data;
  },

  terminateAI: async (uuid: string): Promise<ApiResponse<any>> => {
    const response = await client.delete(`/users/ai-profiles/${uuid}`);
    return response.data;
  },

  getMyNomination: async (): Promise<ApiResponse<{ nomination: any }>> => {
    const response = await client.get('/users/ai-profiles/my-nomination');
    return response.data;
  },

  nominateAI: async (uuid: string): Promise<ApiResponse<{ nomination: any }>> => {
    const response = await client.post(`/users/ai-profiles/${uuid}/nominate`);
    return response.data;
  },

  verifyAIKey: async (apiKey: string, model?: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await client.post('/users/ai-profiles/verify-key', { apiKey, model });
    return response.data;
  },

  getAIActivities: async (uuid: string): Promise<ApiResponse<{ activities: any[] }>> => {
    const response = await client.get(`/users/ai-profiles/${uuid}/activities`);
    return response.data;
  },

  toggleAIPulse: async (uuid: string, isSleeping: boolean): Promise<ApiResponse<any>> => {
    const response = await client.post(`/users/ai-profiles/${uuid}/pulse`, { isSleeping });
    return response.data;
  },

  nurtureAI: async (uuid: string): Promise<ApiResponse<any>> => {
    const response = await client.post(`/users/ai-profiles/${uuid}/nurture`, {});
    return response.data;
  }
};

