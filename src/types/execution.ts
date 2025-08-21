export interface WorkflowInstanceDto {
  instanceId: number;
  workflowId: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedBy: number;
  startedOn: string;
  completedOn?: string;
  escalatedTo?: number;
  calendarId?: number;
  calendarName?: string;
  workflowName?: string;
  startedByUsername?: string;
  escalatedToUsername?: string;
  instanceTasks?: InstanceTaskDto[];
}

export interface InstanceTaskDto {
  instanceTaskId: number;
  instanceId: number;
  taskId: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
  assignedTo: number;
  startedOn: string;
  completedOn?: string;
  decisionOutcome?: string;
  assignedToUsername?: string;
  taskName?: string;
  taskType?: string;
}