import client from '@shared/api/httpClient';
import type { ApiResponse } from '@shared/api';

/**
 * AlgorithmService (ABS v14.1 Platinum / Frontend ADS v1.1)
 * Routes requests for independent algorithm management services.
 */
export const AlgorithmService = {
  /**
   * Fetch the public algorithm gallery.
   */
  getPublicAlgorithms: async (): Promise<ApiResponse<any[]>> => {
    const response = await client.get('/algorithms/public');
    return response.data;
  },

  /**
   * Fetch all algorithms owned by the current user.
   */
  getAllAlgorithms: async (): Promise<ApiResponse<any[]>> => {
    // Append timestamp to bust browser cache for real-time updates
    const response = await client.get(`/algorithms?_t=${Date.now()}`);
    return response.data;
  },

  /**
   * Fetch algorithm details by UUID.
   */
  getAlgorithmById: async (uuid: string): Promise<ApiResponse<any>> => {
    const response = await client.get(`/algorithms/${uuid}`);
    return response.data;
  },

  /**
   * Create a new algorithm.
   */
  createAlgorithm: async (data: any): Promise<ApiResponse<any>> => {
    const response = await client.post('/algorithms', data);
    return response.data;
  },

  /**
   * Update algorithm metadata, weights, and configuration.
   */
  updateAlgorithm: async (uuid: string, data: any): Promise<ApiResponse<any>> => {
    const response = await client.put(`/algorithms/${uuid}`, data);
    return response.data;
  },

  /**
   * Enable or disable an algorithm in the current user feed.
   */
  setActiveAlgorithm: async (uuid: string): Promise<ApiResponse<any>> => {
    const response = await client.post(`/algorithms/${uuid}/activate`);
    return response.data;
  },

  /**
   * Install a public algorithm into the user workspace.
   */
  installAlgorithm: async (uuid: string): Promise<ApiResponse<any>> => {
    const response = await client.post(`/algorithms/${uuid}/install`);
    return response.data;
  },

  /**
   * Delete an algorithm from the backend repository.
   */
  deleteAlgorithm: async (uuid: string): Promise<ApiResponse<any>> => {
    const response = await client.delete(`/algorithms/${uuid}`);
    return response.data;
  },

  /**
   * Pin a favorite algorithm, up to the configured limit.
   */
  pinAlgorithm: async (uuid: string): Promise<ApiResponse<any>> => {
    const response = await client.post(`/algorithms/${uuid}/pin`);
    return response.data;
  },

  /**
   * Unpin an algorithm.
   */
  unpinAlgorithm: async (uuid: string): Promise<ApiResponse<any>> => {
    const response = await client.post(`/algorithms/${uuid}/unpin`);
    return response.data;
  }
};

