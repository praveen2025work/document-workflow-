import { PaginatedWorkflowsResponse, WorkflowDto } from '@/types/workflow';

export const mockWorkflows: WorkflowDto[] = [
  {
    workflowId: 1,
    name: 'Document Review Workflow',
    description: 'A comprehensive workflow for document review and approval process.',
    reminderBeforeDueMins: 30,
    minutesAfterDue: 15,
    escalationAfterMins: 60,
    dueInMins: 120,
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date().toISOString(),
    updatedBy: 'admin@company.com',
    updatedOn: new Date().toISOString(),
    tasks: [],
  },
  {
    workflowId: 2,
    name: 'Invoice Processing Workflow',
    description: 'Automated workflow for processing and approving invoices.',
    reminderBeforeDueMins: 45,
    minutesAfterDue: 30,
    escalationAfterMins: 90,
    dueInMins: 180,
    isActive: 'Y',
    createdBy: 'finance@company.com',
    createdOn: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedBy: 'finance@company.com',
    updatedOn: new Date(Date.now() - 86400000).toISOString(),
    tasks: [],
  },
  {
    workflowId: 3,
    name: 'Employee Onboarding',
    description: 'Complete onboarding process for new employees.',
    reminderBeforeDueMins: 60,
    minutesAfterDue: 45,
    escalationAfterMins: 120,
    dueInMins: 240,
    isActive: 'N',
    createdBy: 'hr@company.com',
    createdOn: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedBy: 'hr@company.com',
    updatedOn: new Date(Date.now() - 172800000).toISOString(),
    tasks: [],
  },
];

export const mockPaginatedWorkflows: PaginatedWorkflowsResponse = {
  content: mockWorkflows,
  totalElements: mockWorkflows.length,
  totalPages: 1,
  size: 10,
  number: 0,
};