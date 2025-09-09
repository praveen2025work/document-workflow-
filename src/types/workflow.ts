export type TaskType = 'FILE_UPLOAD' | 'FILE_UPDATE' | 'CONSOLIDATE_FILES' | 'DECISION' | 'FILE_DOWNLOAD';
export type YesNo = 'Y' | 'N';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FileSelectionMode = 'USER_SELECT' | 'ALL_FILES' | 'AUTO_SELECT';
export type DecisionType = 'APPROVAL' | 'CHOICE' | 'MULTI_CHOICE';
export type TriggerType = 'MANUAL' | 'SCHEDULED' | 'EVENT';
export type ActionType = 'UPLOAD' | 'UPDATE' | 'CONSOLIDATE' | 'DOWNLOAD';
export type FileStatus = 'PENDING' | 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
export type RevisionType = 'SINGLE' | 'MULTIPLE';
export type RevisionStrategy = 'REPLACE' | 'APPEND' | 'SELECTIVE';
export type ConsolidationMode = 'MANUAL' | 'AUTO';

export interface DecisionOutcome {
  outcomeId?: number;
  taskId?: number;
  outcomeName: string;
  targetTaskSequence?: number | null;
  nextTaskId?: number;
  nextTaskName?: string;
  revisionType?: RevisionType;
  revisionTaskSequences?: number[];
  revisionStrategy?: RevisionStrategy;
  revisionPriority?: number;
  revisionConditions?: string;
  autoEscalate?: YesNo;
  createdBy?: string;
}

export interface TaskFileDependency {
  fileSequence: number;
  parentFileSequence: number;
  createdBy: string;
}

export interface WorkflowTask {
  taskId: number;
  workflowId: number;
  taskSequence?: number;
  name: string;
  taskType: TaskType;
  roleId: number;
  expectedCompletion: number;
  sequenceOrder: number;
  escalationRules: string;
  parentTaskIds?: string;
  parentTaskSequences?: number[];
  canBeRevisited: YesNo;
  maxRevisits: number;
  fileSelectionMode: FileSelectionMode;
  sourceTaskIds?: string;
  fileFilterJson?: string;
  consolidationRulesJson?: string;
  decisionCriteriaJson?: string;
  taskDescription: string;
  isDecisionTask?: YesNo;
  decisionType?: DecisionType;
  decisionRequiresApproval?: YesNo;
  decisionApprovalRoleId?: number;
  revisionStrategy?: RevisionStrategy;
  taskPriority: TaskPriority;
  autoEscalationEnabled: YesNo;
  notificationRequired: YesNo;
  taskStatus?: string;
  taskStartedAt?: string;
  taskCompletedAt?: string;
  taskRejectedAt?: string;
  taskRejectionReason?: string;
  taskCompletedBy?: string;
  taskRejectedBy?: string;
  allowNewFiles: YesNo;
  fileSourceTaskIds?: string;
  canRunInParallel?: YesNo;
  parallelTaskIds?: string;
  fileRetentionDays: number;
  keepFileVersions?: YesNo;
  maxFileVersions?: number;
  keepFileHistory?: YesNo;
  fileHistoryDetails?: YesNo;
  // Consolidation specific fields
  consolidationMode?: ConsolidationMode;
  fileSelectionStrategy?: FileSelectionMode;
  maxFileSelections?: number;
  minFileSelections?: number;
  decisionOutcomes?: DecisionOutcome[];
  roleName?: string;
  completed?: boolean;
  pending?: boolean;
  inProgress?: boolean;
  rejected?: boolean;
  decisionTask?: boolean;
  // File management properties
  taskFiles?: WorkflowTaskFile[];
  outputFileName?: string;
  consolidationSources?: string[];
}

