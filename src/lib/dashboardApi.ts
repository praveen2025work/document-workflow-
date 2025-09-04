import { api } from './api';
import { UserDashboard, AssignableTask } from '@/types/dashboard';
import { mockUserDashboard, mockAssignableTasks } from './mock/dashboard';
import { config } from './config';

export const getUserDashboard = async (userId: number): Promise<UserDashboard> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Using mock dashboard data for environment:', config.app.env);
    return Promise.resolve(mockUserDashboard);
  }
  
  const response = await api.get('/dashboard/user', { params: { userId } });
  return response.data;
};

export const getAssignableTasks = async (userId: number): Promise<AssignableTask[]> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Using mock assignable tasks data for environment:', config.app.env);
    return Promise.resolve(mockAssignableTasks);
  }
  
  const response = await api.get('/dashboard/tasks', { params: { userId } });
  return response.data;
};

export const assignTask = async (instanceTaskId: number, userId: number): Promise<void> => {
  // Mock assignment for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log(`Mock: Assigning task ${instanceTaskId} to user ${userId} in environment:`, config.app.env);
    return Promise.resolve();
  }
  
  await api.post(`/dashboard/tasks/${instanceTaskId}/assign`, { userId });
};