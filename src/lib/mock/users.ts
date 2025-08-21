import { PaginatedUsersResponse, WorkflowUserDto } from '@/types/user';

export const mockUsers: WorkflowUserDto[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Editor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
    role: 'Viewer',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockPaginatedUsers: PaginatedUsersResponse = {
  data: mockUsers,
  page: 1,
  size: 10,
  total: mockUsers.length,
};