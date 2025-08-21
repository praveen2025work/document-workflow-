import axios from 'axios';
import { config } from './config';
import {
  PaginatedWorkflowsResponse,
  WorkflowDto,
  WorkflowTaskDto,
  WorkflowRoleAssignmentDto,
} from '@/types/workflow';
import { WorkflowRoleDto } from '@/types/role';

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
  const response = await api.get('/api/workflows', { params });
  return response.data;
};

// Create a new workflow
export const createWorkflow = async (
  workflowData: Omit<WorkflowDto, 'workflowId' | 'createdOn' | 'updatedOn' | 'tasks'>
): Promise<WorkflowDto> => {
  const response = await api.post('/api/workflows', workflowData);
  return response.data;
};

// Get a single workflow by ID
export const getWorkflowById = async (workflowId: number): Promise<WorkflowDto> => {
  const response = await api.get(`/api/workflows/${workflowId}`);
  return response.data;
};

// Update an existing workflow
export const updateWorkflow = async (
  workflowId: number,
  workflowData: Partial<Omit<WorkflowDto, 'workflowId' | 'createdBy' | 'createdOn' | 'tasks'>>
): Promise<WorkflowDto> => {
  const response = await api.put(`/api/workflows/${workflowId}`, workflowData);
  return response.data;
};

// Get all tasks for a workflow
export const getWorkflowTasks = async (workflowId: number): Promise<WorkflowTaskDto[]> => {
  const response = await api.get(`/api/workflows/${workflowId}/tasks`);
  return response.data;
};

// Add a new task to a workflow
export const addTaskToWorkflow = async (
  workflowId: number,
  taskData: Omit<WorkflowTaskDto, 'taskId'>
): Promise<WorkflowTaskDto> => {
  const response = await api.post(`/api/workflows/${workflowId}/tasks`, taskData);
  return response.data;
};

// Get roles assigned to a workflow
export const getWorkflowRoles = async (workflowId: number): Promise<WorkflowRoleDto[]> => {
  const response = await api.get(`/api/workflows/${workflowId}/roles`);
  return response.data;
};

// Assign a role to a workflow
export const assignRoleToWorkflow = async (
  workflowId: number,
  assignmentData: WorkflowRoleAssignmentDto
): Promise<void> => {
  await api.post(`/api/workflows/${workflowId}/roles`, assignmentData);
};