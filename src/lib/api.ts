import axios from 'axios';
import { toast } from 'sonner';
import { config, getEnvironmentConfig, debugLog } from './config';

const envConfig = getEnvironmentConfig();

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: envConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    debugLog('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
    });
    return config;
  },
  (error) => {
    debugLog('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    debugLog('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    debugLog('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        toast.error('Unauthorized. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (status === 403) {
        toast.error('Access forbidden. You do not have permission to perform this action.');
      } else if (status === 404) {
        toast.error('Resource not found.');
      } else if (status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        const message = data.detail || data.message || 'An error occurred.';
        toast.error(`Error: ${message}`);
      }
    } else if (error.request) {
      toast.error('No response from server. Please check your connection.');
    } else {
      toast.error(`Request error: ${error.message}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;