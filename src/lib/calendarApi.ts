import { api } from './api';
import { Calendar, CalendarApiResponse, NewCalendarWithDays, CalendarDay } from '@/types/calendar';

export const getCalendars = async (params: { page: number; size: number; recurrence?: string }): Promise<CalendarApiResponse> => {
  const response = await api.get('/calendars', { params });
  return response.data;
};

export const createCalendarWithDays = async (calendarData: NewCalendarWithDays): Promise<Calendar> => {
  const response = await api.post('/calendar/with-days', calendarData);
  return response.data;
};

export const getCalendarDays = async (calendarId: number): Promise<CalendarDay[]> => {
  const response = await api.get(`/calendars/${calendarId}/days`);
  return response.data;
};

export const addCalendarDay = async (calendarId: number, dayData: Omit<CalendarDay, 'calendarDayId' | 'calendarId'>): Promise<CalendarDay> => {
  const response = await api.post(`/calendars/${calendarId}/days`, dayData);
  return response.data;
};

export const addCalendarDaysBatch = async (calendarId: number, daysData: Omit<CalendarDay, 'calendarDayId' | 'calendarId'>[]): Promise<CalendarDay[]> => {
  const response = await api.post(`/calendars/${calendarId}/days/batch`, daysData);
  return response.data;
};

export const validateDate = async (calendarId: number, date: string): Promise<boolean> => {
  const response = await api.get(`/calendars/${calendarId}/validate-date`, { params: { date } });
  return response.data;
};

export const canExecuteWorkflow = async (calendarId: number, date: string): Promise<boolean> => {
  const response = await api.get(`/calendars/${calendarId}/can-execute`, { params: { date } });
  return response.data;
};