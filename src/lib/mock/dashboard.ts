import {
  UserDashboardData,
  AdminDashboardData,
  UserWorkload,
  UserNotification,
} from '@/types/dashboard';

export const mockUserDashboardData: UserDashboardData = {
  activeTasks: 5,
  completedTasks: 20,
  pendingTasks: 2,
};

export const mockAdminDashboardData: AdminDashboardData = {
  totalWorkflows: 10,
  activeInstances: 8,
  errorInstances: 1,
};

export const mockUserWorkload: UserWorkload = {
  assignedTasks: 15,
  overdueTasks: 3,
  averageCompletionTime: '2 hours',
};

export const mockUserNotifications: UserNotification[] = [
  {
    id: '1',
    message: 'You have a new task assigned: "Review Document"',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    message: 'Task "Approve Invoice" is overdue.',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    message: 'Workflow "Monthly Report" has been completed.',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];