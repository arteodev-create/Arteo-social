import client from '@shared/api/httpClient';

/**
 * UtilService (ADS v1.1 Platinum)
 * Shared utility APIs such as link preview, upload, and URL shortening.
 */
export const UtilService = {
  getLinkPreview: async (url: string) => {
    const response = await client.get(`/utils/link-preview?url=${encodeURIComponent(url)}`);
    return response.data;
  },

  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await client.post('/utils/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  shortenUrl: async (url: string) => {
    const response = await client.post('/utils/shorten-url', { original_url: url });
    return response.data;
  },
};

