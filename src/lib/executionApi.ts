import axios from 'axios';
import { config } from './config';
import { WorkflowInstanceDto, InstanceTaskDto } from '@/types/execution';
import { mockWorkflowInstances, mockInstanceTasks } from './mock/execution';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Start a new workflow instance with calendar validation
export const startWorkflowWithCalendar = async (
  data: {
    workflowId: number;
    startedBy: number;
    calendarId: number;
    triggeredBy: string;
    scheduledStartTime: string;
  }
): Promise<WorkflowInstanceDto> => {
  if (config.app.isMock) {
    const newInstance: WorkflowInstanceDto = {
      instanceId: mockWorkflowInstances.length + 1,
      workflowId: data.workflowId,
      status: 'PENDING',
      startedBy: data.startedBy,
      startedOn: new Date().toISOString(),
      calendarId: data.calendarId,
      workflowName: 'Mock Workflow',
      startedByUsername: 'mock.user',
      instanceTasks: [],
    };
    mockWorkflowInstances.push(newInstance);
    return Promise.resolve(newInstance);
  }
  const response = await api.post('/api/execution/workflows/start-with-calendar', data);
  return response.data;
};

// Start a new workflow instance without calendar restrictions
export const startWorkflowWithoutCalendar = async (
  data: {
    workflowId: number;
    startedBy: number;
    triggeredBy: string;
    scheduledStartTime?: string;
  }
): Promise<WorkflowInstanceDto> => {
  if (config.app.isMock) {
    const newInstance: WorkflowInstanceDto = {
      instanceId: mockWorkflowInstances.length + 1,
      workflowId: data.workflowId,
      status: 'PENDING',
      startedBy: data.startedBy,
      startedOn: new Date().toISOString(),
      workflowName: 'Mock Workflow',
      startedByUsername: 'mock.user',
      instanceTasks: [],
    };
    mockWorkflowInstances.push(newInstance);
    return Promise.resolve(newInstance);
  }
  const response = await api.post('/api/execution/workflows/start-with-calendar', data);
  return response.data;
};

// Get all instances of a workflow
export const getWorkflowInstances = async (workflowId: number): Promise<WorkflowInstanceDto[]> => {
  if (config.app.isMock) {
    return Promise.resolve(mockWorkflowInstances.filter((i) => i.workflowId === workflowId));
  }
  const response = await api.get(`/api/execution/workflows/${workflowId}/instances`);
  return response.data;
};

// Get all tasks for a workflow instance
export const getInstanceTasks = async (instanceId: number): Promise<InstanceTaskDto[]> => {
  if (config.app.isMock) {
    return Promise.resolve(mockInstanceTasks.filter((t) => t.instanceId === instanceId));
  }
  const response = await api.get(`/api/execution/instances/${instanceId}/tasks`);
  return response.data;
};

// Mark a task as started
export const startTask = async (taskId: number): Promise<InstanceTaskDto> => {
  if (config.app.isMock) {
    const task = mockInstanceTasks.find((t) => t.instanceTaskId === taskId);
    if (task) {
      task.status = 'IN_PROGRESS';
      task.startedOn = new Date().toISOString();
      return Promise.resolve(task);
    }
    return Promise.reject('Task not found');
  }
  const response = await api.post(`/api/execution/tasks/${taskId}/start`);
  return response.data;
};

// Mark a task as completed
export const completeTask = async (
  taskId: number,
  decisionOutcome?: string
): Promise<InstanceTaskDto> => {
  if (config.app.isMock) {
    const task = mockInstanceTasks.find((t) => t.instanceTaskId === taskId);
    if (task) {
      task.status = 'COMPLETED';
      task.completedOn = new Date().toISOString();
      task.decisionOutcome = decisionOutcome;
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
export const assignTask = async (taskId: number, userId: number): Promise<InstanceTaskDto> => {
  if (config.app.isMock) {
    const task = mockInstanceTasks.find((t) => t.instanceTaskId === taskId);
    if (task) {
      task.assignedTo = userId;
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
export const escalateTask = async (taskId: number, escalatedToUserId: number): Promise<InstanceTaskDto> => {
  if (config.app.isMock) {
    const task = mockInstanceTasks.find((t) => t.instanceTaskId === taskId);
    if (task) {
      task.assignedTo = escalatedToUserId;
      task.status = 'ESCALATED';
      return Promise.resolve(task);
    }
    return Promise.reject('Task not found');
  }
  const response = await api.post(`/api/execution/tasks/${taskId}/escalate`, null, {
    params: { escalatedToUserId },
  });
  return response.data;
};