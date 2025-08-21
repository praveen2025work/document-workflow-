import axios from 'axios';
import { config } from './config';
import { PaginatedCalendarsResponse, WorkflowCalendarDto, WorkflowCalendarDayDto } from '@/types/calendar';
import { mockPaginatedCalendars, mockCalendars } from './mock/calendars';

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
  if (config.app.isMock) {
    return Promise.resolve(mockPaginatedCalendars);
  }
  const response = await api.get('/api/calendars', { params });
  return response.data;
};

// Create a new calendar
export const createCalendar = async (
  calendarData: Omit<WorkflowCalendarDto, 'id' | 'createdAt' | 'updatedAt' | 'calendarDays'>
): Promise<WorkflowCalendarDto> => {
  if (config.app.isMock) {
    const newCalendar: WorkflowCalendarDto = {
      id: String(mockCalendars.length + 1),
      ...calendarData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      calendarDays: [],
    };
    mockCalendars.push(newCalendar);
    return Promise.resolve(newCalendar);
  }
  const response = await api.post('/api/calendars', calendarData);
  return response.data;
};

// Get all days for a calendar
export const getCalendarDays = async (calendarId: string): Promise<WorkflowCalendarDayDto[]> => {
  if (config.app.isMock) {
    const calendar = mockCalendars.find((c) => c.id === calendarId);
    return Promise.resolve(calendar?.calendarDays || []);
  }
  const response = await api.get(`/api/calendars/${calendarId}/days`);
  return response.data;
};

// Add a single day to a calendar
export const addCalendarDay = async (
  calendarId: string,
  dayData: Omit<WorkflowCalendarDayDto, 'id'>
): Promise<WorkflowCalendarDayDto> => {
  if (config.app.isMock) {
    const calendar = mockCalendars.find((c) => c.id === calendarId);
    if (calendar) {
      const newDay: WorkflowCalendarDayDto = {
        id: String(calendar.calendarDays?.length + 1),
        ...dayData,
      };
      calendar.calendarDays?.push(newDay);
      return Promise.resolve(newDay);
    }
    return Promise.reject('Calendar not found');
  }
  const response = await api.post(`/api/calendars/${calendarId}/days`, dayData);
  return response.data;
};