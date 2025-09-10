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
  ComprehensiveWorkflowDto,
} from '@/types/workflow';
import {
  mockWorkflows,
  mockPaginatedWorkflows,
} from './mock/workflows';

// 1. Create Workflow
export const createWorkflow = async (workflowData: CreateWorkflowDto): Promise<Workflow> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Creating workflow in environment:', config.app.env);
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock workflow by ID data for environment:', config.app.env);
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock all workflows data for environment:', config.app.env);
    return Promise.resolve(mockPaginatedWorkflows);
  }
  const response = await api.get<PaginatedWorkflowsResponse>('/workflows', {
    params: { pageable: `${page},${size}` },
  });
  return response.data;
};

// New API functions
export const getApiWorkflows = async (params?: { page?: number; size?: number; isActive?: 'Y' | 'N' }): Promise<ApiWorkflowApiResponse> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock API workflows data for environment:', config.app.env);
    // Convert mock workflows to API format
    const apiWorkflows: ApiWorkflow[] = mockWorkflows.map(w => ({
      workflowId: w.workflowId,
      name: w.name,
      description: w.description,
      isActive: w.isActive,
      createdBy: w.createdBy,
      createdOn: w.createdOn,
      updatedBy: w.updatedBy,
      updatedOn: w.updatedOn,
    }));
    
    // Filter by isActive if provided
    let filteredWorkflows = apiWorkflows;
    if (params?.isActive) {
      filteredWorkflows = apiWorkflows.filter(workflow => workflow.isActive === params.isActive);
    }
    
    return Promise.resolve({
      workflows: filteredWorkflows,
      totalElements: filteredWorkflows.length,
      totalPages: 1,
      size: params?.size || 10,
      number: params?.page || 0,
    });
  }
  
  const response = await api.get('/workflows', { params });
  return response.data;
};

export const createApiWorkflow = async (workflow: NewApiWorkflow): Promise<ApiWorkflow> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Creating API workflow in environment:', config.app.env);
    const newWorkflow: ApiWorkflow = {
      workflowId: Math.max(...mockWorkflows.map(w => w.workflowId)) + 1,
      name: workflow.name,
      description: workflow.description,
      isActive: 'Y',
      createdBy: 'mock@company.com',
      createdOn: new Date().toISOString(),
      updatedBy: null,
      updatedOn: null,
    };
    return Promise.resolve(newWorkflow);
  }
  
  const response = await api.post('/workflows', workflow);
  return response.data;
};

// 4. Update Workflow
export const updateWorkflow = async (workflowId: number, workflowData: UpdateWorkflowDto): Promise<Workflow> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Updating workflow in environment:', config.app.env);
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Toggling workflow status in environment:', config.app.env);
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Adding task to workflow in environment:', config.app.env);
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Updating task in environment:', config.app.env);
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Adding role to workflow in environment:', config.app.env);
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Searching workflows in environment:', config.app.env);
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Deleting workflow in environment:', config.app.env);
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

