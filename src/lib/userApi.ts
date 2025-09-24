import api from './api';
import { User, UserApiResponse, NewUser, UpdateUser, UserSearchCriteria } from '@/types/user';
import { mockUsers, mockPaginatedUsers } from './mock/users';
import { config } from './config';

export const getUsers = async (params?: { page?: number; size?: number; isActive?: 'Y' | 'N' }): Promise<UserApiResponse> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock users data for environment:', config.app.env);
    // Filter by isActive if provided
    let filteredUsers = mockUsers;
    if (params?.isActive) {
      filteredUsers = mockUsers.filter(user => user.isActive === params.isActive);
    }
    return Promise.resolve({
      content: filteredUsers,
      totalElements: filteredUsers.length,
      totalPages: 1,
      size: params?.size || 10,
      number: params?.page || 0,
    });
  }
  
  const response = await api.get('/users', { params });
  return response.data;
};

export const searchUsers = async (criteria: UserSearchCriteria): Promise<UserApiResponse> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock users search data for environment:', config.app.env);
    // Simple search implementation for mock data
    let filteredUsers = mockUsers;
    if (criteria.username) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(criteria.username!.toLowerCase())
      );
    }
    if (criteria.firstName) {
      filteredUsers = filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(criteria.firstName!.toLowerCase())
      );
    }
    if (criteria.email) {
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(criteria.email!.toLowerCase())
      );
    }
    return Promise.resolve({
      content: filteredUsers,
      totalElements: filteredUsers.length,
      totalPages: 1,
      size: 10,
      number: 0,
    });
  }
  
  const response = await api.get('/users/search', { params: criteria });
  return response.data;
};

export const createUser = async (user: NewUser): Promise<User> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Creating user in environment:', config.app.env);
    const newUser: User = {
      userId: Math.max(...mockUsers.map(u => u.userId)) + 1,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      createdBy: user.createdBy,
      createdOn: new Date().toISOString(),
    };
    return Promise.resolve(newUser);
  }
  
  const response = await api.post('/users', user);
  return response.data;
};

export const getUserById = async (userId: number): Promise<User> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock user by ID data for environment:', config.app.env);
    const user = mockUsers.find(u => u.userId === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return Promise.resolve(user);
  }
  
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId: number, user: UpdateUser): Promise<User> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mock: Updating user in environment:', config.app.env);
    const existingUser = mockUsers.find(u => u.userId === userId);
    if (!existingUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const updatedUser: User = {
      ...existingUser,
      ...user,
    };
    return Promise.resolve(updatedUser);
  }
  
  const response = await api.put(`/users/${userId}`, user);
  return response.data;
};

export const toggleUserStatus = async (userId: number, isActive: 'Y' | 'N'): Promise<void> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log(`Mock: Toggling user ${userId} status to ${isActive} in environment:`, config.app.env);
    return Promise.resolve();
  }
  
  await api.patch(`/users/${userId}/status`, null, { params: { isActive } });
};