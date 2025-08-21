import { PaginatedRolesResponse, WorkflowRoleDto } from '@/types/role';

export const mockRoles: WorkflowRoleDto[] = [
  {
    roleId: 1,
    roleName: 'Admin',
    isActive: 'Y',
    createdBy: 'system',
    createdOn: new Date().toISOString(),
    updatedBy: 'system',
    updatedOn: new Date().toISOString(),
  },
  {
    roleId: 2,
    roleName: 'Editor',
    isActive: 'Y',
    createdBy: 'system',
    createdOn: new Date().toISOString(),
    updatedBy: 'system',
    updatedOn: new Date().toISOString(),
  },
  {
    roleId: 3,
    roleName: 'Viewer',
    isActive: 'N',
    createdBy: 'system',
    createdOn: new Date().toISOString(),
    updatedBy: 'system',
    updatedOn: new Date().toISOString(),
  },
];

export const mockPaginatedRoles: PaginatedRolesResponse = {
  content: mockRoles,
  totalElements: mockRoles.length,
  totalPages: 1,
  size: 10,
  number: 0,
};