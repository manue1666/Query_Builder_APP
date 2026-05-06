import axios from "axios";

const API_URL = 'http://localhost:5112';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
    // Si response.data ya tiene la estructura { success, message, data }, devolverla tal cual
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        return response.data;
    }
    // Si no, envolver en la estructura esperada
    return {
        success: true,
        message: 'Success',
        data: response.data
    };
}, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
    }
    return Promise.reject(error);
});

export default api;