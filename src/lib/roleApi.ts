import { api } from './api';
import { Role, RoleApiResponse, NewRole } from '@/types/role';

export const getRoles = async (params: { page: number; size: number; isActive: 'Y' | 'N' }): Promise<RoleApiResponse> => {
  const response = await api.get('/roles', { params });
  return response.data;
};

export const createRole = async (role: NewRole): Promise<Role> => {
  const response = await api.post('/roles', role);
  return response.data;
};

export const getRoleById = async (roleId: number): Promise<Role> => {
  const response = await api.get(`/roles/${roleId}`);
  return response.data;
};

export const assignRoleToUser = async (roleId: number, userId: number): Promise<void> => {
  await api.post(`/roles/${roleId}/assign/user/${userId}`);
};