import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        toast.error('Unauthorized. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
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