// 11. Create Comprehensive Workflow
export const createComprehensiveWorkflow = async (workflowData: ComprehensiveWorkflowDto): Promise<Workflow> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Creating comprehensive workflow in environment:', config.app.env);
    
    // Generate unique IDs for the workflow and its components
    const newWorkflowId = Math.max(...mockWorkflows.map(w => w.workflowId)) + 1;
    let taskIdCounter = Math.max(...mockWorkflows.flatMap(w => w.tasks?.map(t => t.taskId) || []), 0) + 1;
    let fileIdCounter = Math.max(...mockWorkflows.flatMap(w => w.tasks?.flatMap(t => t.taskFiles?.map(f => f.fileId || 0) || []) || []), 0) + 1;
    
    // Transform comprehensive tasks to standard workflow tasks
    const transformedTasks: WorkflowTask[] = workflowData.tasks.map((task) => {
      const taskId = taskIdCounter++;
      
      // Transform task files
      const transformedFiles = task.taskFiles?.map((file) => ({
        fileId: fileIdCounter++,
        taskId: taskId,
        fileSequence: file.fileSequence,
        fileName: file.fileName,
        fileTypeRegex: file.fileTypeRegex,
        isRequired: file.isRequired,
        fileDescription: file.fileDescription,
        fileStatus: file.fileStatus,
        actionType: file.actionType,
        keepFileVersions: file.keepFileVersions,
        keepFileHistory: file.keepFileHistory,
        retainForCurrentPeriod: file.retainForCurrentPeriod,
        updateOfFileSequence: file.updateOfFileSequence,
        consolidatedFrom: file.consolidatedFrom,
        fromTaskSequence: file.fromTaskSequence,
        fileCommentary: file.fileCommentary,
        dependencies: file.dependencies,
      })) || [];
      
      // Transform decision outcomes
      const transformedOutcomes = task.decisionOutcomes?.map((outcome) => ({
        outcomeName: outcome.outcomeName,
        targetTaskSequence: outcome.targetTaskSequence,
        nextTaskId: outcome.targetTaskSequence || 0, // Will be resolved later
        revisionType: outcome.revisionType,
        revisionTaskSequences: outcome.revisionTaskSequences,
        revisionStrategy: outcome.revisionStrategy,
        revisionPriority: outcome.revisionPriority,
        revisionConditions: outcome.revisionConditions,
        autoEscalate: outcome.autoEscalate,
        createdBy: outcome.createdBy,
      })) || [];
      
      return {
        taskId: taskId,
        workflowId: newWorkflowId,
        taskSequence: task.taskSequence,
        name: task.name,
        taskType: task.taskType,
        roleId: task.roleId,
        expectedCompletion: task.expectedCompletion,
        sequenceOrder: task.sequenceOrder,
        escalationRules: task.escalationRules,
        parentTaskSequences: task.parentTaskSequences,
        canBeRevisited: 'Y',
        maxRevisits: 3,
        fileSelectionMode: task.fileSelectionStrategy || 'USER_SELECT',
        taskDescription: task.taskDescription,
        isDecisionTask: task.isDecisionTask,
        decisionType: task.decisionType,
        decisionRequiresApproval: task.decisionRequiresApproval,
        decisionApprovalRoleId: task.decisionApprovalRoleId,
        revisionStrategy: task.revisionStrategy,
        taskPriority: task.taskPriority || 'MEDIUM',
        autoEscalationEnabled: task.autoEscalationEnabled || 'N',
        notificationRequired: task.notificationRequired || 'N',
        allowNewFiles: 'Y',
        fileRetentionDays: task.fileRetentionDays,
        consolidationMode: task.consolidationMode,
        fileSelectionStrategy: task.fileSelectionStrategy,
        maxFileSelections: task.maxFileSelections,
        minFileSelections: task.minFileSelections,
        decisionOutcomes: transformedOutcomes,
        taskFiles: transformedFiles,
        roleName: `Role ${task.roleId}`,
        completed: false,
        pending: true,
        inProgress: false,
        rejected: false,
        decisionTask: task.taskType === 'DECISION',
      };
    });
    
    // Resolve decision outcome nextTaskId references
    transformedTasks.forEach((task) => {
      if (task.decisionOutcomes) {
        task.decisionOutcomes.forEach((outcome) => {
          if (outcome.targetTaskSequence) {
            const targetTask = transformedTasks.find(t => t.taskSequence === outcome.targetTaskSequence);
            if (targetTask) {
              outcome.nextTaskId = targetTask.taskId;
              outcome.nextTaskName = targetTask.name;
            }
          }
        });
      }
    });
    
    // Transform workflow roles
    const transformedRoles: WorkflowRole[] = workflowData.workflowRoles.map((role, index) => ({
      id: Math.floor(Math.random() * 1000) + 200 * (index + 1),
      workflowId: newWorkflowId,
      roleId: role.roleId,
      userId: role.userId,
      isActive: role.isActive,
      roleName: `Role ${role.roleId}`,
      userName: `User ${role.userId}`,
    }));
    
    // Create the comprehensive workflow
    const newWorkflow: Workflow = {
      workflowId: newWorkflowId,
      name: workflowData.name,
      description: workflowData.description,
      triggerType: workflowData.triggerType,
      reminderBeforeDueMins: workflowData.reminderBeforeDueMins,
      minutesAfterDue: workflowData.minutesAfterDue,
      escalationAfterMins: workflowData.escalationAfterMins,
      dueInMins: 1440, // Default to 24 hours
      isActive: workflowData.isActive,
      calendarId: null,
      createdBy: workflowData.createdBy,
      createdOn: new Date().toISOString(),
      updatedBy: null,
      updatedOn: null,
      workflowRoles: transformedRoles,
      tasks: transformedTasks,
      parameters: [],
    };
    
    // Add to mock data
    mockWorkflows.push(newWorkflow);
    mockPaginatedWorkflows.content.push(newWorkflow);
    mockPaginatedWorkflows.totalElements++;
    
    console.log('Created comprehensive workflow:', newWorkflow);
    return Promise.resolve(newWorkflow);
  }
  
  // For real API calls
  const response = await api.post<Workflow>('/workflows/comprehensive', workflowData);
  return response.data;
};

