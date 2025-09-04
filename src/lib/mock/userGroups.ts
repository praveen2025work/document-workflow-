export interface UserGroup {
  groupId: number;
  groupName: string;
  description: string;
  isActive: 'Y' | 'N';
  createdBy: string;
  createdOn: string;
  updatedBy?: string | null;
  updatedOn?: string | null;
  memberCount: number;
  roles: string[];
}

export interface UserGroupMember {
  membershipId: number;
  groupId: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedOn: string;
  isActive: 'Y' | 'N';
}

export interface UserGroupApiResponse {
  content: UserGroup[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const mockUserGroups: UserGroup[] = [
  {
    groupId: 1,
    groupName: 'Finance Team',
    description: 'Financial analysts, managers, and directors responsible for financial workflows',
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
    updatedBy: 'admin@company.com',
    updatedOn: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    memberCount: 8,
    roles: ['Financial Analyst', 'Manager', 'Director'],
  },
  {
    groupId: 2,
    groupName: 'Audit Department',
    description: 'Internal and external auditors for compliance and risk management',
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 2160000000).toISOString(), // 25 days ago
    updatedBy: 'admin@company.com',
    updatedOn: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    memberCount: 5,
    roles: ['Auditor', 'Audit Manager'],
  },
  {
    groupId: 3,
    groupName: 'HR Operations',
    description: 'Human resources team for employee lifecycle management',
    isActive: 'Y',
    createdBy: 'hr@company.com',
    createdOn: new Date(Date.now() - 1728000000).toISOString(), // 20 days ago
    updatedBy: 'hr@company.com',
    updatedOn: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    memberCount: 6,
    roles: ['HR Specialist', 'Training Coordinator'],
  },
  {
    groupId: 4,
    groupName: 'IT Security',
    description: 'Information security team responsible for security compliance and assessments',
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 1296000000).toISOString(), // 15 days ago
    updatedBy: 'admin@company.com',
    updatedOn: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    memberCount: 4,
    roles: ['Security Officer', 'System Administrator'],
  },
  {
    groupId: 5,
    groupName: 'Quality Assurance',
    description: 'QA team for testing and quality control processes',
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
    updatedBy: 'admin@company.com',
    updatedOn: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    memberCount: 7,
    roles: ['Quality Assurance', 'Data Analyst'],
  },
  {
    groupId: 6,
    groupName: 'Legal Team',
    description: 'Legal counsel and compliance officers',
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    updatedBy: null,
    updatedOn: null,
    memberCount: 3,
    roles: ['Legal Counsel'],
  },
  {
    groupId: 7,
    groupName: 'Vendor Management',
    description: 'Team responsible for vendor relationships and procurement',
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedBy: null,
    updatedOn: null,
    memberCount: 4,
    roles: ['Vendor Manager', 'Process Owner'],
  },
  {
    groupId: 8,
    groupName: 'Executive Team',
    description: 'Senior leadership and decision makers',
    isActive: 'Y',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedBy: null,
    updatedOn: null,
    memberCount: 5,
    roles: ['Director', 'Manager', 'System Administrator'],
  },
  {
    groupId: 9,
    groupName: 'Project Coordinators',
    description: 'Cross-functional project coordination team',
    isActive: 'N',
    createdBy: 'admin@company.com',
    createdOn: new Date(Date.now() - 1728000000).toISOString(), // 20 days ago
    updatedBy: 'admin@company.com',
    updatedOn: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    memberCount: 0,
    roles: [],
  },
];

