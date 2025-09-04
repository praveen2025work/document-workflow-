import {
  UserDashboardData,
  AdminDashboardData,
  UserWorkload,
  UserNotification,
  UserDashboard,
  AssignableTask,
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

export const mockUserDashboard: UserDashboard = {
  userId: 1,
  username: 'alice',
  userRole: 'Process Owner',
  summary: {
    totalTasks: 15,
    pendingTasks: 5,
    completedTasks: 8,
    overdueTasks: 2,
    totalWorkflows: 3,
    activeWorkflows: 2,
    notifications: 4,
    taskCompletionRate: 85.5
  },
  myTasks: [
    {
      instanceTaskId: 1,
      taskName: 'Upload Raw Data',
      status: 'PENDING',
      assignedToUsername: 'alice'
    },
    {
      instanceTaskId: 2,
      taskName: 'Review Document',
      status: 'IN_PROGRESS',
      assignedToUsername: 'alice'
    },
    {
      instanceTaskId: 3,
      taskName: 'Final Approval',
      status: 'COMPLETED',
      assignedToUsername: 'alice'
    }
  ],
  myWorkflows: [
    {
      instanceId: 1,
      workflowName: 'Document Processing',
      status: 'ACTIVE'
    },
    {
      instanceId: 2,
      workflowName: 'Quality Review',
      status: 'COMPLETED'
    }
  ],
  workload: {
    userId: 1,
    currentWorkload: 12,
    maxCapacity: 20,
    utilization: 60.0
  }
};

export const mockAssignableTasks: AssignableTask[] = [
  {
    instanceTaskId: 1,
    instanceId: 1,
    taskId: 1,
    status: "COMPLETED",
    assignedTo: 1,
    startedOn: "2025-08-29T09:09:00.721631",
    completedOn: null,
    decisionOutcome: null,
    taskName: "Upload Raw Data",
    taskType: "FILE_UPLOAD",
    assignedToUsername: "alice",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 5,
    instanceId: 2,
    taskId: 1,
    status: "COMPLETED",
    assignedTo: 1,
    startedOn: "2025-08-28T11:09:00.724241",
    completedOn: "2025-08-28T12:09:00.724241",
    decisionOutcome: null,
    taskName: "Upload Raw Data",
    taskType: "FILE_UPLOAD",
    assignedToUsername: "alice",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 9,
    instanceId: 3,
    taskId: 1,
    status: "PENDING",
    assignedTo: 1,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Upload Raw Data",
    taskType: "FILE_UPLOAD",
    assignedToUsername: "alice",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 13,
    instanceId: 4,
    taskId: 1,
    status: "COMPLETED",
    assignedTo: 1,
    startedOn: "2025-08-29T07:09:00.728794",
    completedOn: "2025-08-29T08:09:00.728794",
    decisionOutcome: null,
    taskName: "Upload Raw Data",
    taskType: "FILE_UPLOAD",
    assignedToUsername: "alice",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 20,
    instanceId: 7,
    taskId: 10,
    status: "PENDING",
    assignedTo: 1,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Approve Document",
    taskType: "DECISION",
    assignedToUsername: "alice",
    instanceTaskFiles: null,
    decisionOutcomes: null
  }
];