import axios from 'axios';
import { toSnakeCase, toCamelCase } from '@shared/lib';
import { tokenStorage } from './tokenStorage';

/**
 * Arteo Standard Transport Client (ASTC)
 * Configures Axios and global interceptors.
 * Follows the Arteo Standard Protocol.
 */

const DEFAULT_API_URL = 'https://acs-production-3833.up.railway.app/api';

const getBaseUrl = () => {
  if (typeof window === 'undefined') return process.env.REACT_APP_API_URL || DEFAULT_API_URL;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return process.env.REACT_APP_API_URL || DEFAULT_API_URL;
  }
  return process.env.REACT_APP_API_URL || DEFAULT_API_URL;
};

const client = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

/**
 * Updates the base URL when the user switches server nodes from the auth screen.
 */
export const updateClientBaseUrl = () => {
  const newBaseUrl = getBaseUrl();
  client.defaults.baseURL = newBaseUrl;
};

// Refresh token logic variables
let isRefreshing = false;
type RefreshQueueItem = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

let failedQueue: RefreshQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

client.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (config.data && !(config.data instanceof FormData)) {
    config.data = toSnakeCase(config.data);
  }
  
  if (config.params) {
    config.params = toSnakeCase(config.params);
  }
  
  return config;
});

client.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = toCamelCase(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      try {
        const response = await axios.post(`${getBaseUrl()}/users/refresh-token`, refreshToken ? { refreshToken } : {}, {
          withCredentials: true,
        });

        const { tokens } = response.data.data;
        const { accessToken, refreshToken: newRefreshToken } = tokens;
        
        tokenStorage.setTokens(accessToken, newRefreshToken);

        client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data) {
      error.response.data = toCamelCase(error.response.data);
    }

    return Promise.reject(error);
  }
);

export default client;
