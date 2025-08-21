import { WorkflowInstanceDto, InstanceTaskDto } from '@/types/execution';

export const mockWorkflowInstances: WorkflowInstanceDto[] = [
  {
    instanceId: 1,
    workflowId: 1,
    status: 'RUNNING',
    startedBy: 1,
    startedOn: new Date().toISOString(),
    workflowName: 'Document Review Workflow',
    startedByUsername: 'johndoe',
    instanceTasks: [],
  },
  {
    instanceId: 2,
    workflowId: 2,
    status: 'COMPLETED',
    startedBy: 2,
    startedOn: new Date().toISOString(),
    completedOn: new Date().toISOString(),
    workflowName: 'Invoice Processing Workflow',
    startedByUsername: 'janesmith',
    instanceTasks: [],
  },
];

export const mockInstanceTasks: InstanceTaskDto[] = [
  {
    instanceTaskId: 1,
    instanceId: 1,
    taskId: 1,
    status: 'COMPLETED',
    assignedTo: 1,
    startedOn: new Date().toISOString(),
    completedOn: new Date().toISOString(),
    taskName: 'Start',
    assignedToUsername: 'johndoe',
  },
  {
    instanceTaskId: 2,
    instanceId: 1,
    taskId: 2,
    status: 'IN_PROGRESS',
    assignedTo: 2,
    startedOn: new Date().toISOString(),
    taskName: 'File Upload',
    assignedToUsername: 'janesmith',
  },
];