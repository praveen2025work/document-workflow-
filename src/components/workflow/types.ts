import { TaskType, TaskPriority, FileSelectionMode, YesNo, DecisionOutcome, WorkflowTaskFile, DecisionType } from '@/types/workflow';

export type NodeType = 'start' | 'end' | 'decision' | 'action' | 'api' | 'database';

export interface NodeData {
  // Common properties
  description?: string;
  taskType?: TaskType;
  taskId?: number;
  workflowId?: number;
  name?: string;
  roleId?: number;
  expectedCompletion?: number;
  sequenceOrder?: number;
  escalationRules?: string;
  parentTaskIds?: string;
  canBeRevisited?: YesNo;
  maxRevisits?: number;
  fileSelectionMode?: FileSelectionMode;
  sourceTaskIds?: string;
  fileFilterJson?: string;
  consolidationRulesJson?: string;
  decisionCriteriaJson?: string;
  taskDescription?: string;
  isDecisionTask?: YesNo;
  decisionType?: DecisionType;
  taskPriority?: TaskPriority;
  autoEscalationEnabled?: YesNo;
  notificationRequired?: YesNo;
  taskStatus?: string;
  taskStartedAt?: string;
  taskCompletedAt?: string;
  taskRejectedAt?: string;
  taskRejectionReason?: string;
  taskCompletedBy?: string;
  taskRejectedBy?: string;
  allowNewFiles?: YesNo;
  fileSourceTaskIds?: string;
  canRunInParallel?: YesNo;
  parallelTaskIds?: string;
  fileRetentionDays?: number;
  keepFileVersions?: YesNo;
  maxFileVersions?: number;
  keepFileHistory?: YesNo;
  fileHistoryDetails?: YesNo;
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
  
  // Legacy Decision properties (for backward compatibility)
  condition?: string;
  operator?: string;
  leftValue?: string;
  rightValue?: string;

  // Legacy Action properties (for backward compatibility)
  actionType?: string;
  recipient?: string;
  template?: string;

  // API properties (for backward compatibility)
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint?: string;
  body?: string;

  // Database properties (for backward compatibility)
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  table?: string;
  query?: string;
}