import axios from "axios";

// Determine the base URL based on the current environment
const getBaseURL = () => {
  // ✅ Priority 1: Use environment variable if set (Vite uses VITE_ prefix)
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // ✅ Priority 2: Fallback to existing logic for backward compatibility
  if (typeof window !== "undefined") {
    const currentDomain = window.location.origin;

    // Production: use same domain (Nginx will proxy to backend)
    if (
      window.location.hostname === "yugaai.app" ||
      window.location.hostname === "66.116.198.191" ||
      window.location.hostname === "66.116.198.192"
    ) {
      return `${currentDomain}/api`;
    }

    // Development: use localhost when running locally
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:5000/api";
    }

    // Remote development server fallback
    return "http://136.114.45.61:5000/api";
  }

  // Final fallback
  return "/api";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 120000,
});

// ✅ Request Interceptor to inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the error is due to token expiration
    if (error.response?.status === 401 &&
      (error.response?.data?.error === 'TOKEN_EXPIRED' ||
        error.response?.data?.message?.includes('expired'))) {

      // Clear tokens from storage
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // Clear auth header
      delete api.defaults.headers.common["Authorization"];

      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/' &&
        !window.location.pathname.includes('/login')) {
        // Show user-friendly message
        console.warn("Session expired. Please log in again.");

        // Redirect to home page which will show login
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

// Enhanced API request function with better error handling
export const apiRequest = async (
  endpoint: string,
  method: string = "GET",
  body?: unknown,
  options: { responseType?: 'json' | 'blob' | 'text' | 'arraybuffer' } = {}
) => {
  try {
    const config: any = {
      url: endpoint,
      method,
      data: body,
      withCredentials: true,
    };

    if (options.responseType) {
      config.responseType = options.responseType;
    }

    const response = await api(config);

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: async () => response.data,
      text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
      blob: async () => response.data instanceof Blob ? response.data : new Blob([response.data]),
    };
  } catch (error: unknown) {
    console.error("API request failed:", error);

    // Type guard for axios error
    const axiosError = error as {
      response?: {
        status?: number;
        statusText?: string;
        data?: any;
      };
      message?: string;
    };

    // Create a mock response object to maintain compatibility
    const errorResponse = {
      ok: false,
      status: axiosError.response?.status || 500,
      statusText: axiosError.response?.statusText || "Network Error",
      json: async () => {
        if (typeof axiosError.response?.data === 'object') return axiosError.response?.data;
        return {
          error: axiosError.response?.data || axiosError.message || "Unknown error"
        };
      },
      text: async () => String(axiosError.response?.data || axiosError.message || "Unknown error"),
      blob: async () => new Blob([String(axiosError.response?.data || axiosError.message || "Unknown error")]),
    };

    return errorResponse;
  }
};

export const API_BASE_URL = getBaseURL();

