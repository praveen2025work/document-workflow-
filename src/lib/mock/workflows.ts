import { PaginatedWorkflowsResponse, WorkflowDto } from '@/types/workflow';

export const mockWorkflows: WorkflowDto[] = [
  {
    id: '1',
    name: 'Sample Workflow 1',
    description: 'This is a sample workflow for testing purposes.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [],
    roles: [],
  },
  {
    id: '2',
    name: 'Sample Workflow 2',
    description: 'Another sample workflow.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [],
    roles: [],
  },
];

export const mockPaginatedWorkflows: PaginatedWorkflowsResponse = {
  data: mockWorkflows,
  page: 1,
  size: 10,
  total: mockWorkflows.length,
};