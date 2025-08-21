import { PaginatedRolesResponse, WorkflowRoleDto } from '@/types/role';

export const mockRoles: WorkflowRoleDto[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Administrator role with full permissions.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Editor',
    description: 'Editor role with permissions to create and edit workflows.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Viewer',
    description: 'Viewer role with read-only permissions.',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockPaginatedRoles: PaginatedRolesResponse = {
  data: mockRoles,
  page: 1,
  size: 10,
  total: mockRoles.length,
};