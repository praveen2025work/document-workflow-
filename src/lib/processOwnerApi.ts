import axios from 'axios';
import { config } from './config';
import { ProcessOwnerDashboardData, ProcessOwnerWorkload } from '@/types/processOwner';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Get process owner dashboard
export const getProcessOwnerDashboard = async (processOwnerId: number): Promise<ProcessOwnerDashboardData> => {
  const response = await api.get('/api/process-owners/dashboard', {
    params: { processOwnerId },
  });
  return response.data;
};

// Get process owner workload
export const getProcessOwnerWorkload = async (processOwnerId: number): Promise<ProcessOwnerWorkload> => {
  const response = await api.get('/api/process-owners/workload', {
    params: { processOwnerId },
  });
  return response.data;
};

// Reassign task to different user
export const reassignTask = async (
  taskId: number,
  newUserId: number,
  reason: string
): Promise<void> => {
  await api.post(`/api/process-owners/tasks/${taskId}/reassign`, null, {
    params: { newUserId, reason },
  });
};

// Escalate workflow to higher authority
export const escalateWorkflow = async (
  workflowId: number,
  escalatedToUserId: number,
  reason: string
): Promise<void> => {
  await api.post(`/api/process-owners/escalate/${workflowId}`, null, {
    params: { escalatedToUserId, reason },
  });
};