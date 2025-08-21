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
  systemHealth: 'OK' | 'DEGRADED' | 'DOWN';
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
  status: 'UNREAD' | 'READ';
  createdAt: string;
}