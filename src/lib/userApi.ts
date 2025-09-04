import { api } from './api';
import { User, UserApiResponse, NewUser, UpdateUser, UserSearchCriteria } from '@/types/user';

export const getUsers = async (params: { page: number; size: number; isActive: 'Y' | 'N' }): Promise<UserApiResponse> => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const searchUsers = async (criteria: UserSearchCriteria): Promise<UserApiResponse> => {
  const response = await api.get('/users/search', { params: criteria });
  return response.data;
};

export const createUser = async (user: NewUser): Promise<User> => {
  const response = await api.post('/users', user);
  return response.data;
};

export const getUserById = async (userId: number): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId: number, user: UpdateUser): Promise<User> => {
  const response = await api.put(`/users/${userId}`, user);
  return response.data;
};

export const toggleUserStatus = async (userId: number, isActive: 'Y' | 'N'): Promise<void> => {
  await api.patch(`/users/${userId}/status`, null, { params: { isActive } });
};