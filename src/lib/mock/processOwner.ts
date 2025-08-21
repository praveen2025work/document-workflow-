import { ProcessOwnerDashboardData, ProcessOwnerWorkload } from '@/types/processOwner';

export const mockProcessOwnerDashboardData: ProcessOwnerDashboardData = {
  totalWorkflowsOwned: 5,
  activeInstances: 12,
  errorRate: '5%',
};

export const mockProcessOwnerWorkload: ProcessOwnerWorkload = {
  workflows: [
    {
      workflowId: '1',
      workflowName: 'Sample Workflow 1',
      activeInstances: 5,
      errorInstances: 1,
    },
    {
      workflowId: '2',
      workflowName: 'Sample Workflow 2',
      activeInstances: 7,
      errorInstances: 0,
    },
  ],
};