export interface DashboardSummary {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalWorkflows: number;
  activeWorkflows: number;
  notifications: number;
  taskCompletionRate: number;
}

export interface DashboardTask {
  instanceTaskId: number;
  taskName: string;
  status: string;
  assignedToUsername: string;
}

export interface DashboardWorkflow {
  instanceId: number;
  workflowName: string;
  status: string;
}

export interface DashboardWorkload {
  userId: number;
  currentWorkload: number;
  maxCapacity: number;
  utilization: number;
}

export interface UserDashboard {
  userId: number;
  username: string;
  userRole: string;
  summary: DashboardSummary;
  myTasks: DashboardTask[];
  myWorkflows: DashboardWorkflow[];
  workload: DashboardWorkload;
}