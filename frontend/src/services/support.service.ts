import client from '@shared/api/httpClient';
import type { ApiResponse } from '@shared/api';

/**
 * SupportService (ADS v1.1 Platinum)
 * Manages support tickets and admin support flows.
 */
export const SupportService = {
  /**
   * Support Tickets
   */
  createTicket: async (data: { subject: string; category: string; description: string; email?: string }): Promise<ApiResponse<any>> => {
    const response = await client.post('/support/tickets', data);
    return response.data;
  },

  getMyTickets: async (): Promise<ApiResponse<any[]>> => {
    const response = await client.get('/support/my-tickets');
    return response.data;
  },

  /**
   * Admin Operations
   */
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await client.get('/admin/stats');
    return response.data;
  }
};

