import {
  UserDashboardData,
  AdminDashboardData,
  UserWorkload,
  UserNotification,
  UserDashboard,
  AssignableTask,
} from '@/types/dashboard';

export const mockUserDashboardData: UserDashboardData = {
  activeTasks: 12,
  completedTasks: 35,
  overdueTasks: 3,
  notifications: 8,
};

export const mockAdminDashboardData: AdminDashboardData = {
  totalWorkflows: 25,
  activeInstances: 18,
  totalUsers: 125,
  systemHealth: 'OK',
};

export const mockUserWorkload: UserWorkload = {
  userId: 1,
  username: 'johndoe',
  pendingTasks: 8,
  inProgressTasks: 4,
  completedTasks: 35,
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
  {
    notificationId: 4,
    userId: 1,
    message: 'New workflow "Customer Onboarding" has been assigned to you.',
    status: 'UNREAD',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    notificationId: 5,
    userId: 1,
    message: 'Task "Financial Audit" requires your attention.',
    status: 'UNREAD',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    notificationId: 6,
    userId: 1,
    message: 'Workflow "Security Review" has been escalated.',
    status: 'READ',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    notificationId: 7,
    userId: 1,
    message: 'Task "Code Review" has been completed successfully.',
    status: 'READ',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    notificationId: 8,
    userId: 1,
    message: 'Reminder: Task "Training Materials" is due tomorrow.',
    status: 'UNREAD',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
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
      status: 'IN_PROGRESS',
      assignedTo: 1,
      assignedToUsername: 'alice',
      workflowName: 'Document Processing',
      dueDate: '2025-01-10T10:00:00.000Z',
      instanceId: 1,
      taskType: 'FILE_UPLOAD'
    },
    {
      instanceTaskId: 10,
      taskName: 'Review Document',
      status: 'IN_PROGRESS',
      assignedTo: 1,
      assignedToUsername: 'alice',
      workflowName: 'Document Processing',
      dueDate: '2025-01-08T15:30:00.000Z',
      instanceId: 1,
      taskType: 'DECISION'
    },
    {
      instanceTaskId: 3,
      taskName: 'Process Invoice',
      status: 'IN_PROGRESS',
      assignedTo: 1,
      assignedToUsername: 'alice',
      workflowName: 'Financial Processing',
      dueDate: '2025-01-06T12:00:00.000Z',
      instanceId: 3,
      taskType: 'FILE_UPDATE'
    },
    {
      instanceTaskId: 4,
      taskName: 'Update Customer Records',
      status: 'IN_PROGRESS',
      assignedTo: 1,
      assignedToUsername: 'alice',
      workflowName: 'Customer Management',
      dueDate: '2025-01-12T09:00:00.000Z',
      instanceId: 4,
      taskType: 'FILE_UPDATE'
    },
    {
      instanceTaskId: 5,
      taskName: 'Final Approval',
      status: 'COMPLETED',
      assignedTo: 1,
      assignedToUsername: 'alice',
      workflowName: 'Document Processing',
      dueDate: '2025-01-03T16:00:00.000Z',
      instanceId: 1,
      taskType: 'DECISION'
    },
    {
      instanceTaskId: 6,
      taskName: 'Generate Report',
      status: 'COMPLETED',
      assignedTo: 1,
      assignedToUsername: 'alice',
      workflowName: 'Monthly Report Generation',
      dueDate: '2025-01-02T14:00:00.000Z',
      instanceId: 5,
      taskType: 'FILE_CONSOLIDATE'
    },
    {
      instanceTaskId: 7,
      taskName: 'Quality Check',
      status: 'COMPLETED',
      assignedTo: 1,
      assignedToUsername: 'alice',
      workflowName: 'Quality Review',
      dueDate: '2025-01-01T11:00:00.000Z',
      instanceId: 2,
      taskType: 'DECISION'
    },
    {
      instanceTaskId: 8,
      taskName: 'Data Validation',
      status: 'NOT_STARTED',
      assignedTo: 1,
      assignedToUsername: 'alice',
      workflowName: 'Data Processing',
      dueDate: '2025-01-15T10:00:00.000Z',
      instanceId: 6,
      taskType: 'FILE_UPLOAD'
    },
    {
      instanceTaskId: 9,
      taskName: 'Security Review',
      status: 'NOT_STARTED',
      assignedTo: 1,
      assignedToUsername: 'alice',
      workflowName: 'Security Audit',
      dueDate: '2025-01-20T14:00:00.000Z',
      instanceId: 7,
      taskType: 'DECISION'
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
    instanceTaskId: 101,
    instanceId: 10,
    taskId: 1,
    status: "IN_PROGRESS",
    assignedTo: null,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Upload Customer Documents",
    taskType: "FILE_UPLOAD",
    assignedToUsername: "",
    instanceTaskFiles: null,
    decisionOutcomes: null,
    workflowName: "Customer Onboarding",
    dueDate: "2025-01-07T14:00:00.000Z"
  },
  {
    instanceTaskId: 102,
    instanceId: 11,
    taskId: 2,
    status: "IN_PROGRESS",
    assignedTo: null,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Review Contract Terms",
    taskType: "FILE_UPDATE",
    assignedToUsername: "",
    instanceTaskFiles: null,
    decisionOutcomes: null,
    workflowName: "Contract Management",
    dueDate: "2025-01-09T16:30:00.000Z"
  },
  {
    instanceTaskId: 103,
    instanceId: 12,
    taskId: 3,
    status: "IN_PROGRESS",
    assignedTo: null,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Consolidate Financial Reports",
    taskType: "CONSOLIDATE_FILES",
    assignedToUsername: "",
    instanceTaskFiles: null,
    decisionOutcomes: null,
    workflowName: "Financial Reporting",
    dueDate: "2025-01-05T17:00:00.000Z"
  },
  {
    instanceTaskId: 104,
    instanceId: 13,
    taskId: 4,
    status: "IN_PROGRESS",
    assignedTo: null,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Approve Budget Request",
    taskType: "DECISION",
    assignedToUsername: "",
    instanceTaskFiles: null,
    decisionOutcomes: null,
    workflowName: "Budget Approval",
    dueDate: "2025-01-11T12:00:00.000Z"
  },
  {
    instanceTaskId: 105,
    instanceId: 14,
    taskId: 5,
    status: "IN_PROGRESS",
    assignedTo: null,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Update Employee Records",
    taskType: "FILE_UPDATE",
    assignedToUsername: "",
    instanceTaskFiles: null,
    decisionOutcomes: null,
    workflowName: "HR Management",
    dueDate: "2025-01-08T10:00:00.000Z"
  },
  {
    instanceTaskId: 106,
    instanceId: 15,
    taskId: 6,
    status: "IN_PROGRESS",
    assignedTo: null,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Quality Assurance Check",
    taskType: "DECISION",
    assignedToUsername: "",
    instanceTaskFiles: null,
    decisionOutcomes: null,
    workflowName: "Quality Control",
    dueDate: "2025-01-13T15:00:00.000Z"
  },
  {
    instanceTaskId: 107,
    instanceId: 16,
    taskId: 7,
    status: "IN_PROGRESS",
    assignedTo: null,
    startedOn: null,
    completedOn: null,
    decisionOutcome: null,
    taskName: "Process Payment Authorization",
    taskType: "FILE_UPLOAD",
    assignedToUsername: "",
    instanceTaskFiles: null,
    decisionOutcomes: null,
    workflowName: "Payment Processing",
    dueDate: "2025-01-06T11:00:00.000Z"
  }
];