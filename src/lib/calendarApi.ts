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
    recurrence?: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  } = {}
): Promise<PaginatedCalendarsResponse> => {
  const response = await api.get('/api/calendars', { params });
  return response.data;
};

// Create a new calendar
export const createCalendar = async (
  calendarData: Omit<WorkflowCalendarDto, 'calendarId' | 'createdAt' | 'updatedAt' | 'calendarDays'>
): Promise<WorkflowCalendarDto> => {
  const response = await api.post('/api/calendars', calendarData);
  return response.data;
};

// Get all days for a calendar
export const getCalendarDays = async (calendarId: number): Promise<WorkflowCalendarDayDto[]> => {
  const response = await api.get(`/api/calendars/${calendarId}/days`);
  return response.data;
};

// Add a single day to a calendar
export const addCalendarDay = async (
  calendarId: number,
  dayData: Omit<WorkflowCalendarDayDto, 'calendarDayId'>
): Promise<WorkflowCalendarDayDto> => {
  const response = await api.post(`/api/calendars/${calendarId}/days`, dayData);
  return response.data;
};