import client from '@shared/api/httpClient';

export const CivicService = {
    toggleFollow: async (uuid: string) => {
        const response = await client.post(`/civic/${uuid}/toggle-follow`);
        return response.data;
    },

    getRelationshipStatus: async (uuid: string) => {
        const response = await client.get(`/civic/${uuid}/status`);
        return response.data;
    },

    toggleReaction: async (postId: string, emoji: string) => {
        const response = await client.post(`/civic/posts/${postId}/react`, { emoji });
        return response.data;
    },

    reportPost: async (postId: string, reason: string = 'policy_violation') => {
        try {
            const response = await client.post(`/civic/posts/${postId}/report`, { reason });
            return response.data;
        } catch (error) {
            const fallback = await client.post(`/posts/${postId}/report`, { reason });
            return fallback.data;
        }
    },

    blockUser: async (uuid: string) => {
        try {
            const response = await client.post(`/civic/${uuid}/block`);
            return response.data;
        } catch (error) {
            const fallback = await client.post(`/users/${uuid}/block`);
            return fallback.data;
        }
    }
};

