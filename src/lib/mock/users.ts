import { PaginatedUsersResponse, WorkflowUserDto } from '@/types/user';

export const mockUsers: WorkflowUserDto[] = [
  {
    userId: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date().toISOString(),
    updatedBy: 'admin@company.com',
    updatedOn: new Date().toISOString(),
  },
  {
    userId: 2,
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedBy: 'admin@company.com',
    updatedOn: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    userId: 3,
    username: 'peterjones',
    firstName: 'Peter',
    lastName: 'Jones',
    email: 'peter.jones@company.com',
    isActive: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedBy: 'admin@company.com',
    updatedOn: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    userId: 4,
    username: 'sarahwilson',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@company.com',
    isActive: 'Y',
    createdBy: 'hr@company.com',
    createdOn: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedBy: 'hr@company.com',
    updatedOn: new Date(Date.now() - 259200000).toISOString(),
  },
];

export const mockPaginatedUsers: PaginatedUsersResponse = {
  content: mockUsers,
  totalElements: mockUsers.length,
  totalPages: 1,
  size: 10,
  number: 0,
};