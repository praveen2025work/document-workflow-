import {
  UserDashboardData,
  AdminDashboardData,
  UserWorkload,
  UserNotification,
} from '@/types/dashboard';

export const mockUserDashboardData: UserDashboardData = {
  activeTasks: 5,
  completedTasks: 20,
  overdueTasks: 2,
  notifications: 3,
};

export const mockAdminDashboardData: AdminDashboardData = {
  totalWorkflows: 10,
  activeInstances: 8,
  totalUsers: 50,
  systemHealth: 'OK',
};

export const mockUserWorkload: UserWorkload = {
  userId: 1,
  username: 'johndoe',
  pendingTasks: 2,
  inProgressTasks: 5,
  completedTasks: 20,
};

export const mockUserNotifications: UserNotification[] = [
  {
    notificationId: 1,
    userId: 1,
    message: 'You have a new task assigned: "Review Document"',
    status: 'UNREAD',
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: 2,
    userId: 1,
    message: 'Task "Approve Invoice" is overdue.',
    status: 'UNREAD',
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: 3,
    userId: 1,
    message: 'Workflow "Monthly Report" has been completed.',
    status: 'READ',
    createdAt: new Date().toISOString(),
  },
];