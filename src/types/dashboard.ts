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

export interface AssignableTask {
  instanceTaskId: number;
  instanceId: number;
  taskId: number;
  status: string;
  assignedTo: number;
  startedOn: string | null;
  completedOn: string | null;
  decisionOutcome: string | null;
  taskName: string;
  taskType: string;
  assignedToUsername: string;
  instanceTaskFiles: any[] | null;
  decisionOutcomes: any[] | null;
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

// Legacy types for existing mock data
export interface UserDashboardData {
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  notifications: number;
}

export interface AdminDashboardData {
  totalWorkflows: number;
  activeInstances: number;
  totalUsers: number;
  systemHealth: string;
}

export interface UserWorkload {
  userId: number;
  username: string;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export interface UserNotification {
  notificationId: number;
  userId: number;
  message: string;
  status: string;
  createdAt: string;
}