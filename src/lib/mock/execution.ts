import { WorkflowInstanceDto, InstanceTaskDto } from '@/types/execution';

export const mockWorkflowInstances: WorkflowInstanceDto[] = [
  {
    id: '1',
    workflowId: '1',
    status: 'IN_PROGRESS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    workflowId: '2',
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockInstanceTasks: InstanceTaskDto[] = [
  {
    id: '1',
    instanceId: '1',
    taskName: 'Start',
    status: 'COMPLETED',
    assignee: 'John Doe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    instanceId: '1',
    taskName: 'File Upload',
    status: 'IN_PROGRESS',
    assignee: 'Jane Smith',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];