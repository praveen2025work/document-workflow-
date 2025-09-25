export interface ProcessOwnerDashboardData {
  totalManagedWorkflows: number;
  activeInstances: number;
  escalatedTasks: number;
  statistics?: {
    activeWorkflows: number;
    completedToday: number;
    delayedTasks: number;
    avgCompletionTime: string;
  };
  workflowHealth?: Array<{
    workflowId: number;
    workflowName: string;
    status: string;
    activeInstances: number;
    delayedTasks: number;
    avgCompletionTime: string;
  }>;
  actionableInsights?: Array<{
    taskId: number;
    taskName: string;
    workflowId: number;
    workflowName: string;
    assignedTo: string;
    status: string;
    delayedBy?: string;
  }>;
}

export interface ProcessOwnerWorkload {
  processOwnerId: number;
  username: string;
  managedWorkflows: string[];
  activeInstances: number;
  escalatedTasks: number;
  userWorkloads?: Array<{
    userId: number;
    userName: string;
    assignedTasks: number;
    completedTasks: number;
    avgTaskCompletionTime: string;
  }>;
}