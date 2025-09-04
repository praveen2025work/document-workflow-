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

// Task-level execution interfaces
export interface TaskFile {
  instanceFileId: number;
  version: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  actionType: 'UPLOAD' | 'UPDATE' | 'CONSOLIDATE' | 'DOWNLOAD';
  fileStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  fileCommentary?: string;
  createdBy: string;
  createdAt: string;
}

export interface TaskQuery {
  queryId: number;
  queryTitle: string;
  queryDescription: string;
  queryStatus: 'OPEN' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  raisedByUsername: string;
  assignedToUsername: string;
  createdAt: string;
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface TaskConfiguration {
  fileSelectionMode?: string;
  allowedFileTypes?: string[];
  maxFileSize?: string;
  isRequired?: boolean;
  fileDescription?: string;
  sourceFileId?: number;
  updateType?: string;
  backupOriginal?: boolean;
  consolidationMode?: string;
  outputFormat?: string;
  includeSummary?: boolean;
  decisionType?: string;
  decisionOptions?: string[];
  requiresComments?: boolean;
}

export interface TaskDetails {
  instanceTaskId: number;
  instanceId: number;
  taskId: number;
  taskName: string;
  taskType: 'FILE_UPLOAD' | 'FILE_DOWNLOAD' | 'FILE_UPDATE' | 'FILE_CONSOLIDATE' | 'DECISION';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  assignedTo: number | null;
  assignedToUsername?: string;
  startedOn?: string;
  completedOn?: string;
  decisionOutcome?: string;
  workflowName: string;
  workflowId: number;
  taskConfiguration: TaskConfiguration;
  instanceTaskFiles?: TaskFile[];
  sourceFile?: TaskFile;
  updatedFiles?: TaskFile[];
  sourceFiles?: TaskFile[];
  consolidatedFile?: TaskFile;
  availableFiles?: TaskFile[];
  reviewFiles?: TaskFile[];
  queries: TaskQuery[];
}

// Task-level execution functions
export const getTaskDetails = async (instanceTaskId: number): Promise<TaskDetails> => {
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Getting task details for ${instanceTaskId} in environment:`, config.app.env);
    const { mockTaskDetails } = await import('./mock/execution');
    const taskDetail = mockTaskDetails.find(t => t.instanceTaskId === instanceTaskId);
    if (!taskDetail) {
      throw new Error('Task details not found');
    }
    return Promise.resolve(taskDetail);
  }
  
  const response = await api.get(`/execution/tasks/${instanceTaskId}/details`);
  return response.data;
};

export const uploadFile = async (instanceTaskId: number, file: File, commentary?: string): Promise<TaskFile> => {
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Uploading file for task ${instanceTaskId} in environment:`, config.app.env);
    return Promise.resolve({
      instanceFileId: Math.floor(Math.random() * 1000),
      version: 1,
      fileName: file.name,
      filePath: `/uploads/${file.name}`,
      fileSize: file.size,
      actionType: 'UPLOAD',
      fileStatus: 'COMPLETED',
      fileCommentary: commentary || '',
      createdBy: 'current_user',
      createdAt: new Date().toISOString()
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('instanceTaskId', instanceTaskId.toString());
  formData.append('actionType', 'UPLOAD');
  if (commentary) formData.append('fileCommentary', commentary);
  formData.append('createdBy', 'current_user');

  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateFile = async (instanceFileId: number, file: File, commentary?: string): Promise<TaskFile> => {
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Updating file ${instanceFileId} in environment:`, config.app.env);
    return Promise.resolve({
      instanceFileId,
      version: 2,
      fileName: file.name,
      filePath: `/uploads/${file.name}`,
      fileSize: file.size,
      actionType: 'UPDATE',
      fileStatus: 'COMPLETED',
      fileCommentary: commentary || '',
      createdBy: 'current_user',
      createdAt: new Date().toISOString()
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('actionType', 'UPDATE');
  if (commentary) formData.append('fileCommentary', commentary);
  formData.append('createdBy', 'current_user');

  const response = await api.post(`/files/versions/${instanceFileId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const consolidateFiles = async (instanceTaskId: number, sourceFileIds: number[], outputFileName: string): Promise<TaskFile> => {
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Consolidating files for task ${instanceTaskId} in environment:`, config.app.env);
    return Promise.resolve({
      instanceFileId: Math.floor(Math.random() * 1000),
      version: 1,
      fileName: outputFileName,
      filePath: `/reports/${outputFileName}`,
      fileSize: 5120000,
      actionType: 'CONSOLIDATE',
      fileStatus: 'COMPLETED',
      fileCommentary: `Consolidated from ${sourceFileIds.length} files`,
      createdBy: 'system',
      createdAt: new Date().toISOString()
    });
  }

  const response = await api.post('/files/consolidate', {
    instanceTaskId,
    sourceFileIds,
    consolidationMode: 'MERGE_FILES',
    outputFormat: 'PDF',
    includeSummary: true,
    createdBy: 'current_user'
  });
  return response.data;
};

export const downloadFile = async (fileName: string, instanceFileId?: number, version?: number): Promise<Blob> => {
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Downloading file ${fileName} in environment:`, config.app.env);
    return Promise.resolve(new Blob(['Mock file content'], { type: 'application/octet-stream' }));
  }

  let url = `/files/download/${fileName}`;
  const params = new URLSearchParams();
  if (instanceFileId) params.append('instanceFileId', instanceFileId.toString());
  if (version) params.append('version', version.toString());
  if (params.toString()) url += `?${params.toString()}`;

  const response = await api.get(url, { responseType: 'blob' });
  return response.data;
};

export const completeTaskWithOutcome = async (instanceTaskId: number, decisionOutcome?: string, notes?: string): Promise<InstanceTask> => {
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Completing task ${instanceTaskId} with outcome in environment:`, config.app.env);
    const { mockInstanceTasks } = await import('./mock/execution');
    const task = mockInstanceTasks.find(t => t.instanceTaskId === instanceTaskId);
    if (task) {
      task.status = 'COMPLETED';
      task.completedOn = new Date().toISOString();
      task.decisionOutcome = decisionOutcome;
    }
    return Promise.resolve(task || {} as InstanceTask);
  }

  const response = await api.post(`/execution/tasks/${instanceTaskId}/complete`, {
    decisionOutcome,
    completionNotes: notes,
    completedByUserId: 1,
    completedBy: 'current_user'
  });
  return response.data;
};

export const rejectTask = async (instanceTaskId: number, reason: string): Promise<InstanceTask> => {
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Rejecting task ${instanceTaskId} in environment:`, config.app.env);
    const { mockInstanceTasks } = await import('./mock/execution');
    const task = mockInstanceTasks.find(t => t.instanceTaskId === instanceTaskId);
    if (task) {
      task.status = 'REJECTED';
    }
    return Promise.resolve(task || {} as InstanceTask);
  }

  const response = await api.post(`/execution/tasks/${instanceTaskId}/reject`, {
    decisionOutcome: 'REJECTED',
    rejectionReason: reason,
    rejectedByUserId: 1,
    rejectedBy: 'current_user'
  });
  return response.data;
};

export const createQuery = async (instanceTaskId: number, title: string, description: string, assignedToUserId: number, priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'): Promise<TaskQuery> => {
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Creating query for task ${instanceTaskId} in environment:`, config.app.env);
    return Promise.resolve({
      queryId: Math.floor(Math.random() * 1000),
      queryTitle: title,
      queryDescription: description,
      queryStatus: 'OPEN',
      priority,
      raisedByUsername: 'current_user',
      assignedToUsername: 'assigned_user',
      createdAt: new Date().toISOString()
    });
  }

  const response = await api.post('/queries', {
    instanceTaskId,
    queryTitle: title,
    queryDescription: description,
    raisedByUserId: 1,
    assignedToUserId,
    priority,
    createdBy: 'current_user'
  });
  return response.data;
};