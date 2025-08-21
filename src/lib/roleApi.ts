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
    isActive?: 'Y' | 'N';
  } = {}
): Promise<PaginatedRolesResponse> => {
  const response = await api.get('/api/roles', { params });
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

// Assign a role to a user
export const assignRoleToUser = async (roleId: number, userId: number): Promise<void> => {
  await api.post(`/api/roles/${roleId}/assign/user/${userId}`);
};