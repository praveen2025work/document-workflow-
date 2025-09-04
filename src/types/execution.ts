export interface InstanceTask {
  instanceTaskId: number;
  instanceId: number;
  taskId: number;
  status: string;
  assignedTo: number;
  startedOn: string;
  completedOn: string | null;
  decisionOutcome: string | null;
  assignedToUsername: string;
  taskName: string;
  taskType: string;
}

export interface WorkflowInstance {
  instanceId: number;
  workflowId: number;
  status: string;
  startedBy: number;
  startedOn: string;
  completedOn: string | null;
  escalatedTo: number | null;
  calendarId: number;
  calendarName: string;
  workflowName: string;
  startedByUsername: string;
  escalatedToUsername: string | null;
  instanceTasks: InstanceTask[];
}