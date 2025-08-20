import axios from 'axios';
import { config } from './config';
import { PaginatedRolesResponse, WorkflowRoleDto } from '@/types/role';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Fetch all roles with pagination and filtering
export const getRoles = async (
  params: {
    page?: number;
    size?: number;
    roleName?: string;
    isActive?: 'Y' | 'N';
  } = {}
): Promise<PaginatedRolesResponse> => {
  const response = await api.get('/api/roles', { params });
  return response.data;
};

// Search roles with multiple criteria
export const searchRoles = async (
  params: {
    page?: number;
    size?: number;
    roleName?: string;
    isActive?: 'Y' | 'N';
    workflowId?: number;
    userId?: number;
  } = {}
): Promise<PaginatedRolesResponse> => {
  const response = await api.get('/api/roles/search', { params });
  return response.data;
};

// Get a single role by ID
export const getRoleById = async (roleId: number): Promise<WorkflowRoleDto> => {
  const response = await api.get(`/api/roles/${roleId}`);
  return response.data;
};

// Create a new role
export const createRole = async (
  roleData: Omit<WorkflowRoleDto, 'roleId' | 'createdOn' | 'updatedOn'>
): Promise<WorkflowRoleDto> => {
  const response = await api.post('/api/roles', roleData);
  return response.data;
};

// Update an existing role
export const updateRole = async (
  roleId: number,
  roleData: Partial<Omit<WorkflowRoleDto, 'roleId' | 'createdBy' | 'createdOn'>>
): Promise<WorkflowRoleDto> => {
  const response = await api.put(`/api/roles/${roleId}`, roleData);
  return response.data;
};

// Delete a role
export const deleteRole = async (roleId: number): Promise<void> => {
  await api.delete(`/api/roles/${roleId}`);
};

// Toggle role status
export const toggleRoleStatus = async (
  roleId: number,
  isActive: 'Y' | 'N'
): Promise<WorkflowRoleDto> => {
  const response = await api.patch(`/api/roles/${roleId}/status`, null, {
    params: { isActive },
  });
  return response.data;
};

// Assign a role to a user
export const assignRoleToUser = async (roleId: number, userId: number): Promise<void> => {
  await api.post(`/api/roles/${roleId}/assign/user/${userId}`);
};

// Unassign a role from a user
export const unassignRoleFromUser = async (roleId: number, userId: number): Promise<void> => {
  await api.delete(`/api/roles/${roleId}/unassign/user/${userId}`);
};

// Check if a role name is available
export const checkRoleNameAvailability = async (roleName: string): Promise<boolean> => {
  const response = await api.get(`/api/roles/check/name/${roleName}`);
  return response.data;
};