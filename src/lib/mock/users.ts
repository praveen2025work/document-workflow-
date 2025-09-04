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
  {
    userId: 7,
    username: 'charlie',
    firstName: 'Charlie',
    lastName: 'Davis',
    email: 'charlie.davis@company.com',
    isActive: 'Y',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
  },
  {
    userId: 8,
    username: 'diana',
    firstName: 'Diana',
    lastName: 'Miller',
    email: 'diana.miller@company.com',
    isActive: 'Y',
    isAdmin: 'Y',
    createdBy: 'hr@company.com',
    createdOn: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
  },
  {
    userId: 9,
    username: 'eve',
    firstName: 'Eve',
    lastName: 'Garcia',
    email: 'eve.garcia@company.com',
    isActive: 'Y',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 691200000).toISOString(), // 8 days ago
  },
  {
    userId: 10,
    username: 'frank',
    firstName: 'Frank',
    lastName: 'Rodriguez',
    email: 'frank.rodriguez@company.com',
    isActive: 'N',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 777600000).toISOString(), // 9 days ago
  },
  {
    userId: 11,
    username: 'grace',
    firstName: 'Grace',
    lastName: 'Martinez',
    email: 'grace.martinez@company.com',
    isActive: 'Y',
    isAdmin: 'N',
    createdBy: 'hr@company.com',
    createdOn: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
  },
  {
    userId: 12,
    username: 'henry',
    firstName: 'Henry',
    lastName: 'Anderson',
    email: 'henry.anderson@company.com',
    isActive: 'Y',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 950400000).toISOString(), // 11 days ago
  },
  {
    userId: 13,
    username: 'ivy',
    firstName: 'Ivy',
    lastName: 'Taylor',
    email: 'ivy.taylor@company.com',
    isActive: 'Y',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 1036800000).toISOString(), // 12 days ago
  },
  {
    userId: 14,
    username: 'jack',
    firstName: 'Jack',
    lastName: 'Thomas',
    email: 'jack.thomas@company.com',
    isActive: 'N',
    isAdmin: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 1123200000).toISOString(), // 13 days ago
  },
  {
    userId: 15,
    username: 'karen',
    firstName: 'Karen',
    lastName: 'Jackson',
    email: 'karen.jackson@company.com',
    isActive: 'Y',
    isAdmin: 'Y',
    createdBy: 'hr@company.com',
    createdOn: new Date(Date.now() - 1209600000).toISOString(), // 14 days ago
  },
];

export const mockPaginatedUsers: UserApiResponse = {
  content: mockUsers,
  totalElements: mockUsers.length,
  totalPages: 1,
  size: 10,
  number: 0,
};