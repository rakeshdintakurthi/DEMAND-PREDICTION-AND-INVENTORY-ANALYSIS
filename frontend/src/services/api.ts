import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const api = {
    getBaseUrl: () => API_URL,

    uploadData: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axiosInstance.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    getForecast: async () => {
        return (await axiosInstance.post('/forecast', { data: [] })).data;
    },

    getInventoryPlan: async () => {
        return (await axiosInstance.post('/inventory', { data: [] })).data;
    },

    getDashboardStats: async () => {
        return (await axiosInstance.get('/dashboard')).data;
    },

    login: async (username: string, password: string) => {
        return (await axiosInstance.post('/login', { username, password })).data;
    },

    getProductStats: async (product_name: string) => {
        return (await axiosInstance.get('/product-stats', { params: { product_name } })).data;
    },

    getProducts: async () => {
        return (await axiosInstance.get('/products')).data;
    },

    getCurrentUser: async () => {
        return (await axios.get(
            API_URL.replace('/api', '') + '/auth/me',
            { withCredentials: true }
        )).data;
    },

    getHistory: async () => {
        return (await axiosInstance.get('/history')).data;
    },

    clearData: async () => {
        return (await axiosInstance.post('/clear-data')).data;
    },

    getNotifications: async () => {
        return (await axiosInstance.get('/notifications')).data;
    },

    markNotificationsRead: async () => {
        return (await axiosInstance.post('/notifications/read')).data;
    },

    clearNotifications: async () => {
        return (await axiosInstance.post('/notifications/clear')).data;
    },

    chat: async (message: string, context: string) => {
        return (await axiosInstance.post('/chat', { message, context })).data;
    },
};
