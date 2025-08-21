export interface WorkflowInstanceDto {
  instanceId: number;
  workflowId: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedOn: string;
  completedOn?: string;
}

export interface InstanceTaskDto {
  instanceTaskId: number;
  instanceId: number;
  taskId: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
  assignedToUserId?: number;
  startedOn?: string;
  completedOn?: string;
  decisionOutcome?: 'APPROVED' | 'REJECTED';
}