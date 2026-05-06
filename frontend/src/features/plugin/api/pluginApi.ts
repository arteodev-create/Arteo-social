import client from '@shared/api/httpClient';
import type { ApiResponse } from '@shared/api';
import type { Plugin, PluginDetailResponse, PluginListResponse, PluginPayload } from '@features/plugin/model';

export const pluginApi = {
  getPublicPlugins: async (): Promise<ApiResponse<PluginListResponse>> => {
    const response = await client.get('/plugins/public');
    return response.data;
  },

  getAllPlugins: async (): Promise<ApiResponse<PluginListResponse>> => {
    const response = await client.get('/plugins');
    return response.data;
  },

  getMyPlugins: async (): Promise<ApiResponse<PluginListResponse>> => {
    const response = await client.get('/plugins/my');
    return response.data;
  },

  getPluginById: async (uuid: string): Promise<ApiResponse<Plugin | PluginDetailResponse>> => {
    const response = await client.get(`/plugins/${uuid}`);
    return response.data;
  },

  createPlugin: async (data: PluginPayload): Promise<ApiResponse<Plugin | PluginDetailResponse>> => {
    const response = await client.post('/plugins', data);
    return response.data;
  },

  updatePlugin: async (uuid: string, data: PluginPayload): Promise<ApiResponse<Plugin | PluginDetailResponse>> => {
    const response = await client.put(`/plugins/${uuid}`, data);
    return response.data;
  },

  installPlugin: async (uuid: string): Promise<ApiResponse<Plugin | PluginDetailResponse>> => {
    const response = await client.post(`/plugins/${uuid}/install`);
    return response.data;
  },

  uninstallPlugin: async (uuid: string): Promise<ApiResponse> => {
    const response = await client.delete(`/plugins/${uuid}/install`);
    return response.data;
  },

  downloadPlugin: async (uuid: string): Promise<void> => {
    const response = await client.get(`/plugins/${uuid}/download`, { responseType: 'blob' });
    const disposition = response.headers?.['content-disposition'] || '';
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] || `arteo-plugin-${uuid}.recode`;
    const url = window.URL.createObjectURL(response.data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  },

  deletePlugin: async (uuid: string): Promise<ApiResponse> => {
    const response = await client.delete(`/plugins/${uuid}`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await client.get('/plugins/categories');
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string }): Promise<ApiResponse<{ name: string }>> => {
    const response = await client.post('/plugins/categories', data);
    return response.data;
  },
};
