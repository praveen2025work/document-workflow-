import { api } from './api';
import { config } from './config';
import {
  UserGroup,
  UserGroupMember,
  UserGroupApiResponse,
  mockUserGroups,
  mockUserGroupMembers,
  mockPaginatedUserGroups,
  mockUserGroupStats,
} from './mock/userGroups';

export const getUserGroups = async (params?: { page?: number; size?: number; isActive?: 'Y' | 'N' }): Promise<UserGroupApiResponse> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Using mock user groups data for environment:', config.app.env);
    // Filter by isActive if provided
    let filteredGroups = mockUserGroups;
    if (params?.isActive) {
      filteredGroups = mockUserGroups.filter(group => group.isActive === params.isActive);
    }
    return Promise.resolve({
      content: filteredGroups,
      totalElements: filteredGroups.length,
      totalPages: 1,
      size: params?.size || 10,
      number: params?.page || 0,
    });
  }
  
  const response = await api.get('/user-groups', { params });
  return response.data;
};

export const searchUserGroups = async (criteria: { groupName?: string; description?: string; page?: number; size?: number }): Promise<UserGroupApiResponse> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Using mock user groups search data for environment:', config.app.env);
    // Simple search implementation for mock data
    let filteredGroups = mockUserGroups;
    if (criteria.groupName) {
      filteredGroups = filteredGroups.filter(group => 
        group.groupName.toLowerCase().includes(criteria.groupName!.toLowerCase())
      );
    }
    if (criteria.description) {
      filteredGroups = filteredGroups.filter(group => 
        group.description.toLowerCase().includes(criteria.description!.toLowerCase())
      );
    }
    return Promise.resolve({
      content: filteredGroups,
      totalElements: filteredGroups.length,
      totalPages: 1,
      size: 10,
      number: 0,
    });
  }
  
  const response = await api.get('/user-groups/search', { params: criteria });
  return response.data;
};

export const createUserGroup = async (group: {
  groupName: string;
  description: string;
  isActive: 'Y' | 'N';
  createdBy: string;
}): Promise<UserGroup> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Mock: Creating user group in environment:', config.app.env);
    const newGroup: UserGroup = {
      groupId: Math.max(...mockUserGroups.map(g => g.groupId)) + 1,
      groupName: group.groupName,
      description: group.description,
      isActive: group.isActive,
      createdBy: group.createdBy,
      createdOn: new Date().toISOString(),
      updatedBy: null,
      updatedOn: null,
      memberCount: 0,
      roles: [],
    };
    return Promise.resolve(newGroup);
  }
  
  const response = await api.post('/user-groups', group);
  return response.data;
};

export const getUserGroupById = async (groupId: number): Promise<UserGroup> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Using mock user group by ID data for environment:', config.app.env);
    const group = mockUserGroups.find(g => g.groupId === groupId);
    if (!group) {
      throw new Error(`User group with ID ${groupId} not found`);
    }
    return Promise.resolve(group);
  }
  
  const response = await api.get(`/user-groups/${groupId}`);
  return response.data;
};

export const updateUserGroup = async (groupId: number, group: {
  groupName: string;
  description: string;
  isActive: 'Y' | 'N';
  updatedBy: string;
}): Promise<UserGroup> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Mock: Updating user group in environment:', config.app.env);
    const existingGroup = mockUserGroups.find(g => g.groupId === groupId);
    if (!existingGroup) {
      throw new Error(`User group with ID ${groupId} not found`);
    }
    const updatedGroup: UserGroup = {
      ...existingGroup,
      ...group,
      updatedOn: new Date().toISOString(),
    };
    return Promise.resolve(updatedGroup);
  }
  
  const response = await api.put(`/user-groups/${groupId}`, group);
  return response.data;
};

export const deleteUserGroup = async (groupId: number): Promise<void> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Deleting user group ${groupId} in environment:`, config.app.env);
    return Promise.resolve();
  }
  
  await api.delete(`/user-groups/${groupId}`);
};

export const getUserGroupMembers = async (groupId: number): Promise<UserGroupMember[]> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Using mock user group members data for environment:', config.app.env);
    const members = mockUserGroupMembers.filter(member => member.groupId === groupId);
    return Promise.resolve(members);
  }
  
  const response = await api.get(`/user-groups/${groupId}/members`);
  return response.data;
};

export const addUserToGroup = async (groupId: number, userId: number): Promise<UserGroupMember> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Adding user ${userId} to group ${groupId} in environment:`, config.app.env);
    const newMember: UserGroupMember = {
      membershipId: Math.max(...mockUserGroupMembers.map(m => m.membershipId)) + 1,
      groupId,
      userId,
      username: `user${userId}`,
      firstName: 'Mock',
      lastName: 'User',
      email: `user${userId}@company.com`,
      joinedOn: new Date().toISOString(),
      isActive: 'Y',
    };
    return Promise.resolve(newMember);
  }
  
  const response = await api.post(`/user-groups/${groupId}/members`, { userId });
  return response.data;
};

export const removeUserFromGroup = async (groupId: number, userId: number): Promise<void> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log(`Mock: Removing user ${userId} from group ${groupId} in environment:`, config.app.env);
    return Promise.resolve();
  }
  
  await api.delete(`/user-groups/${groupId}/members/${userId}`);
};

export const getUserGroupStats = async (): Promise<typeof mockUserGroupStats> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Using mock user group stats data for environment:', config.app.env);
    return Promise.resolve(mockUserGroupStats);
  }
  
  const response = await api.get('/user-groups/stats');
  return response.data;
};