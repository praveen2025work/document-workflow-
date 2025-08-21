import axios from 'axios';
import { config } from './config';
import { PaginatedRolesResponse, WorkflowRoleDto } from '@/types/role';
import { mockPaginatedRoles, mockRoles } from './mock/roles';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Fetch all roles with pagination and filtering
export const getRoles = async (
  params: {
    page?: number;
    size?: number;
    isActive?: 'Y' | 'N';
  } = {}
): Promise<PaginatedRolesResponse> => {
  if (config.app.isMock) {
    return Promise.resolve(mockPaginatedRoles);
  }
  const response = await api.get('/api/roles', { params });
  return response.data;
};

// Get a single role by ID
export const getRoleById = async (roleId: number): Promise<WorkflowRoleDto> => {
  if (config.app.isMock) {
    const role = mockRoles.find((r) => r.roleId === roleId);
    if (role) {
      return Promise.resolve(role);
    } else {
      return Promise.reject(new Error('Role not found'));
    }
  }
  const response = await api.get(`/api/roles/${roleId}`);
  return response.data;
};

// Create a new role
export const createRole = async (
  roleData: Omit<WorkflowRoleDto, 'roleId' | 'createdOn' | 'updatedOn'>
): Promise<WorkflowRoleDto> => {
  if (config.app.isMock) {
    const newRole: WorkflowRoleDto = {
      roleId: mockRoles.length + 1,
      ...roleData,
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
    };
    mockRoles.push(newRole);
    return Promise.resolve(newRole);
  }
  const response = await api.post('/api/roles', roleData);
  return response.data;
};

// Assign a role to a user
export const assignRoleToUser = async (roleId: number, userId: number): Promise<void> => {
  if (config.app.isMock) {
    console.log(`Assigning role ${roleId} to user ${userId}`);
    return Promise.resolve();
  }
  await api.post(`/api/roles/${roleId}/assign/user/${userId}`);
};