import axios from 'axios';
import { config } from './config';
import { PaginatedUsersResponse, WorkflowUserDto } from '@/types/user';
import { mockPaginatedUsers, mockUsers } from './mock/users';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Fetch all users with pagination and filtering
export const getUsers = async (
  params: {
    page?: number;
    size?: number;
    isActive?: 'Y' | 'N';
  } = {}
): Promise<PaginatedUsersResponse> => {
  if (config.app.isMock) {
    return Promise.resolve(mockPaginatedUsers);
  }
  const response = await api.get('/api/users', { params });
  return response.data;
};

// Search users with multiple criteria
export const searchUsers = async (
  params: {
    page?: number;
    size?: number;
    username?: string;
    firstName?: string;
  } = {}
): Promise<PaginatedUsersResponse> => {
  if (config.app.isMock) {
    return Promise.resolve(mockPaginatedUsers);
  }
  const response = await api.get('/api/users/search', { params });
  return response.data;
};

// Get a single user by ID
export const getUserById = async (userId: number): Promise<WorkflowUserDto> => {
  if (config.app.isMock) {
    const user = mockUsers.find((u) => u.id === String(userId));
    if (user) {
      return Promise.resolve(user);
    } else {
      return Promise.reject(new Error('User not found'));
    }
  }
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

// Create a new user
export const createUser = async (
  userData: Omit<WorkflowUserDto, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WorkflowUserDto> => {
  if (config.app.isMock) {
    const newUser: WorkflowUserDto = {
      id: String(mockUsers.length + 1),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return Promise.resolve(newUser);
  }
  const response = await api.post('/api/users', userData);
  return response.data;
};

// Update an existing user
export const updateUser = async (
  userId: string,
  userData: Partial<Omit<WorkflowUserDto, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<WorkflowUserDto> => {
  if (config.app.isMock) {
    const userIndex = mockUsers.findIndex((u) => u.id === userId);
    if (userIndex > -1) {
      const updatedUser = { ...mockUsers[userIndex], ...userData, updatedAt: new Date().toISOString() };
      mockUsers[userIndex] = updatedUser;
      return Promise.resolve(updatedUser);
    } else {
      return Promise.reject(new Error('User not found'));
    }
  }
  const response = await api.put(`/api/users/${userId}`, userData);
  return response.data;
};

// Toggle user status
export const toggleUserStatus = async (
  userId: string,
  isActive: boolean
): Promise<WorkflowUserDto> => {
  if (config.app.isMock) {
    const userIndex = mockUsers.findIndex((u) => u.id === userId);
    if (userIndex > -1) {
      mockUsers[userIndex].isActive = isActive;
      mockUsers[userIndex].updatedAt = new Date().toISOString();
      return Promise.resolve(mockUsers[userIndex]);
    } else {
      return Promise.reject(new Error('User not found'));
    }
  }
  const response = await api.patch(`/api/users/${userId}/status?isActive=${isActive ? 'Y' : 'N'}`);
  return response.data;
};