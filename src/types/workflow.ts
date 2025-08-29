export type TaskType = 'FILE_UPLOAD' | 'FILE_UPDATE' | 'CONSOLIDATE_FILE' | 'DECISION' | 'FILE_DOWNLOAD';
export type YesNo = 'Y' | 'N';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FileSelectionMode = 'USER_SELECT' | 'ALL_FILES' | 'AUTO_SELECT';
export type DecisionType = 'APPROVAL' | 'CHOICE';

export interface DecisionOutcome {
  outcomeId?: number;
  taskId?: number;
  outcomeName: string;
  nextTaskId: number;
  nextTaskName?: string;
}

export interface WorkflowTask {
  taskId: number;
  workflowId: number;
  name: string;
  taskType: TaskType;
  roleId: number;
  expectedCompletion: number;
  sequenceOrder: number;
  escalationRules: string;
  canBeRevisited: YesNo;
  maxRevisits: number;
  fileSelectionMode: FileSelectionMode;
  taskDescription: string;
  taskPriority: TaskPriority;
  autoEscalationEnabled: YesNo;
  notificationRequired: YesNo;
  allowNewFiles: YesNo;
  fileRetentionDays: number;
  keepFileVersions?: YesNo;
  maxFileVersions?: number;
  fileSourceTaskIds?: string;
  consolidationRulesJson?: string;
  isDecisionTask?: YesNo;
  decisionType?: DecisionType;
  decisionOutcomes?: DecisionOutcome[];
  roleName?: string;
  completed?: boolean;
  pending?: boolean;
  inProgress?: boolean;
  rejected?: boolean;
}

export interface WorkflowRole {
  id?: number;
  workflowId?: number;
  roleId: number;
  userId: number;
  isActive: YesNo;
  roleName?: string;
  userName?: string;
}

export interface WorkflowParameter {
  paramId?: number;
  workflowId?: number;
  paramKey: string;
  paramValue: string;
  createdBy?: string;
  createdOn?: string;
}

export interface Workflow {
  workflowId: number;
  name: string;
  description: string;
  reminderBeforeDueMins: number;
  minutesAfterDue: number;
  escalationAfterMins: number;
  dueInMins: number;
  isActive: YesNo;
  calendarId: number | null;
  createdBy: string;
  createdOn: string;
  updatedBy: string | null;
  updatedOn: string | null;
  workflowRoles: WorkflowRole[] | null;
  tasks: WorkflowTask[] | null;
  parameters: WorkflowParameter[] | null;
}

export interface CreateWorkflowDto {
  name: string;
  description: string;
  reminderBeforeDueMins: number;
  minutesAfterDue: number;
  escalationAfterMins: number;
  dueInMins: number;
  isActive: YesNo;
  calendarId: number | null;
  createdBy: string;
  tasks: Omit<WorkflowTask, 'taskId' | 'workflowId'>[];
  workflowRoles: Omit<WorkflowRole, 'id' | 'workflowId' | 'roleName' | 'userName'>[];
  parameters: Omit<WorkflowParameter, 'paramId' | 'workflowId' | 'createdBy' | 'createdOn'>[];
}

export interface UpdateWorkflowDto {
  name: string;
  description: string;
  reminderBeforeDueMins: number;
  minutesAfterDue: number;
  escalationAfterMins: number;
  dueInMins: number;
  isActive: YesNo;
  calendarId: number | null;
  updatedBy: string;
}

export type CreateTaskDto = Omit<WorkflowTask, 'taskId' | 'workflowId' | 'roleName' | 'completed' | 'pending' | 'inProgress' | 'rejected' | 'decisionOutcomes'> & { decisionOutcomes?: Omit<DecisionOutcome, 'outcomeId' | 'taskId' | 'nextTaskName'>[] };

export type UpdateTaskDto = Partial<Omit<CreateTaskDto, 'roleId' | 'sequenceOrder' | 'taskType'>>;

export interface AddRoleDto {
  roleId: number;
  userId: number;
  isActive: YesNo;
}

export interface PaginatedWorkflowsResponse {
  content: Workflow[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}

export interface DeleteWorkflowResponse {
  message: string;
  workflowId: number;
  deletedAt: string;
}