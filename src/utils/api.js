import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const publicEndpoints = [
    '/auth/login',
    '/users'
];

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const url = new URL(config.url, API_URL);
    const isPublic = publicEndpoints.includes(url.pathname);

    if (!isPublic) {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response, 
    (error) => {
        let errorType = 'unknown';

        if (error.response) {
            if (error.response.status === 401) {
                errorType = 'unauthorized';
            } else {
                errorType = 'server';
            }
        } else if (error.request) {
            errorType = 'network';
        }

        return Promise.reject({
            type: errorType,
            originalError: error
        });
    }
);

export default api;