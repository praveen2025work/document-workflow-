import axios from 'axios';
import { config } from './config';
import {
  PaginatedWorkflowsResponse,
  WorkflowDto,
  WorkflowTaskDto,
  WorkflowRoleAssignmentDto,
} from '@/types/workflow';
import { WorkflowRoleDto } from '@/types/role';
import { mockPaginatedWorkflows, mockWorkflows } from './mock/workflows';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Fetch all workflows with pagination
export const getWorkflows = async (
  params: {
    page?: number;
    size?: number;
    isActive?: 'Y' | 'N';
  } = {}
): Promise<PaginatedWorkflowsResponse> => {
  console.log('getWorkflows - isMock:', config.app.isMock, 'env:', config.app.env);
  if (config.app.isMock) {
    console.log('Returning mock workflows:', mockPaginatedWorkflows);
    return Promise.resolve(mockPaginatedWorkflows);
  }
  const response = await api.get('/api/workflows', { params });
  return response.data;
};

// Create a new workflow
export const createWorkflow = async (
  workflowData: Omit<WorkflowDto, 'workflowId' | 'createdOn' | 'updatedOn' | 'tasks'>
): Promise<WorkflowDto> => {
  if (config.app.isMock) {
    const newWorkflow: WorkflowDto = {
      workflowId: mockWorkflows.length + 1,
      ...workflowData,
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
      tasks: [],
    };
    mockWorkflows.push(newWorkflow);
    return Promise.resolve(newWorkflow);
  }
  const response = await api.post('/api/workflows', workflowData);
  return response.data;
};

// Get a single workflow by ID
export const getWorkflowById = async (workflowId: string): Promise<WorkflowDto> => {
  if (config.app.isMock) {
    const workflow = mockWorkflows.find((w) => w.workflowId === parseInt(workflowId));
    if (workflow) {
      return Promise.resolve(workflow);
    } else {
      return Promise.reject(new Error('Workflow not found'));
    }
  }
  const response = await api.get(`/api/workflows/${workflowId}`);
  return response.data;
};

// Update an existing workflow
export const updateWorkflow = async (
  workflowId: string,
  workflowData: Partial<Omit<WorkflowDto, 'workflowId' | 'createdOn' | 'updatedOn' | 'tasks'>>
): Promise<WorkflowDto> => {
  if (config.app.isMock) {
    const workflowIndex = mockWorkflows.findIndex((w) => w.workflowId === parseInt(workflowId));
    if (workflowIndex > -1) {
      const updatedWorkflow = { ...mockWorkflows[workflowIndex], ...workflowData, updatedOn: new Date().toISOString() };
      mockWorkflows[workflowIndex] = updatedWorkflow;
      return Promise.resolve(updatedWorkflow);
    } else {
      return Promise.reject(new Error('Workflow not found'));
    }
  }
  const response = await api.put(`/api/workflows/${workflowId}`, workflowData);
  return response.data;
};

// Get all tasks for a workflow
export const getWorkflowTasks = async (workflowId: string): Promise<WorkflowTaskDto[]> => {
  if (config.app.isMock) {
    const workflow = mockWorkflows.find((w) => w.workflowId === parseInt(workflowId));
    return Promise.resolve(workflow?.tasks || []);
  }
  const response = await api.get(`/api/workflows/${workflowId}/tasks`);
  return response.data;
};

// Add a new task to a workflow
export const addTaskToWorkflow = async (
  workflowId: string,
  taskData: Omit<WorkflowTaskDto, 'taskId'>
): Promise<WorkflowTaskDto> => {
  if (config.app.isMock) {
    const workflow = mockWorkflows.find((w) => w.workflowId === parseInt(workflowId));
    if (workflow) {
      const newTask: WorkflowTaskDto = {
        taskId: (workflow.tasks?.length || 0) + 1,
        ...taskData,
      };
      if (!workflow.tasks) workflow.tasks = [];
      workflow.tasks.push(newTask);
      return Promise.resolve(newTask);
    }
    return Promise.reject('Workflow not found');
  }
  const response = await api.post(`/api/workflows/${workflowId}/tasks`, taskData);
  return response.data;
};

// Get roles assigned to a workflow
export const getWorkflowRoles = async (workflowId: string): Promise<any[]> => {
  if (config.app.isMock) {
    // Return empty array for mock data since roles are not part of WorkflowDto
    return Promise.resolve([]);
  }
  const response = await api.get(`/api/workflows/${workflowId}/roles`);
  return response.data;
};

// Assign a role to a workflow
export const assignRoleToWorkflow = async (
  workflowId: string,
  assignmentData: WorkflowRoleAssignmentDto
): Promise<void> => {
  if (config.app.isMock) {
    console.log(`Assigning role to workflow ${workflowId}`);
    return Promise.resolve();
  }
  await api.post(`/api/workflows/${workflowId}/roles`, assignmentData);
};