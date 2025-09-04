import { api } from './api';
import { Role, RoleApiResponse, NewRole } from '@/types/role';
import { mockRoles } from './mock/roles';
import { config } from './config';

export const getRoles = async (params?: { page?: number; size?: number; isActive?: 'Y' | 'N' }): Promise<RoleApiResponse> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Using mock roles data for environment:', config.app.env);
    // Filter by isActive if provided
    let filteredRoles = mockRoles;
    if (params?.isActive) {
      filteredRoles = mockRoles.filter(role => role.isActive === params.isActive);
    }
    return Promise.resolve({
      roles: filteredRoles,
      totalElements: filteredRoles.length,
      totalPages: 1,
      size: params?.size || 10,
      number: params?.page || 0,
    });
  }
  
  const response = await api.get('/roles', { params });
  return response.data;
};

export const createRole = async (role: NewRole): Promise<Role> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Mock: Creating role in environment:', config.app.env);
    const newRole: Role = {
      roleId: Math.max(...mockRoles.map(r => r.roleId)) + 1,
      roleName: role.roleName,
      description: role.description,
      isActive: 'Y',
      createdBy: 'mock@company.com',
      createdOn: new Date().toISOString(),
      updatedBy: 'mock@company.com',
      updatedOn: new Date().toISOString(),
    };
    return Promise.resolve(newRole);
  }
  
  const response = await api.post('/roles', role);
  return response.data;
};

export const getRoleById = async (roleId: number): Promise<Role> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Using mock role by ID data for environment:', config.app.env);
    const role = mockRoles.find(r => r.roleId === roleId);
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }
    return Promise.resolve(role);
  }
  
  const response = await api.get(`/roles/${roleId}`);
  return response.data;
};

export const assignRoleToUser = async (roleId: number, userId: number): Promise<void> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log(`Mock: Assigning role ${roleId} to user ${userId} in environment:`, config.app.env);
    return Promise.resolve();
  }
  
  await api.post(`/roles/${roleId}/assign/user/${userId}`);
};