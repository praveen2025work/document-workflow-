import { ProcessOwnerDashboardData, ProcessOwnerWorkload } from '@/types/processOwner';

export const mockProcessOwnerDashboardData: ProcessOwnerDashboardData = {
  totalManagedWorkflows: 5,
  activeInstances: 12,
  escalatedTasks: 3,
};

export const mockProcessOwnerWorkload: ProcessOwnerWorkload = {
  processOwnerId: 1,
  username: 'process.owner',
  managedWorkflows: ['Sample Workflow 1', 'Sample Workflow 2'],
  activeInstances: 12,
  escalatedTasks: 3,
};