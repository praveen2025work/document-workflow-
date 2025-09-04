import { User, UserApiResponse } from '@/types/user';

export const mockUsers: User[] = [
  {
    userId: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    isActive: 'Y',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date().toISOString(),
  },
  {
    userId: 2,
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    isActive: 'Y',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    userId: 3,
    username: 'peterjones',
    firstName: 'Peter',
    lastName: 'Jones',
    email: 'peter.jones@company.com',
    isActive: 'N',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    userId: 4,
    username: 'sarahwilson',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@company.com',
    isActive: 'Y',
    isAdmin: 'Y',
    createdBy: 'hr@company.com',
    createdOn: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
  {
    userId: 5,
    username: 'alice',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@company.com',
    isActive: 'Y',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
  },
  {
    userId: 6,
    username: 'bob',
    firstName: 'Bob',
    lastName: 'Brown',
    email: 'bob.brown@company.com',
    isActive: 'Y',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  },
];

export const mockPaginatedUsers: UserApiResponse = {
  content: mockUsers,
  totalElements: mockUsers.length,
  totalPages: 1,
  size: 10,
  number: 0,
};