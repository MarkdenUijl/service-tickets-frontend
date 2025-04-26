import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const authApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export default authApi;