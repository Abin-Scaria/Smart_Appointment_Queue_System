import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            localStorage.removeItem('access_token');

            // Remove authorization header safely for axios
            if (originalRequest.headers && originalRequest.headers.Authorization) {
                delete originalRequest.headers.Authorization;
            }
            if (originalRequest.headers && typeof originalRequest.headers.delete === "function") {
                originalRequest.headers.delete("Authorization");
            }
            return api(originalRequest);
        }
        return Promise.reject(error);
    }
);

export default api;
