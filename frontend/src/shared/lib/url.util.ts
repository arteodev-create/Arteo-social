/**
 * Arteo URL Utility (v14.1 Platinum)
 * Centralized logic for single API endpoint normalization.
 */

import client from '@shared/api/httpClient';

const DEFAULT_API_URL = 'https://acs-production-3833.up.railway.app/api';

export const UrlUtil = {
  /**
   * Extract the base URL from the active client or window.location.
   */
  getApiBaseUrl: (): string => {
    return client.defaults.baseURL || '/api';
  },

  /**
   * Normalize a local server URL.
   */
  getLocalApiUrl: (): string => {
    return client.defaults.baseURL || DEFAULT_API_URL;
  },

  /**
   * Resolves a target node URL for remote administration.
   */
  resolveTargetUrl: (_domain: string): string => {
    return client.defaults.baseURL || DEFAULT_API_URL;
  }
};
