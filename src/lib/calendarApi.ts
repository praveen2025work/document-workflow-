import axios from 'axios';
import { config } from './config';
import { PaginatedCalendarsResponse, WorkflowCalendarDto, WorkflowCalendarDayDto } from '@/types/calendar';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Fetch all calendars with pagination and filtering
export const getCalendars = async (
  params: {
    page?: number;
    size?: number;
    calendarName?: string;
    recurrence?: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  } = {}
): Promise<PaginatedCalendarsResponse> => {
  const response = await api.get('/api/calendar', { params });
  return response.data;
};

// Search calendars with multiple criteria
export const searchCalendars = async (
  params: {
    page?: number;
    size?: number;
    calendarName?: string;
    description?: string;
    recurrence?: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
    createdBy?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<PaginatedCalendarsResponse> => {
  const response = await api.get('/api/calendar/search', { params });
  return response.data;
};

// Get a single calendar by ID
export const getCalendarById = async (calendarId: number): Promise<WorkflowCalendarDto> => {
  const response = await api.get(`/api/calendar/${calendarId}`);
  return response.data;
};

// Create a new calendar
export const createCalendar = async (
  calendarData: Omit<WorkflowCalendarDto, 'calendarId' | 'createdAt' | 'updatedAt' | 'calendarDays'>
): Promise<WorkflowCalendarDto> => {
  const response = await api.post('/api/calendar', calendarData);
  return response.data;
};

// Update an existing calendar
export const updateCalendar = async (
  calendarId: number,
  calendarData: Partial<Omit<WorkflowCalendarDto, 'calendarId' | 'createdBy' | 'createdAt' | 'calendarDays'>>
): Promise<WorkflowCalendarDto> => {
  const response = await api.put(`/api/calendar/${calendarId}`, calendarData);
  return response.data;
};

// Delete a calendar
export const deleteCalendar = async (calendarId: number): Promise<void> => {
  await api.delete(`/api/calendar/${calendarId}`);
};

// Add a single day to a calendar
export const addCalendarDay = async (
  calendarId: number,
  dayData: Omit<WorkflowCalendarDayDto, 'calendarDayId'>
): Promise<WorkflowCalendarDayDto> => {
  const response = await api.post(`/api/calendar/${calendarId}/days`, dayData);
  return response.data;
};

// Add multiple days to a calendar in batch
export const addCalendarDaysBatch = async (
  calendarId: number,
  daysData: Omit<WorkflowCalendarDayDto, 'calendarDayId'>[]
): Promise<WorkflowCalendarDayDto[]> => {
  const response = await api.post(`/api/calendar/${calendarId}/days/batch`, daysData);
  return response.data;
};

// Get all days for a calendar
export const getCalendarDays = async (calendarId: number): Promise<WorkflowCalendarDayDto[]> => {
  const response = await api.get(`/api/calendar/${calendarId}/days`);
  return response.data;
};

// Update a calendar day
export const updateCalendarDay = async (
  dayId: number,
  dayData: Partial<Omit<WorkflowCalendarDayDto, 'calendarDayId'>>
): Promise<WorkflowCalendarDayDto> => {
  const response = await api.put(`/api/calendar/days/${dayId}`, dayData);
  return response.data;
};

// Delete a calendar day
export const deleteCalendarDay = async (dayId: number): Promise<void> => {
  await api.delete(`/api/calendar/days/${dayId}`);
};