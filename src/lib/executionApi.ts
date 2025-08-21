import axios from 'axios';
import { config } from './config';
import { WorkflowInstanceDto, InstanceTaskDto } from '@/types/execution';
import { mockWorkflowInstances, mockInstanceTasks } from './mock/execution';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Start a new workflow instance
export const startWorkflow = async (workflowId: string, startedByUserId: string): Promise<WorkflowInstanceDto> => {
  if (config.app.isMock) {
    const newInstance: WorkflowInstanceDto = {
      id: String(mockWorkflowInstances.length + 1),
      workflowId,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockWorkflowInstances.push(newInstance);
    return Promise.resolve(newInstance);
  }
  const response = await api.post(`/api/execution/workflows/${workflowId}/start`, null, {
    params: { startedByUserId },
  });
  return response.data;
};

// Get all instances of a workflow
export const getWorkflowInstances = async (workflowId: string): Promise<WorkflowInstanceDto[]> => {
  if (config.app.isMock) {
    return Promise.resolve(mockWorkflowInstances.filter((i) => i.workflowId === workflowId));
  }
  const response = await api.get(`/api/execution/workflows/${workflowId}/instances`);
  return response.data;
};

// Get all tasks for a workflow instance
export const getInstanceTasks = async (instanceId: string): Promise<InstanceTaskDto[]> => {
  if (config.app.isMock) {
    return Promise.resolve(mockInstanceTasks.filter((t) => t.instanceId === instanceId));
  }
  const response = await api.get(`/api/execution/instances/${instanceId}/tasks`);
  return response.data;
};

// Mark a task as started
export const startTask = async (taskId: string): Promise<InstanceTaskDto> => {
  if (config.app.isMock) {
    const task = mockInstanceTasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'IN_PROGRESS';
      task.updatedAt = new Date().toISOString();
      return Promise.resolve(task);
    }
    return Promise.reject('Task not found');
  }
  const response = await api.post(`/api/execution/tasks/${taskId}/start`);
  return response.data;
};

// Mark a task as completed
export const completeTask = async (
  taskId: string,
  decisionOutcome?: 'APPROVED' | 'REJECTED'
): Promise<InstanceTaskDto> => {
  if (config.app.isMock) {
    const task = mockInstanceTasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'COMPLETED';
      task.updatedAt = new Date().toISOString();
      return Promise.resolve(task);
    }
    return Promise.reject('Task not found');
  }
  const response = await api.post(`/api/execution/tasks/${taskId}/complete`, null, {
    params: { decisionOutcome },
  });
  return response.data;
};

// Assign task to user
export const assignTask = async (taskId: string, userId: string): Promise<InstanceTaskDto> => {
  if (config.app.isMock) {
    const task = mockInstanceTasks.find((t) => t.id === taskId);
    if (task) {
      task.assignee = `User ${userId}`;
      task.updatedAt = new Date().toISOString();
      return Promise.resolve(task);
    }
    return Promise.reject('Task not found');
  }
  const response = await api.post(`/api/execution/tasks/${taskId}/assign`, null, {
    params: { userId },
  });
  return response.data;
};

// Escalate task to another user
export const escalateTask = async (taskId: string, escalatedToUserId: string): Promise<InstanceTaskDto> => {
  if (config.app.isMock) {
    const task = mockInstanceTasks.find((t) => t.id === taskId);
    if (task) {
      task.assignee = `User ${escalatedToUserId}`;
      task.updatedAt = new Date().toISOString();
      return Promise.resolve(task);
    }
    return Promise.reject('Task not found');
  }
  const response = await api.post(`/api/execution/tasks/${taskId}/escalate`, null, {
    params: { escalatedToUserId },
  });
  return response.data;
};