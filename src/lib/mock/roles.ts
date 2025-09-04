import { Role, RoleApiResponse } from '@/types/role';

export const mockRoles: Role[] = [
  {
    roleId: 1,
    roleName: 'System Administrator',
    isActive: 'Y',
    createdBy: 'system@company.com',
  },
  {
    roleId: 2,
    roleName: 'Process Owner',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 3,
    roleName: 'Data Analyst',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 4,
    roleName: 'Senior Analyst',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 5,
    roleName: 'Manager',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 6,
    roleName: 'Director',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 7,
    roleName: 'Auditor',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 8,
    roleName: 'Audit Manager',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 9,
    roleName: 'Financial Analyst',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 10,
    roleName: 'HR Specialist',
    isActive: 'Y',
    createdBy: 'hr@company.com',
  },
  {
    roleId: 11,
    roleName: 'Legal Counsel',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 12,
    roleName: 'Quality Assurance',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 13,
    roleName: 'Security Officer',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 14,
    roleName: 'Vendor Manager',
    isActive: 'Y',
    createdBy: 'admin@company.com',
  },
  {
    roleId: 15,
    roleName: 'Training Coordinator',
    isActive: 'N',
    createdBy: 'hr@company.com',
  },
];

export const mockPaginatedRoles: RoleApiResponse = {
  content: mockRoles,
  totalElements: mockRoles.length,
  totalPages: 1,
  size: 10,
  number: 0,
};