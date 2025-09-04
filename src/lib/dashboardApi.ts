import { api } from './api';
import { UserDashboard, AssignableTask } from '@/types/dashboard';
import { mockUserDashboard, mockAssignableTasks } from './mock/dashboard';

export const getUserDashboard = async (userId: number): Promise<UserDashboard> => {
  // Use mock data in development
  if (process.env.NEXT_PUBLIC_CO_DEV_ENV === 'development') {
    return Promise.resolve(mockUserDashboard);
  }
  
  const response = await api.get('/dashboard/user', { params: { userId } });
  return response.data;
};

export const getAssignableTasks = async (userId: number): Promise<AssignableTask[]> => {
  // Use mock data in development
  if (process.env.NEXT_PUBLIC_CO_DEV_ENV === 'development') {
    return Promise.resolve(mockAssignableTasks);
  }
  
  const response = await api.get('/dashboard/tasks', { params: { userId } });
  return response.data;
};

export const assignTask = async (instanceTaskId: number, userId: number): Promise<void> => {
  // Mock assignment in development
  if (process.env.NEXT_PUBLIC_CO_DEV_ENV === 'development') {
    console.log(`Mock: Assigning task ${instanceTaskId} to user ${userId}`);
    return Promise.resolve();
  }
  
  await api.post(`/dashboard/tasks/${instanceTaskId}/assign`, { userId });
};