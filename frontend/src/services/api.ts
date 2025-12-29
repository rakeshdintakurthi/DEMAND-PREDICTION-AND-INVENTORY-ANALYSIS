import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
    uploadData: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getForecast: async () => {
        const response = await axios.post(`${API_URL}/forecast`, { data: [] });
        return response.data;
    },

    getInventoryPlan: async () => {
        const response = await axios.post(`${API_URL}/inventory`, { data: [] });
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await axios.get(`${API_URL}/dashboard`);
        return response.data;
    },

    login: async (username: string, password: string) => {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        return response.data;
    },

    getProductStats: async (product_name: string) => {
        const response = await axios.get(`${API_URL}/product-stats`, { params: { product_name } });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await axios.get(`${API_URL.replace('/api', '')}/auth/me`, { withCredentials: true });
        return response.data;
    },

    getHistory: async () => {
        const response = await axios.get(`${API_URL}/history`);
        return response.data;
    },

    clearData: async () => {
        const response = await axios.post(`${API_URL}/clear-data`);
        return response.data;
    },

    getNotifications: async () => {
        const response = await axios.get(`${API_URL}/notifications`);
        return response.data;
    },

    markNotificationsRead: async () => {
        const response = await axios.post(`${API_URL}/notifications/read`);
        return response.data;
    },

    clearNotifications: async () => {
        const response = await axios.post(`${API_URL}/notifications/clear`);
        return response.data;
    }
};
