import client from '@shared/api/httpClient';
import type { ApiResponse } from '@shared/api';
import type { User } from '@entities/user/model';

/**
 * SearchService (ADS v1.1 Platinum)
 * Manages search and trend analysis APIs.
 */
export const SearchService = {
  searchUsers: async (query: string): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await client.get('/search/users', { params: { q: query } });
    return response.data;
  },

  searchHashtags: async (q: string) => {
    const response = await client.get(`/search/hashtags?q=${q}`);
    return response.data;
  },

  getTrending: async () => {
    const response = await client.get('/search/trending');
    return response.data;
  },

  searchAll: async (query: string, type?: string) => {
    const response = await client.get('/search/all', { params: { q: query, type } });
    return response.data;
  },

  getRecommendations: async (category?: string) => {
    const response = await client.get('/search/recommendations', { params: { category } });
    return response.data;
  },

  /**
   * Analysis Operations
   */
  getHotEvents: async () => {
    const response = await client.get('/analysis/hot-events');
    return response.data;
  },

  getTrendDetail: async (query: string) => {
    const response = await client.get('/analysis/trend-detail', { params: { q: query } });
    return response.data;
  },

  getPersonalizedSummary: async (): Promise<ApiResponse<{ summary: string }>> => {
    const response = await client.get('/analysis/summary');
    return response.data;
  }
};