// Helper function to convert canvas workflow to comprehensive format
export const convertCanvasToComprehensive = (
  workflowName: string,
  workflowDescription: string,
  nodes: any[],
  edges: any[],
  roles: any[],
  createdBy: string
): ComprehensiveWorkflowDto => {
  // Filter out start and end nodes
  const taskNodes = nodes.filter(node => !['start', 'end'].includes(node.id));
  
  // Convert nodes to comprehensive tasks
  const tasks: any[] = taskNodes.map((node, index) => {
    const taskSequence = index + 1;
    
    // Determine parent task sequences from edges
    const parentEdges = edges.filter(edge => edge.target === node.id && !['start'].includes(edge.source));
    const parentTaskSequences = parentEdges.map(edge => {
      const parentNode = taskNodes.find(n => n.id === edge.source);
      return parentNode ? taskNodes.indexOf(parentNode) + 1 : 0;
    }).filter(seq => seq > 0);
    
    // Convert task files
    const taskFiles = node.data.taskFiles?.map((file: any, fileIndex: number) => ({
      fileSequence: fileIndex + 1,
      fileName: file.fileName || `file_${fileIndex + 1}`,
      fileTypeRegex: file.fileTypeRegex || '*.*',
      actionType: node.data.taskType === 'FILE_UPLOAD' ? 'UPLOAD' : 
                  node.data.taskType === 'FILE_UPDATE' ? 'UPDATE' : 
                  node.data.taskType === 'CONSOLIDATE_FILES' ? 'CONSOLIDATE' : 'UPLOAD',
      fileDescription: file.fileDescription || '',
      isRequired: file.isRequired || 'Y',
      fileStatus: 'PENDING',
      keepFileVersions: 'Y',
      keepFileHistory: 'Y',
      retainForCurrentPeriod: 'Y',
      fileCommentary: file.fileDescription || '',
      updateOfFileSequence: file.updateOfFileSequence,
      consolidatedFrom: file.consolidatedFrom,
      fromTaskSequence: file.fromTaskSequence,
      dependencies: file.dependencies || [],
    })) || [];
    
    // Convert decision outcomes
    const decisionOutcomes = node.data.decisionOutcomes?.map((outcome: any) => ({
      outcomeName: outcome.outcomeName,
      targetTaskSequence: outcome.targetTaskSequence || null,
      revisionType: 'SINGLE',
      revisionTaskSequences: outcome.revisionTaskSequences || [],
      revisionStrategy: 'REPLACE',
      revisionPriority: 1,
      revisionConditions: outcome.revisionConditions || '',
      autoEscalate: 'N',
      createdBy: createdBy,
    })) || [];
    
    return {
      taskSequence: taskSequence,
      name: node.data.description || node.data.name || `Task ${taskSequence}`,
      taskDescription: node.data.taskDescription || node.data.description || '',
      taskType: node.data.taskType,
      roleId: node.data.roleId || 1,
      sequenceOrder: taskSequence,
      expectedCompletion: node.data.expectedCompletion || 60,
      escalationRules: node.data.escalationRules || 'Default escalation',
      fileRetentionDays: node.data.fileRetentionDays || 30,
      parentTaskSequences: parentTaskSequences.length > 0 ? parentTaskSequences : undefined,
      consolidationMode: node.data.consolidationMode,
      fileSelectionStrategy: node.data.fileSelectionMode,
      maxFileSelections: node.data.maxFileSelections,
      minFileSelections: node.data.minFileSelections,
      isDecisionTask: node.data.taskType === 'DECISION' ? 'Y' : 'N',
      decisionType: node.data.decisionType,
      decisionRequiresApproval: node.data.decisionRequiresApproval,
      decisionApprovalRoleId: node.data.decisionApprovalRoleId,
      revisionStrategy: node.data.revisionStrategy,
      taskPriority: node.data.taskPriority || 'MEDIUM',
      autoEscalationEnabled: node.data.autoEscalationEnabled || 'N',
      notificationRequired: node.data.notificationRequired || 'N',
      taskFiles: taskFiles.length > 0 ? taskFiles : undefined,
      decisionOutcomes: decisionOutcomes.length > 0 ? decisionOutcomes : undefined,
    };
  });
  
  return {
    name: workflowName,
    description: workflowDescription,
    triggerType: 'MANUAL',
    reminderBeforeDueMins: 30,
    minutesAfterDue: 15,
    escalationAfterMins: 60,
    isActive: 'Y',
    createdBy: createdBy,
    workflowRoles: roles.map(role => ({
      roleId: role.roleId,
      userId: role.userId,
      isActive: role.isActive,
    })),
    tasks: tasks,
  };
};