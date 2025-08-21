import axios from 'axios';
import { config } from './config';
import { PaginatedUsersResponse, WorkflowUserDto } from '@/types/user';

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
  const response = await api.get('/api/users/search', { params });
  return response.data;
};

// Get a single user by ID
export const getUserById = async (userId: number): Promise<WorkflowUserDto> => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

// Create a new user
export const createUser = async (
  userData: Omit<WorkflowUserDto, 'userId' | 'createdOn' | 'updatedOn'>
): Promise<WorkflowUserDto> => {
  const response = await api.post('/api/users', userData);
  return response.data;
};

// Update an existing user
export const updateUser = async (
  userId: number,
  userData: Partial<Omit<WorkflowUserDto, 'userId' | 'createdBy' | 'createdOn' | 'isActive'>>
): Promise<WorkflowUserDto> => {
  const response = await api.put(`/api/users/${userId}`, userData);
  return response.data;
};

// Toggle user status
export const toggleUserStatus = async (
  userId: number,
  isActive: 'Y' | 'N'
): Promise<WorkflowUserDto> => {
  const response = await api.patch(`/api/users/${userId}/status?isActive=${isActive}`);
  return response.data;
};