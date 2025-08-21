import axios from 'axios';
import { config } from './config';
import { WorkflowInstanceDto, InstanceTaskDto } from '@/types/execution';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Start a new workflow instance
export const startWorkflow = async (workflowId: number, startedByUserId: number): Promise<WorkflowInstanceDto> => {
  const response = await api.post(`/api/execution/workflows/${workflowId}/start`, null, {
    params: { startedByUserId },
  });
  return response.data;
};

// Get all instances of a workflow
export const getWorkflowInstances = async (workflowId: number): Promise<WorkflowInstanceDto[]> => {
  const response = await api.get(`/api/execution/workflows/${workflowId}/instances`);
  return response.data;
};

// Get all tasks for a workflow instance
export const getInstanceTasks = async (instanceId: number): Promise<InstanceTaskDto[]> => {
  const response = await api.get(`/api/execution/instances/${instanceId}/tasks`);
  return response.data;
};

// Mark a task as started
export const startTask = async (taskId: number): Promise<InstanceTaskDto> => {
  const response = await api.post(`/api/execution/tasks/${taskId}/start`);
  return response.data;
};

// Mark a task as completed
export const completeTask = async (
  taskId: number,
  decisionOutcome?: 'APPROVED' | 'REJECTED'
): Promise<InstanceTaskDto> => {
  const response = await api.post(`/api/execution/tasks/${taskId}/complete`, null, {
    params: { decisionOutcome },
  });
  return response.data;
};

// Assign task to user
export const assignTask = async (taskId: number, userId: number): Promise<InstanceTaskDto> => {
  const response = await api.post(`/api/execution/tasks/${taskId}/assign`, null, {
    params: { userId },
  });
  return response.data;
};

// Escalate task to another user
export const escalateTask = async (taskId: number, escalatedToUserId: number): Promise<InstanceTaskDto> => {
  const response = await api.post(`/api/execution/tasks/${taskId}/escalate`, null, {
    params: { escalatedToUserId },
  });
  return response.data;
};