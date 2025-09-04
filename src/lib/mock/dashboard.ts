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
      status: 'PENDING',
      assignedToUsername: 'alice'
    },
    {
      instanceTaskId: 3,
      taskName: 'Process Invoice',
      status: 'IN_PROGRESS',
      assignedToUsername: 'alice'
    },
    {
      instanceTaskId: 4,
      taskName: 'Update Customer Records',
      status: 'IN_PROGRESS',
      assignedToUsername: 'alice'
    },
    {
      instanceTaskId: 5,
      taskName: 'Final Approval',
      status: 'COMPLETED',
      assignedToUsername: 'alice'
    },
    {
      instanceTaskId: 6,
      taskName: 'Generate Report',
      status: 'COMPLETED',
      assignedToUsername: 'alice'
    },
    {
      instanceTaskId: 7,
      taskName: 'Quality Check',
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
      status: 'ACTIVE'
    },
    {
      instanceId: 3,
      workflowName: 'Monthly Report Generation',
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
    status: "PENDING",
    assignedTo: 1,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Upload Customer Documents",
    taskType: "FILE_UPLOAD",
    assignedToUsername: "alice",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 5,
    instanceId: 2,
    taskId: 2,
    status: "PENDING",
    assignedTo: 2,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Review Contract Terms",
    taskType: "FILE_UPDATE",
    assignedToUsername: "bob",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 9,
    instanceId: 3,
    taskId: 3,
    status: "IN_PROGRESS",
    assignedTo: 3,
    startedOn: "2025-01-04T10:30:00.000000",
    completedOn: null,
    decisionOutcome: null,
    taskName: "Consolidate Financial Reports",
    taskType: "CONSOLIDATE_FILES",
    assignedToUsername: "charlie",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 13,
    instanceId: 4,
    taskId: 4,
    status: "COMPLETED",
    assignedTo: 1,
    startedOn: "2025-01-03T14:15:00.000000",
    completedOn: "2025-01-03T16:45:00.000000",
    decisionOutcome: null,
    taskName: "Process Invoice Payment",
    taskType: "FILE_UPLOAD",
    assignedToUsername: "alice",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 20,
    instanceId: 7,
    taskId: 5,
    status: "PENDING",
    assignedTo: 4,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Approve Budget Request",
    taskType: "DECISION",
    assignedToUsername: "diana",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 25,
    instanceId: 8,
    taskId: 6,
    status: "IN_PROGRESS",
    assignedTo: 2,
    startedOn: "2025-01-04T09:00:00.000000",
    completedOn: null,
    decisionOutcome: null,
    taskName: "Update Employee Records",
    taskType: "FILE_UPDATE",
    assignedToUsername: "bob",
    instanceTaskFiles: null,
    decisionOutcomes: null
  },
  {
    instanceTaskId: 30,
    instanceId: 9,
    taskId: 7,
    status: "PENDING",
    assignedTo: 5,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Quality Assurance Check",
    taskType: "DECISION",
    assignedToUsername: "eve",
    instanceTaskFiles: null,
    decisionOutcomes: null
  }
];