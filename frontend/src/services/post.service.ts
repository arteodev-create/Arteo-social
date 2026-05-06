import client from '@shared/api/httpClient';
import type { ApiResponse } from '@shared/api';
import type { Post, PostFeedParams, CreatePostData, PostsPage } from '@entities/post/model/types';
import { toSnakeCase } from '@shared/lib';

/**
 * PostService (ADS v1.1 Platinum)
 * Manages posts, comments, and related interactions.
 */
export const PostService = {
  getFeed: async (params?: PostFeedParams): Promise<ApiResponse<PostsPage>> => {
    const response = await client.get('/posts', { params });
    return response.data;
  },

  getPosts: async (params?: PostFeedParams): Promise<ApiResponse<PostsPage>> => {
    const response = await client.get('/posts', { params });
    return response.data;
  },

  createPost: async (data: CreatePostData): Promise<ApiResponse<Post>> => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const val = (data as any)[key];
      if (val === undefined || val === null || val === '' || key === 'media') return;

      if (typeof val === 'object' && val !== null) {
        formData.append(key, JSON.stringify(toSnakeCase(val)));
      } else {
        formData.append(key, String(val));
      }
    });

    if (data.media && data.media.length > 0) {
      data.media.forEach(file => {
        formData.append('media', file);
      });
    }

    const response = await client.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPost: async (uuid: string): Promise<ApiResponse<Post>> => {
    const response = await client.get(`/posts/${uuid}`);
    return response.data;
  },

  likePost: async (uuid: string): Promise<ApiResponse> => {
    const response = await client.post(`/posts/${uuid}/like`);
    return response.data;
  },

  unlikePost: async (uuid: string): Promise<ApiResponse> => {
    const response = await client.delete(`/posts/${uuid}/like`);
    return response.data;
  },

  bookmarkPost: async (uuid: string): Promise<ApiResponse> => {
    const response = await client.post(`/posts/${uuid}/bookmark`);
    return response.data;
  },

  unbookmarkPost: async (uuid: string): Promise<ApiResponse> => {
    const response = await client.delete(`/posts/${uuid}/bookmark`);
    return response.data;
  },

  toggleRepost: async (uuid: string): Promise<ApiResponse<{ action: string; repostCount: number }>> => {
    const response = await client.post(`/posts/${uuid}/toggle-repost`);
    return response.data;
  },

  repostPost: async (uuid: string): Promise<ApiResponse<{ action: string; repostCount: number; isReposted: boolean }>> => {
    const response = await client.post(`/posts/${uuid}/repost`);
    return response.data;
  },

  unrepostPost: async (uuid: string): Promise<ApiResponse<{ action: string; repostCount: number; isReposted: boolean }>> => {
    const response = await client.delete(`/posts/${uuid}/repost`);
    return response.data;
  },

  deletePost: async (uuid: string): Promise<ApiResponse> => {
    const response = await client.delete(`/posts/${uuid}`);
    return response.data;
  },

  quotePost: async (uuid: string, data: CreatePostData): Promise<ApiResponse<Post>> => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.replySettings) formData.append('reply_settings', data.replySettings);
    if (data.gifUrl) formData.append('gif_url', data.gifUrl);
    if (data.scheduledAt) formData.append('scheduled_at', data.scheduledAt);
    if (data.topic) formData.append('topic', data.topic);

    if (data.poll) formData.append('poll', JSON.stringify(data.poll));
    if (data.linkPreview) formData.append('link_preview', JSON.stringify(data.linkPreview));

    if (data.media && data.media.length > 0) {
      data.media.forEach(file => formData.append('media', file));
    }

    const response = await client.post(`/posts/${uuid}/quote`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * User Specific Posts
   */
  getUserPosts: async (uuid: string, params: { page?: number; limit?: number; tab?: string } = {}): Promise<ApiResponse<PostsPage>> => {
    const response = await client.get(`/users/${uuid}/posts`, { params });
    return response.data;
  },

  getUserLikes: async (uuid: string, params: { page?: number; limit?: number } = {}): Promise<ApiResponse<PostsPage>> => {
    const response = await client.get(`/users/${uuid}/likes`, { params });
    return response.data;
  },

  /**
   * Comment Operations
   */
  getComments: async (postUuid: string, params: { page?: number; limit?: number } = {}) => {
    const response = await client.get(`/posts/${postUuid}/comments`, { params });
    return response.data;
  },

  createComment: async (postUuid: string, content: string, parentUuid?: string, media?: File[], gifUrl?: string, poll?: any, linkPreview?: any) => {
    const formData = new FormData();
    formData.append('content', content);
    if (parentUuid) formData.append('parent_uuid', parentUuid);
    if (gifUrl) formData.append('gif_url', gifUrl);
    if (poll) formData.append('poll', JSON.stringify(poll));
    if (linkPreview) formData.append('link_preview', JSON.stringify(linkPreview));

    if (media && media.length > 0) {
      media.forEach(file => formData.append('media', file));
    }

    const response = await client.post(`/posts/${postUuid}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteComment: async (uuid: string) => {
    const response = await client.delete(`/comments/${uuid}`);
    return response.data;
  },

  toggleCommentLike: async (uuid: string) => {
    const response = await client.post(`/comments/${uuid}/like`);
    return response.data;
  },

  /**
   * Poll Operations
   */
  votePoll: async (postUuid: string, optionUuid: string) => {
    const response = await client.post(`/polls/options/${optionUuid}/vote`);
    return response.data;
  },

  /**
   * Analysis & Utility
   */
  analyzeTopic: async (content: string) => {
    const response = await client.post('/posts/analyze-topic', { content });
    return response.data;
  },

  translatePost: async (postUuid: string, targetLang: string) => {
    const response = await client.post(`/posts/${postUuid}/translate`, { targetLang });
    return response.data;
  }
};
