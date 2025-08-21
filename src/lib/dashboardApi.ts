import axios from 'axios';
import { config } from './config';
import {
  UserDashboardData,
  AdminDashboardData,
  UserWorkload,
  UserNotification,
} from '@/types/dashboard';
import {
  mockUserDashboardData,
  mockAdminDashboardData,
  mockUserWorkload,
  mockUserNotifications,
} from './mock/dashboard';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Get user dashboard data
export const getUserDashboard = async (userId: number): Promise<UserDashboardData> => {
  if (config.app.isMock) {
    return Promise.resolve(mockUserDashboardData);
  }
  const response = await api.get('/api/dashboard/user', {
    params: { userId },
  });
  return response.data;
};

// Get admin dashboard data
export const getAdminDashboard = async (adminId: number): Promise<AdminDashboardData> => {
  if (config.app.isMock) {
    return Promise.resolve(mockAdminDashboardData);
  }
  const response = await api.get('/api/dashboard/admin', {
    params: { adminId },
  });
  return response.data;
};

// Get user workload summary
export const getUserWorkload = async (userId: number): Promise<UserWorkload> => {
  if (config.app.isMock) {
    return Promise.resolve(mockUserWorkload);
  }
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
  if (config.app.isMock) {
    const filteredNotifications = mockUserNotifications.filter((n) => n.status === status);
    return Promise.resolve(filteredNotifications);
  }
  const response = await api.get('/api/dashboard/notifications', {
    params: { userId, status },
  });
  return response.data;
};