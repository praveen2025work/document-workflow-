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

// Calendar API
export const createCalendar = (data: { name: string; weekend_days: number[]; holidays: string[] }) => api.post('/calendars', data);
export const getCalendars = () => api.get('/calendars');

// Workflow API
export const createWorkflow = (data: { name: string; trigger_mechanism: string; frequency: string; start_working_day: number; start_time: string; calendar_id: number }) => api.post('/workflows', data);
export const getWorkflows = () => api.get('/workflows');
export const addWorkflowRole = (workflowId: number, data: { name: string }) => api.post(`/workflows/${workflowId}/roles`, data);
export const mapUserToRole = (workflowId: number, roleId: number, data: { user_id: number; role_id: number }) => api.post(`/workflows/${workflowId}/roles/${roleId}/users`, data);
export const addWorkflowTask = (workflowId: number, data: any) => api.post(`/workflows/${workflowId}/tasks`, data);
export const addWorkflowConnection = (workflowId: number, data: { from_task_id: string; to_task_id: string; outcome: string | null }) => api.post(`/workflows/${workflowId}/connections`, data);
export const deployWorkflow = (workflowId: number) => api.post(`/workflows/${workflowId}/deploy`);
export const triggerWorkflow = (workflowId: number) => api.post(`/workflows/${workflowId}/trigger`);

// User Dashboard API
export const getUserDashboard = () => api.get('/user/dashboard');

// Task Instance API
export const pickupTask = (taskInstanceId: number) => api.post(`/task-instances/${taskInstanceId}/pickup`);
export const completeTask = (taskInstanceId: number) => api.post(`/task-instances/${taskInstanceId}/complete`);
export const sendChatMessage = (taskInstanceId: number, data: { message: string; receiver_user_id: number }) => api.post(`/task-instances/${taskInstanceId}/chat`, data);
export const markChatComplete = (taskInstanceId: number) => api.put(`/task-instances/${taskInstanceId}/chat/complete`);

// File Management API
export const uploadFile = (taskInstanceId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('task_instance_id', String(taskInstanceId));
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const downloadFile = (fileId: number) => api.get(`/files/${fileId}/download`, { responseType: 'blob' });

// Monitoring API
export const getWorkflowInstance = (instanceId: number) => api.get(`/workflow-instances/${instanceId}`);

export default api;