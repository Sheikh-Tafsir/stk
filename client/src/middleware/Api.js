import axios from 'axios';

import { ACCESS_TOKEN, getAccessToken } from '../utils/utils';

const API_PATH = import.meta.env.VITE_API_PATH;

const API = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
    timeout: 20000,
    headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
    },
});

API.interceptors.request.use(
    (config) => {
        const token = getAccessToken()
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    response => response,
    async error => {
        const response = error?.response;

        const originalRequest = error?.config;

        if (response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log(response.data);
            if (!response.data?.refreshTokenValid) {
                handleLogout();
            } else {
                const token = await refreshAccessToken();
                if (!token) {
                    return Promise.reject(error);
                }

                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return API.request(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

// Function to refresh the access token
const refreshAccessToken = async () => {
    try {
        const { data } = await API.post(`/auth/refresh`);
        //console.log(data.message);
        localStorage.setItem(ACCESS_TOKEN, data.token);
        return data.token;
    } catch (error) {
        console.error('Unable to refresh token:', error);
        return null;
    }
};

const handleLogout = async () => {
    try {
        await API.get(`/auth/logout`);
    } catch (error) {
        console.error("Logout failed");
    } finally {
        localStorage.removeItem(ACCESS_TOKEN);
        window.open("/", "_top");
    }
};

export { API_PATH, API, refreshAccessToken, handleLogout };