export const mockUserGroupMembers: UserGroupMember[] = [
  // Finance Team members
  { membershipId: 1, groupId: 1, userId: 1, username: 'johndoe', firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', joinedOn: new Date(Date.now() - 2592000000).toISOString(), isActive: 'Y' },
  { membershipId: 2, groupId: 1, userId: 5, username: 'alice', firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@company.com', joinedOn: new Date(Date.now() - 2592000000).toISOString(), isActive: 'Y' },
  { membershipId: 3, groupId: 1, userId: 9, username: 'eve', firstName: 'Eve', lastName: 'Garcia', email: 'eve.garcia@company.com', joinedOn: new Date(Date.now() - 2160000000).toISOString(), isActive: 'Y' },
  
  // Audit Department members
  { membershipId: 4, groupId: 2, userId: 7, username: 'charlie', firstName: 'Charlie', lastName: 'Davis', email: 'charlie.davis@company.com', joinedOn: new Date(Date.now() - 2160000000).toISOString(), isActive: 'Y' },
  { membershipId: 5, groupId: 2, userId: 8, username: 'diana', firstName: 'Diana', lastName: 'Miller', email: 'diana.miller@company.com', joinedOn: new Date(Date.now() - 2160000000).toISOString(), isActive: 'Y' },
  
  // HR Operations members
  { membershipId: 6, groupId: 3, userId: 11, username: 'grace', firstName: 'Grace', lastName: 'Martinez', email: 'grace.martinez@company.com', joinedOn: new Date(Date.now() - 1728000000).toISOString(), isActive: 'Y' },
  { membershipId: 7, groupId: 3, userId: 4, username: 'sarahwilson', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@company.com', joinedOn: new Date(Date.now() - 1728000000).toISOString(), isActive: 'Y' },
  
  // IT Security members
  { membershipId: 8, groupId: 4, userId: 13, username: 'ivy', firstName: 'Ivy', lastName: 'Taylor', email: 'ivy.taylor@company.com', joinedOn: new Date(Date.now() - 1296000000).toISOString(), isActive: 'Y' },
  { membershipId: 9, groupId: 4, userId: 15, username: 'karen', firstName: 'Karen', lastName: 'Jackson', email: 'karen.jackson@company.com', joinedOn: new Date(Date.now() - 1296000000).toISOString(), isActive: 'Y' },
  
  // Quality Assurance members
  { membershipId: 10, groupId: 5, userId: 2, username: 'janesmith', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', joinedOn: new Date(Date.now() - 864000000).toISOString(), isActive: 'Y' },
  { membershipId: 11, groupId: 5, userId: 6, username: 'bob', firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@company.com', joinedOn: new Date(Date.now() - 864000000).toISOString(), isActive: 'Y' },
  { membershipId: 12, groupId: 5, userId: 12, username: 'henry', firstName: 'Henry', lastName: 'Anderson', email: 'henry.anderson@company.com', joinedOn: new Date(Date.now() - 864000000).toISOString(), isActive: 'Y' },
  
  // Legal Team members
  { membershipId: 13, groupId: 6, userId: 3, username: 'peterjones', firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@company.com', joinedOn: new Date(Date.now() - 432000000).toISOString(), isActive: 'N' },
  
  // Vendor Management members
  { membershipId: 14, groupId: 7, userId: 10, username: 'frank', firstName: 'Frank', lastName: 'Rodriguez', email: 'frank.rodriguez@company.com', joinedOn: new Date(Date.now() - 259200000).toISOString(), isActive: 'N' },
  
  // Executive Team members
  { membershipId: 15, groupId: 8, userId: 4, username: 'sarahwilson', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@company.com', joinedOn: new Date(Date.now() - 86400000).toISOString(), isActive: 'Y' },
  { membershipId: 16, groupId: 8, userId: 8, username: 'diana', firstName: 'Diana', lastName: 'Miller', email: 'diana.miller@company.com', joinedOn: new Date(Date.now() - 86400000).toISOString(), isActive: 'Y' },
  { membershipId: 17, groupId: 8, userId: 15, username: 'karen', firstName: 'Karen', lastName: 'Jackson', email: 'karen.jackson@company.com', joinedOn: new Date(Date.now() - 86400000).toISOString(), isActive: 'Y' },
];

export const mockPaginatedUserGroups: UserGroupApiResponse = {
  content: mockUserGroups,
  totalElements: mockUserGroups.length,
  totalPages: 1,
  size: 10,
  number: 0,
};

// Mock statistics for user groups dashboard
export const mockUserGroupStats = {
  totalGroups: mockUserGroups.length,
  activeGroups: mockUserGroups.filter(g => g.isActive === 'Y').length,
  totalMembers: mockUserGroupMembers.filter(m => m.isActive === 'Y').length,
  averageGroupSize: Math.round(mockUserGroupMembers.filter(m => m.isActive === 'Y').length / mockUserGroups.filter(g => g.isActive === 'Y').length),
  groupsByRole: [
    { roleName: 'Financial Analyst', groupCount: 2 },
    { roleName: 'Manager', groupCount: 3 },
    { roleName: 'Director', groupCount: 2 },
    { roleName: 'Auditor', groupCount: 1 },
    { roleName: 'HR Specialist', groupCount: 1 },
    { roleName: 'Security Officer', groupCount: 1 },
    { roleName: 'Quality Assurance', groupCount: 1 },
    { roleName: 'Legal Counsel', groupCount: 1 },
    { roleName: 'Vendor Manager', groupCount: 1 },
  ],
};