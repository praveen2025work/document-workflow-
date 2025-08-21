export interface ProcessOwnerDashboardData {
  totalManagedWorkflows: number;
  activeInstances: number;
  escalatedTasks: number;
}

export interface ProcessOwnerWorkload {
  processOwnerId: number;
  username: string;
  managedWorkflows: string[];
  activeInstances: number;
  escalatedTasks: number;
}