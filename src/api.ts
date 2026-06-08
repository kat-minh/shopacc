import axios from "axios";
import { useAuthStore } from "./store/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token to headers dynamically
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("haina_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle API response errors and extract data
apiInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = "Đã xảy ra lỗi hệ thống!";
    
    if (error.response) {
      const { status, data } = error.response;
      
      // If 401 Unauthorized (expired or invalid token), logout user automatically
      // EXCEPT for login attempts where we want to display the error message.
      if (status === 401 && !error.config?.url?.includes("auth/login")) {
        localStorage.removeItem("haina_token");
        useAuthStore.getState().logout();
      }
      
      errorMessage = data?.message || data?.title || errorMessage;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export const api = {
  get: <T>(endpoint: string, config?: any): Promise<T> => 
    apiInstance.get<any, T>(endpoint, config),
    
  post: <T>(endpoint: string, body?: any, config?: any): Promise<T> => 
    apiInstance.post<any, T>(endpoint, body, config),
    
  put: <T>(endpoint: string, body?: any, config?: any): Promise<T> => 
    apiInstance.put<any, T>(endpoint, body, config),
    
  delete: <T>(endpoint: string, config?: any): Promise<T> => 
    apiInstance.delete<any, T>(endpoint, config),
};