export interface WorkflowTaskFile {
  fileId?: number;
  taskId: number;
  fileSequence?: number;
  fileName: string;
  fileTypeRegex?: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy?: string;
  uploadedAt?: string;
  isRequired?: YesNo;
  fileDescription?: string;
  fileStatus?: FileStatus;
  actionType?: ActionType;
  keepFileVersions?: YesNo;
  keepFileHistory?: YesNo;
  retainForCurrentPeriod?: YesNo;
  updateOfFileSequence?: number;
  consolidatedFrom?: number[];
  fromTaskSequence?: number;
  fileCommentary?: string;
  dependencies?: TaskFileDependency[];
  // Additional fields for file update/consolidation tracking
  sourceFileKey?: string;
  originalFileName?: string;
  sourceTaskId?: string;
}

export interface WorkflowRoleUser {
  userId: number;
  userName?: string;
}

export interface WorkflowRole {
  id?: number;
  workflowId?: number;
  roleId: number;
  users: WorkflowRoleUser[];
  isActive: YesNo;
  roleName?: string;
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
  triggerType?: TriggerType;
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
  workflowRoles: Omit<WorkflowRole, 'id' | 'workflowId' | 'roleName' | 'users'> & { users: { userId: number }[] }[];
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
  userIds: number[];
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

// New types for API integration
export interface ApiWorkflow {
  workflowId: number;
  name: string;
  description: string;
  reminderBeforeDueMins: number;
  minutesAfterDue: number;
  escalationAfterMins: number;
  dueInMins: number;
  isActive: YesNo;
  createdBy: string;
}

export interface ApiWorkflowApiResponse {
  content: ApiWorkflow[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface NewApiWorkflow {
  name: string;
  description: string;
  reminderBeforeDueMins: number;
  minutesAfterDue: number;
  escalationAfterMins: number;
  dueInMins: number;
  isActive: YesNo;
  createdBy: string;
}

// Comprehensive workflow creation types matching the user's JSON structure
export interface ComprehensiveWorkflowDto {
  name: string;
  description: string;
  triggerType: TriggerType;
  reminderBeforeDueMins: number;
  minutesAfterDue: number;
  escalationAfterMins: number;
  isActive: YesNo;
  createdBy: string;
  workflowRoles: ComprehensiveWorkflowRole[];
  tasks: ComprehensiveWorkflowTask[];
}

export interface ComprehensiveWorkflowRole {
  roleId: number;
  userIds: number[];
  isActive: YesNo;
}

export interface ComprehensiveWorkflowTask {
  taskSequence: number;
  name: string;
  taskDescription: string;
  taskType: TaskType;
  roleId: number;
  sequenceOrder: number;
  expectedCompletion: number;
  escalationRules: string;
  fileRetentionDays: number;
  parentTaskSequences?: number[];
  // Consolidation specific fields
  consolidationMode?: ConsolidationMode;
  fileSelectionStrategy?: FileSelectionMode;
  maxFileSelections?: number;
  minFileSelections?: number;
  // Decision specific fields
  isDecisionTask?: YesNo;
  decisionType?: DecisionType;
  decisionRequiresApproval?: YesNo;
  decisionApprovalRoleId?: number;
  revisionStrategy?: RevisionStrategy;
  taskPriority?: TaskPriority;
  autoEscalationEnabled?: YesNo;
  notificationRequired?: YesNo;
  taskFiles?: ComprehensiveTaskFile[];
  decisionOutcomes?: ComprehensiveDecisionOutcome[];
}

export interface ComprehensiveTaskFile {
  fileSequence: number;
  fileName: string;
  fileTypeRegex: string;
  actionType: ActionType;
  fileDescription: string;
  isRequired: YesNo;
  fileStatus: FileStatus;
  keepFileVersions: YesNo;
  keepFileHistory: YesNo;
  retainForCurrentPeriod: YesNo;
  updateOfFileSequence?: number;
  consolidatedFrom?: number[];
  fromTaskSequence?: number;
  fileCommentary: string;
  dependencies?: TaskFileDependency[];
}

export interface ComprehensiveDecisionOutcome {
  outcomeName: string;
  targetTaskSequence: number | null;
  revisionType: RevisionType;
  revisionTaskSequences: number[];
  revisionStrategy: RevisionStrategy;
  revisionPriority: number;
  revisionConditions: string;
  autoEscalate: YesNo;
  createdBy: string;
}