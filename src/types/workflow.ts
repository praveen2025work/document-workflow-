export type TaskType = 'FILE_UPLOAD' | 'FILE_DOWNLOAD' | 'FILE_UPDATE' | 'CONSOLIDATE_FILES' | 'DECISION';

export interface WorkflowTaskDto {
  taskId: number;
  name: string;
  taskType: TaskType;
  roleId: number;
  sequenceOrder: number;
  expectedCompletion: number; // in minutes
}

export interface WorkflowDto {
  workflowId: number;
  name: string;
  description: string;
  reminderBeforeDueMins: number;
  minutesAfterDue: number;
  escalationAfterMins: number;
  dueInMins: number;
  isActive: 'Y' | 'N';
  createdBy: string;
  createdOn: string;
  updatedBy?: string;
  updatedOn?: string;
  tasks?: WorkflowTaskDto[];
}

export interface PaginatedWorkflowsResponse {
  content: WorkflowDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface WorkflowRoleAssignmentDto {
  roleId: number;
  userId: number;
  isActive: 'Y' | 'N';
}