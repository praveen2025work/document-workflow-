import { api } from './api';
import { UserDashboard, AssignableTask } from '@/types/dashboard';
import { mockUserDashboard, mockAssignableTasks } from './mock/dashboard';
import { config } from './config';

export const getUserDashboard = async (userId: number): Promise<UserDashboard> => {
  // Use mock data only for mock environment or when explicitly configured
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  console.log('Dashboard API - Environment check:', {
    isMock: config.app.isMock,
    isPreview: config.isPreview,
    env: config.app.env,
    isDevelopment: config.isDevelopment,
    shouldUseMock
  });
  
  if (shouldUseMock) {
    console.log('Using mock dashboard data for environment:', config.app.env);
    console.log('Mock dashboard data:', mockUserDashboard);
    return Promise.resolve(mockUserDashboard);
  }
  
  console.log('Making API call to fetch dashboard data for userId:', userId);
  const response = await api.get('/dashboard/user', { params: { userId } });
  return response.data;
};

export const getAssignableTasks = async (userId: number): Promise<AssignableTask[]> => {
  // Use mock data only for mock environment or when explicitly configured
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock assignable tasks data for environment:', config.app.env);
    return Promise.resolve(mockAssignableTasks);
  }
  
  const response = await api.get('/dashboard/tasks', { params: { userId } });
  return response.data;
};

export const assignTask = async (instanceTaskId: number, userId: number): Promise<void> => {
  // Use mock data only for mock environment or when explicitly configured
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log(`Mock: Assigning task ${instanceTaskId} to user ${userId} in environment:`, config.app.env);
    return Promise.resolve();
  }
  
  await api.post(`/dashboard/tasks/${instanceTaskId}/assign`, { userId });
};