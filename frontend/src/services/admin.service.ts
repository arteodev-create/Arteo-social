import client from '@shared/api/httpClient';
import type { ApiResponse } from '@shared/api';

/**
 * AdminService (ADS v1.1 Platinum)
 * Manages system administration APIs.
 * Supports remote administration flows.
 */
export const AdminService = {
  // Resolve the target URL for local or remote nodes.
  getEndpoint: (path: string, baseUrl?: string) => {
    if (baseUrl) {
      // Avoid duplicating /api when the remote base URL or path already includes it.
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${cleanBase}${cleanPath}`;
    }
    return path;
  },

  getStats: async (baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint('/admin/stats', baseUrl);
    const response = await client.get(url);
    return response.data;
  },

  getHealth: async (baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint('/admin/health', baseUrl);
    const response = await client.get(url);
    return response.data;
  },

  getUsers: async (params: any = {}, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint('/admin/users', baseUrl);
    const response = await client.get(url, { params });
    return response.data;
  },

  updateUser: async (uuid: string, data: any, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint(`/admin/users/${uuid}`, baseUrl);
    const response = await client.patch(url, data);
    return response.data;
  },

  // Post Moderation
  getPosts: async (params: any = {}, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint('/admin/posts', baseUrl);
    const response = await client.get(url, { params });
    return response.data;
  },

  deletePost: async (uuid: string, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint(`/admin/posts/${uuid}`, baseUrl);
    const response = await client.delete(url);
    return response.data;
  },

  // Database Management
  getTables: async (baseUrl?: string): Promise<ApiResponse<string[]>> => {
    const url = AdminService.getEndpoint('/admin/db/tables', baseUrl);
    const response = await client.get(url);
    return response.data;
  },

  getTableSchema: async (table: string, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint(`/admin/db/schema/${table}`, baseUrl);
    const response = await client.get(url);
    return response.data;
  },

  getTableData: async (table: string, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint(`/admin/db/data/${table}`, baseUrl);
    const response = await client.get(url);
    return response.data;
  },

  updateColumn: async (table: string, data: any, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint(`/admin/db/column/${table}`, baseUrl);
    const response = await client.patch(url, data);
    return response.data;
  },

  addColumn: async (table: string, data: any, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint(`/admin/db/column/${table}`, baseUrl);
    const response = await client.post(url, data);
    return response.data;
  },

  addRow: async (table: string, data: any, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint(`/admin/db/row/${table}`, baseUrl);
    const response = await client.post(url, data);
    return response.data;
  },

  deleteRow: async (table: string, rowData: any, baseUrl?: string): Promise<ApiResponse<any>> => {
    const url = AdminService.getEndpoint(`/admin/db/row/${table}`, baseUrl);
    const response = await client.delete(url, { data: rowData });
    return response.data;
  }
};

