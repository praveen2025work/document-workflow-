import axios from 'axios';
import { config } from './config';
import {
  UserDashboardData,
  AdminDashboardData,
  UserWorkload,
  UserNotification,
} from '@/types/dashboard';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Get user dashboard data
export const getUserDashboard = async (userId: number): Promise<UserDashboardData> => {
  const response = await api.get('/api/dashboard/user', {
    params: { userId },
  });
  return response.data;
};

// Get admin dashboard data
export const getAdminDashboard = async (adminId: number): Promise<AdminDashboardData> => {
  const response = await api.get('/api/dashboard/admin', {
    params: { adminId },
  });
  return response.data;
};

// Get user workload summary
export const getUserWorkload = async (userId: number): Promise<UserWorkload> => {
  const response = await api.get('/api/dashboard/workload', {
    params: { userId },
  });
  return response.data;
};

// Get user notifications
export const getUserNotifications = async (
  userId: number,
  status: 'UNREAD' | 'READ'
): Promise<UserNotification[]> => {
  const response = await api.get('/api/dashboard/notifications', {
    params: { userId, status },
  });
  return response.data;
};