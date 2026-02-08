import axios from "axios";
import { useAuthStore } from "../stores/authStore";

export const publicClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

client.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add delay for testing purposes
client.interceptors.request.use(async (config) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return config;
});

// Also add to publicClient if needed, or just client as most user actions are authenticated
publicClient.interceptors.request.use(async (config) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return config;
});

export default client;
