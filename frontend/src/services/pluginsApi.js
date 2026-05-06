import api from './api';

/**
 * Plugin API Client
 * Handles all plugin-related API calls
 */

// Get all plugins (public + user's private if authenticated)
export const getAllPlugins = async () => {
    const response = await api.get('/plugins');
    return response.data;
};

// Get single plugin by ID
export const getPluginById = async (id) => {
    const response = await api.get(`/plugins/${id}`);
    return response.data;
};

// Create new plugin
export const createPlugin = async (pluginData) => {
    const response = await api.post('/plugins', pluginData);
    return response.data;
};

// Update plugin
export const updatePlugin = async (id, pluginData) => {
    const response = await api.put(`/plugins/${id}`, pluginData);
    return response.data;
};

// Delete plugin
export const deletePlugin = async (id) => {
    const response = await api.delete(`/plugins/${id}`);
    return response.data;
};

// Get all public plugins for Store
export const getPublicPlugins = async () => {
    const response = await api.get('/plugins/public');
    return response.data;
};

export default {
    getAllPlugins,
    getPluginById,
    createPlugin,
    updatePlugin,
    deletePlugin,
    getPublicPlugins
};
