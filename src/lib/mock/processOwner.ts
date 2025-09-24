import { ProcessOwnerDashboardData, ProcessOwnerWorkload } from '@/types/processOwner';

export const mockProcessOwnerDashboardData: ProcessOwnerDashboardData = {
  totalManagedWorkflows: 8,
  activeInstances: 15,
  escalatedTasks: 4,
  statistics: {
    activeWorkflows: 8,
    completedToday: 12,
    delayedTasks: 4,
    avgCompletionTime: '3.2 hours'
  },
  workflowHealth: [
    {
      workflowId: 1,
      workflowName: 'Monthly Finance Review',
      status: 'HEALTHY',
      activeInstances: 3,
      delayedTasks: 0,
      avgCompletionTime: '2.5 hours'
    },
    {
      workflowId: 2,
      workflowName: 'Quarterly Audit',
      status: 'AT_RISK',
      activeInstances: 2,
      delayedTasks: 1,
      avgCompletionTime: '8.2 hours'
    },
    {
      workflowId: 3,
      workflowName: 'Customer Onboarding',
      status: 'HEALTHY',
      activeInstances: 5,
      delayedTasks: 0,
      avgCompletionTime: '1.8 hours'
    },
    {
      workflowId: 4,
      workflowName: 'Invoice Processing',
      status: 'UNHEALTHY',
      activeInstances: 4,
      delayedTasks: 3,
      avgCompletionTime: '6.5 hours'
    }
  ],
  actionableInsights: [
    {
      taskId: 101,
      taskName: 'Review Financial Documents',
      workflowId: 4,
      workflowName: 'Invoice Processing',
      assignedTo: 'Bob Brown',
      status: 'DELAYED',
      delayedBy: '2 hours'
    },
    {
      taskId: 102,
      taskName: 'Audit Compliance Check',
      workflowId: 2,
      workflowName: 'Quarterly Audit',
      assignedTo: 'Alice Johnson',
      status: 'DELAYED',
      delayedBy: '4 hours'
    }
  ]
};

export const mockProcessOwnerWorkload: ProcessOwnerWorkload = {
  processOwnerId: 1,
  username: 'alice',
  managedWorkflows: [
    'Monthly Finance Review Workflow',
    'Quarterly Audit Workflow',
    'Customer Onboarding Process',
    'Invoice Processing Workflow',
    'Employee Performance Review',
    'Vendor Management Process',
    'Security Compliance Check',
    'Budget Approval Workflow'
  ],
  activeInstances: 15,
  escalatedTasks: 4,
  userWorkloads: [
    {
      userId: 1,
      userName: 'Alice Johnson',
      assignedTasks: 8,
      completedTasks: 45,
      avgTaskCompletionTime: '2.5 hours'
    },
    {
      userId: 2,
      userName: 'Bob Brown',
      assignedTasks: 6,
      completedTasks: 38,
      avgTaskCompletionTime: '3.1 hours'
    },
    {
      userId: 7,
      userName: 'Charlie Davis',
      assignedTasks: 4,
      completedTasks: 32,
      avgTaskCompletionTime: '2.8 hours'
    },
    {
      userId: 8,
      userName: 'Diana Miller',
      assignedTasks: 10,
      completedTasks: 52,
      avgTaskCompletionTime: '2.2 hours'
    }
  ]
};

// Additional mock data for process owner dashboard
export const mockProcessOwnerMetrics = {
  workflowPerformance: [
    {
      workflowName: 'Monthly Finance Review Workflow',
      totalInstances: 25,
      completedInstances: 20,
      averageCompletionTime: '4.2 hours',
      successRate: 95.2,
      escalationRate: 8.0,
    },
    {
      workflowName: 'Quarterly Audit Workflow',
      totalInstances: 12,
      completedInstances: 10,
      averageCompletionTime: '12.5 hours',
      successRate: 91.7,
      escalationRate: 16.7,
    },
    {
      workflowName: 'Customer Onboarding Process',
      totalInstances: 45,
      completedInstances: 42,
      averageCompletionTime: '2.8 hours',
      successRate: 97.8,
      escalationRate: 4.4,
    },
    {
      workflowName: 'Invoice Processing Workflow',
      totalInstances: 78,
      completedInstances: 75,
      averageCompletionTime: '1.5 hours',
      successRate: 98.7,
      escalationRate: 2.6,
    },
  ],
  teamWorkload: [
    {
      userId: 1,
      username: 'alice',
      firstName: 'Alice',
      lastName: 'Johnson',
      activeTasks: 8,
      completedTasks: 45,
      overdueTasks: 1,
      utilization: 80.0,
    },
    {
      userId: 2,
      username: 'bob',
      firstName: 'Bob',
      lastName: 'Brown',
      activeTasks: 6,
      completedTasks: 38,
      overdueTasks: 0,
      utilization: 60.0,
    },
    {
      userId: 7,
      username: 'charlie',
      firstName: 'Charlie',
      lastName: 'Davis',
      activeTasks: 4,
      completedTasks: 32,
      overdueTasks: 2,
      utilization: 70.0,
    },
    {
      userId: 8,
      username: 'diana',
      firstName: 'Diana',
      lastName: 'Miller',
      activeTasks: 10,
      completedTasks: 52,
      overdueTasks: 1,
      utilization: 90.0,
    },
  ],
  recentEscalations: [
    {
      instanceId: 3,
      workflowName: 'Monthly Finance Review Workflow',
      taskName: 'Manager Review',
      escalatedFrom: 'bob',
      escalatedTo: 'sarahwilson',
      escalatedAt: new Date(Date.now() - 86400000).toISOString(),
      reason: 'Task overdue by 4 hours',
      status: 'PENDING',
    },
    {
      instanceId: 5,
      workflowName: 'Quarterly Audit Workflow',
      taskName: 'Document Collection',
      escalatedFrom: 'grace',
      escalatedTo: 'diana',
      escalatedAt: new Date(Date.now() - 259200000).toISOString(),
      reason: 'Task failed due to missing documents',
      status: 'IN_PROGRESS',
    },
    {
      instanceId: 7,
      workflowName: 'Customer Onboarding Process',
      taskName: 'Background Check',
      escalatedFrom: 'henry',
      escalatedTo: 'karen',
      escalatedAt: new Date(Date.now() - 172800000).toISOString(),
      reason: 'Requires additional verification',
      status: 'RESOLVED',
    },
    {
      instanceId: 9,
      workflowName: 'Security Compliance Check',
      taskName: 'Vulnerability Assessment',
      escalatedFrom: 'ivy',
      escalatedTo: 'alice',
      escalatedAt: new Date(Date.now() - 43200000).toISOString(),
      reason: 'Critical security issue found',
      status: 'URGENT',
    },
  ],
};