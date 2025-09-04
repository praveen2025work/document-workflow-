import { api } from './api';
import { WorkflowInstance, InstanceTask } from '@/types/execution';
import { mockWorkflowInstances, mockInstanceTasks } from './mock/execution';
import { config } from './config';

export const startWorkflowWithCalendar = async (data: {
  workflowId: number;
  startedBy: number;
  calendarId: number;
  triggeredBy: string;
  scheduledStartTime: string;
}): Promise<WorkflowInstance> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Mock: Starting workflow with calendar in environment:', config.app.env);
    const newInstance: WorkflowInstance = {
      instanceId: Math.max(...mockWorkflowInstances.map(i => i.instanceId)) + 1,
      workflowId: data.workflowId,
      status: 'PENDING',
      startedBy: data.startedBy,
      startedOn: new Date().toISOString(),
      completedOn: null,
      escalatedTo: null,
      calendarId: data.calendarId,
      calendarName: 'Mock Calendar',
      workflowName: 'Mock Workflow',
      startedByUsername: 'mockuser',
      escalatedToUsername: null,
      instanceTasks: [],
    };
    return Promise.resolve(newInstance);
  }
  
  const response = await api.post('/execution/workflows/start-with-calendar', data);
  return response.data;
};

export const startWorkflowWithoutCalendar = async (data: {
  workflowId: number;
  startedBy: number;
  triggeredBy: string;
  scheduledStartTime: string | null;
}): Promise<WorkflowInstance> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Mock: Starting workflow without calendar in environment:', config.app.env);
    const newInstance: WorkflowInstance = {
      instanceId: Math.max(...mockWorkflowInstances.map(i => i.instanceId)) + 1,
      workflowId: data.workflowId,
      status: 'PENDING',
      startedBy: data.startedBy,
      startedOn: new Date().toISOString(),
      completedOn: null,
      escalatedTo: null,
      calendarId: 0,
      calendarName: 'No Calendar',
      workflowName: 'Mock Workflow',
      startedByUsername: 'mockuser',
      escalatedToUsername: null,
      instanceTasks: [],
    };
    return Promise.resolve(newInstance);
  }
  
  const response = await api.post('/execution/workflows/start-without-calendar', data);
  return response.data;
};

export const getWorkflowInstances = async (params?: { 
  page?: number; 
  size?: number; 
  status?: string; 
  workflowId?: number 
}): Promise<{ content: WorkflowInstance[]; totalElements: number; totalPages: number; size: number; number: number }> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Using mock workflow instances data for environment:', config.app.env);
    let filteredInstances = mockWorkflowInstances;
    
    if (params?.status) {
      filteredInstances = filteredInstances.filter(instance => instance.status === params.status);
    }
    if (params?.workflowId) {
      filteredInstances = filteredInstances.filter(instance => instance.workflowId === params.workflowId);
    }
    
    return Promise.resolve({
      content: filteredInstances,
      totalElements: filteredInstances.length,
      totalPages: 1,
      size: params?.size || 10,
      number: params?.page || 0,
    });
  }
  
  const response = await api.get('/execution/instances', { params });
  return response.data;
};

export const getWorkflowInstanceById = async (instanceId: number): Promise<WorkflowInstance> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Using mock workflow instance by ID data for environment:', config.app.env);
    const instance = mockWorkflowInstances.find(i => i.instanceId === instanceId);
    if (!instance) {
      throw new Error(`Workflow instance with ID ${instanceId} not found`);
    }
    return Promise.resolve(instance);
  }
  
  const response = await api.get(`/execution/instances/${instanceId}`);
  return response.data;
};

export const getInstanceTasks = async (instanceId: number): Promise<InstanceTask[]> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Using mock instance tasks data for environment:', config.app.env);
    const tasks = mockInstanceTasks.filter(task => task.instanceId === instanceId);
    return Promise.resolve(tasks);
  }
  
  const response = await api.get(`/execution/instances/${instanceId}/tasks`);
  return response.data;
};

export const completeTask = async (instanceTaskId: number, data?: any): Promise<void> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Completing task ${instanceTaskId} in environment:`, config.app.env);
    return Promise.resolve();
  }
  
  await api.post(`/execution/tasks/${instanceTaskId}/complete`, data);
};

export const escalateWorkflow = async (instanceId: number, escalatedTo: number, reason: string): Promise<void> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Escalating workflow instance ${instanceId} to user ${escalatedTo} in environment:`, config.app.env);
    return Promise.resolve();
  }
  
  await api.post(`/execution/instances/${instanceId}/escalate`, { escalatedTo, reason });
};