import { api } from './api';
import { Calendar, CalendarApiResponse, NewCalendarWithDays, CalendarDay } from '@/types/calendar';
import { mockCalendars, mockCalendarDays } from './mock/calendars';
import { config } from './config';

export const getCalendars = async (params?: { page?: number; size?: number; recurrence?: string }): Promise<CalendarApiResponse> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  const shouldUseMock = config.app.isMock || config.isPreview || !config.app.env || 
                       config.app.env === 'local' || config.app.env === 'mock' ||
                       config.isDevelopment;
  
  if (shouldUseMock) {
    console.log('Using mock calendars data for environment:', config.app.env);
    // Filter by recurrence if provided
    let filteredCalendars = mockCalendars;
    if (params?.recurrence) {
      filteredCalendars = mockCalendars.filter(calendar => calendar.recurrence === params.recurrence);
    }
    return Promise.resolve({
      content: filteredCalendars,
      totalElements: filteredCalendars.length,
      totalPages: 1,
      size: params?.size || 10,
      number: params?.page || 0,
    });
  }
  
  const response = await api.get('/calendars', { params });
  return response.data;
};

export const createCalendarWithDays = async (calendarData: NewCalendarWithDays): Promise<Calendar> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Mock: Creating calendar with days in environment:', config.app.env);
    const newCalendarId = (mockCalendars.length > 0 ? Math.max(...mockCalendars.map(c => c.calendarId)) : 0) + 1;
    const newCalendar: Calendar = {
      calendarId: newCalendarId,
      calendarName: calendarData.calendarName,
      description: calendarData.description,
      recurrence: calendarData.recurrence,
      isActive: 'Y',
      createdBy: calendarData.createdBy,
      createdAt: new Date().toISOString(),
      updatedBy: calendarData.createdBy,
      updatedAt: new Date().toISOString(),
      startDate: calendarData.startDate,
      endDate: calendarData.endDate,
    };
    mockCalendars.push(newCalendar);

    const newDays = calendarData.calendarDays.map((day, index) => ({
      ...day,
      calendarDayId: (mockCalendarDays.length > 0 ? Math.max(...mockCalendarDays.map(d => d.calendarDayId)) : 0) + index + 1,
      calendarId: newCalendarId,
    }));
    mockCalendarDays.push(...newDays);

    return Promise.resolve(newCalendar);
  }
  
  const response = await api.post('/calendar/with-days', calendarData);
  return response.data;
};

export const getCalendarDays = async (calendarId: number): Promise<CalendarDay[]> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Using mock calendar days data for environment:', config.app.env);
    const days = mockCalendarDays.filter(day => day.calendarId === calendarId);
    return Promise.resolve(days);
  }
  
  const response = await api.get(`/calendars/${calendarId}/days`);
  return response.data;
};

export const addCalendarDay = async (calendarId: number, dayData: Omit<CalendarDay, 'calendarDayId' | 'calendarId'>): Promise<CalendarDay> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Mock: Adding calendar day in environment:', config.app.env);
    const newDay: CalendarDay = {
      calendarDayId: Math.max(...mockCalendarDays.map(d => d.calendarDayId)) + 1,
      calendarId,
      ...dayData,
    };
    return Promise.resolve(newDay);
  }
  
  const response = await api.post(`/calendars/${calendarId}/days`, dayData);
  return response.data;
};

export const addCalendarDaysBatch = async (calendarId: number, daysData: Omit<CalendarDay, 'calendarDayId' | 'calendarId'>[]): Promise<CalendarDay[]> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Mock: Adding calendar days batch in environment:', config.app.env);
    const newDays: CalendarDay[] = daysData.map((dayData, index) => ({
      calendarDayId: Math.max(...mockCalendarDays.map(d => d.calendarDayId)) + index + 1,
      calendarId,
      ...dayData,
    }));
    return Promise.resolve(newDays);
  }
  
  const response = await api.post(`/calendars/${calendarId}/days/batch`, daysData);
  return response.data;
};

export const validateDate = async (calendarId: number, date: string): Promise<boolean> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Mock: Validating date in environment:', config.app.env);
    // Simple mock validation - assume all dates are valid
    return Promise.resolve(true);
  }
  
  const response = await api.get(`/calendars/${calendarId}/validate-date`, { params: { date } });
  return response.data;
};

export const canExecuteWorkflow = async (calendarId: number, date: string): Promise<boolean> => {
  // Use mock data for preview/mock environments or when not in dev/prod
  if (config.app.isMock || !config.app.env || config.app.env === 'local' || config.app.env === 'mock') {
    console.log('Mock: Checking if workflow can execute in environment:', config.app.env);
    // Simple mock check - assume workflow can execute
    return Promise.resolve(true);
  }
  
  const response = await api.get(`/calendars/${calendarId}/can-execute`, { params: { date } });
  return response.data;
};