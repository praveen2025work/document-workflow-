import api from './api';
import { config } from './config';
import {
  PaginatedWorkflowsResponse,
  Workflow,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  CreateTaskDto,
  UpdateTaskDto,
  AddRoleDto,
  WorkflowTask,
  WorkflowRole,
  DeleteWorkflowResponse,
  ApiWorkflow,
  ApiWorkflowApiResponse,
  NewApiWorkflow,
} from '@/types/workflow';
import {
  mockWorkflows,
  mockPaginatedWorkflows,
} from './mock/workflows';

// 1. Create Workflow
export const createWorkflow = async (workflowData: CreateWorkflowDto): Promise<Workflow> => {
  if (config.app.isMock) {
    const newWorkflow: Workflow = {
      ...workflowData,
      workflowId: Math.floor(Math.random() * 1000) + 10,
      createdOn: new Date().toISOString(),
      updatedBy: null,
      updatedOn: null,
      tasks: workflowData.tasks.map((task, index) => ({
        ...task,
        taskId: Math.floor(Math.random() * 1000) + 100 * (index + 1),
        workflowId: 0, // This will be set later
      })),
      workflowRoles: workflowData.workflowRoles.map((role, index) => ({
        ...role,
        id: Math.floor(Math.random() * 1000) + 200 * (index + 1),
        workflowId: 0, // This will be set later
        roleName: `Role ${role.roleId}`,
        userName: `User ${role.userId}`,
      })),
      parameters: workflowData.parameters.map((param, index) => ({
        ...param,
        paramId: Math.floor(Math.random() * 1000) + 300 * (index + 1),
        workflowId: 0, // This will be set later
        createdBy: workflowData.createdBy,
        createdOn: new Date().toISOString(),
      })),
    };
    newWorkflow.workflowId = mockWorkflows.length + 1;
    newWorkflow.tasks?.forEach(t => t.workflowId = newWorkflow.workflowId);
    newWorkflow.workflowRoles?.forEach(r => r.workflowId = newWorkflow.workflowId);
    newWorkflow.parameters?.forEach(p => p.workflowId = newWorkflow.workflowId);
    
    mockWorkflows.push(newWorkflow);
    mockPaginatedWorkflows.content.push(newWorkflow);
    mockPaginatedWorkflows.totalElements++;
    
    return Promise.resolve(newWorkflow);
  }
  const response = await api.post<Workflow>('/workflows', workflowData);
  return response.data;
};

// 2. Get Workflow by ID
export const getWorkflowById = async (workflowId: number): Promise<Workflow> => {
  if (config.app.isMock) {
    const workflow = mockWorkflows.find((w) => w.workflowId === workflowId);
    if (workflow) {
      return Promise.resolve(workflow);
    }
    return Promise.reject(new Error(`Workflow with ID ${workflowId} not found`));
  }
  const response = await api.get<Workflow>(`/workflows/${workflowId}`);
  return response.data;
};

// 3. Get All Workflows
export const getAllWorkflows = async (page = 0, size = 20): Promise<PaginatedWorkflowsResponse> => {
  if (config.app.isMock) {
    return Promise.resolve(mockPaginatedWorkflows);
  }
  const response = await api.get<PaginatedWorkflowsResponse>('/workflows', {
    params: { pageable: `${page},${size}` },
  });
  return response.data;
};

// New API functions
export const getApiWorkflows = async (params: { page: number; size: number; isActive: 'Y' | 'N' }): Promise<ApiWorkflowApiResponse> => {
  const response = await api.get('/workflows', { params });
  return response.data;
};

export const createApiWorkflow = async (workflow: NewApiWorkflow): Promise<ApiWorkflow> => {
  const response = await api.post('/workflows', workflow);
  return response.data;
};

// 4. Update Workflow
export const updateWorkflow = async (workflowId: number, workflowData: UpdateWorkflowDto): Promise<Workflow> => {
  if (config.app.isMock) {
    const index = mockWorkflows.findIndex((w) => w.workflowId === workflowId);
    if (index !== -1) {
      mockWorkflows[index] = {
        ...mockWorkflows[index],
        ...workflowData,
        updatedOn: new Date().toISOString(),
      };
      return Promise.resolve(mockWorkflows[index]);
    }
    return Promise.reject(new Error(`Workflow with ID ${workflowId} not found`));
  }
  const response = await api.put<Workflow>(`/workflows/${workflowId}`, workflowData);
  return response.data;
};

