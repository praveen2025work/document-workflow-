import { api } from './api';
import { UserDashboard } from '@/types/dashboard';

export const getUserDashboard = async (userId: number): Promise<UserDashboard> => {
  const response = await api.get('/dashboard/user', { params: { userId } });
  return response.data;
};