// 5. Toggle Workflow Status
export const toggleWorkflowStatus = async (workflowId: number, isActive: 'Y' | 'N'): Promise<Workflow> => {
  if (config.app.isMock) {
    const index = mockWorkflows.findIndex((w) => w.workflowId === workflowId);
    if (index !== -1) {
      mockWorkflows[index].isActive = isActive;
      mockWorkflows[index].updatedOn = new Date().toISOString();
      return Promise.resolve(mockWorkflows[index]);
    }
    return Promise.reject(new Error(`Workflow with ID ${workflowId} not found`));
  }
  const response = await api.patch<Workflow>(`/workflows/${workflowId}/status`, null, {
    params: { isActive },
  });
  return response.data;
};

// 6. Add Task to Workflow
export const addTaskToWorkflow = async (workflowId: number, taskData: CreateTaskDto): Promise<WorkflowTask> => {
  if (config.app.isMock) {
    const workflow = mockWorkflows.find((w) => w.workflowId === workflowId);
    if (workflow) {
      const newTask: WorkflowTask = {
        ...taskData,
        taskId: Math.floor(Math.random() * 1000),
        workflowId,
        roleName: `Role ${taskData.roleId}`,
        completed: false,
        pending: true,
        inProgress: false,
        rejected: false,
      };
      workflow.tasks?.push(newTask);
      return Promise.resolve(newTask);
    }
    return Promise.reject(new Error(`Workflow with ID ${workflowId} not found`));
  }
  const response = await api.post<WorkflowTask>(`/workflows/${workflowId}/tasks`, taskData);
  return response.data;
};

// 7. Update Task
export const updateTask = async (workflowId: number, taskId: number, taskData: UpdateTaskDto): Promise<WorkflowTask> => {
  if (config.app.isMock) {
    const workflow = mockWorkflows.find((w) => w.workflowId === workflowId);
    const taskIndex = workflow?.tasks?.findIndex((t) => t.taskId === taskId) ?? -1;
    if (workflow && taskIndex !== -1) {
      const originalTask = workflow.tasks![taskIndex];
      const updatedTask = { ...originalTask, ...taskData };
      workflow.tasks![taskIndex] = updatedTask;
      return Promise.resolve(updatedTask);
    }
    return Promise.reject(new Error(`Task with ID ${taskId} not found in workflow ${workflowId}`));
  }
  const response = await api.put<WorkflowTask>(`/workflows/${workflowId}/tasks/${taskId}`, taskData);
  return response.data;
};

// 8. Add Role to Workflow
export const addRoleToWorkflow = async (workflowId: number, roleData: AddRoleDto): Promise<WorkflowRole> => {
  if (config.app.isMock) {
    const workflow = mockWorkflows.find((w) => w.workflowId === workflowId);
    if (workflow) {
      const newRole: WorkflowRole = {
        ...roleData,
        id: Math.floor(Math.random() * 1000),
        workflowId,
        roleName: `Role ${roleData.roleId}`,
        userName: `User ${roleData.userId}`,
      };
      workflow.workflowRoles?.push(newRole);
      return Promise.resolve(newRole);
    }
    return Promise.reject(new Error(`Workflow with ID ${workflowId} not found`));
  }
  const response = await api.post<WorkflowRole>(`/workflows/${workflowId}/roles`, roleData);
  return response.data;
};

// 9. Search Workflows
export const searchWorkflows = async (name: string, isActive: 'Y' | 'N', page = 0, size = 10): Promise<PaginatedWorkflowsResponse> => {
  if (config.app.isMock) {
    const filteredWorkflows = mockWorkflows.filter(
      (w) =>
        w.name.toLowerCase().includes(name.toLowerCase()) &&
        w.isActive === isActive
    );
    return Promise.resolve({
      ...mockPaginatedWorkflows,
      content: filteredWorkflows,
      totalElements: filteredWorkflows.length,
      totalPages: Math.ceil(filteredWorkflows.length / size),
    });
  }
  const response = await api.get<PaginatedWorkflowsResponse>('/workflows/search', {
    params: { name, isActive, pageable: `${page},${size}` },
  });
  return response.data;
};

// 10. Delete Workflow
export const deleteWorkflow = async (workflowId: number): Promise<DeleteWorkflowResponse> => {
  if (config.app.isMock) {
    const index = mockWorkflows.findIndex((w) => w.workflowId === workflowId);
    if (index !== -1) {
      mockWorkflows.splice(index, 1);
      const paginatedIndex = mockPaginatedWorkflows.content.findIndex(w => w.workflowId === workflowId);
      if (paginatedIndex !== -1) {
        mockPaginatedWorkflows.content.splice(paginatedIndex, 1);
      }
      mockPaginatedWorkflows.totalElements--;
      return Promise.resolve({
        message: 'Workflow deleted successfully',
        workflowId,
        deletedAt: new Date().toISOString(),
      });
    }
    return Promise.reject(new Error(`Workflow with ID ${workflowId} not found`));
  }
  const response = await api.delete<DeleteWorkflowResponse>(`/workflows/${workflowId}`);
  return response.data;
};