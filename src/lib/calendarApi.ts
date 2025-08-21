import axios from 'axios';
import { config } from './config';
import { PaginatedCalendarsResponse, WorkflowCalendarDto, WorkflowCalendarDayDto, CreateCalendarDto } from '@/types/calendar';
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

// Create a new calendar with its days
export const createCalendarWithDays = async (
  calendarData: CreateCalendarDto
): Promise<WorkflowCalendarDto> => {
  if (config.app.isMock) {
    const newCalendar: WorkflowCalendarDto = {
      calendarId: mockCalendars.length + 1,
      calendarName: calendarData.calendarName,
      description: calendarData.description,
      startDate: calendarData.startDate,
      endDate: calendarData.endDate,
      recurrence: calendarData.recurrence,
      createdBy: calendarData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      calendarDays: calendarData.calendarDays.map((day, index) => ({
        ...day,
        calendarDayId: index + 1,
      })),
    };
    mockCalendars.push(newCalendar);
    return Promise.resolve(newCalendar);
  }
  const response = await api.post('/api/calendar/with-days', calendarData);
  return response.data;
};

// Get all days for a calendar
export const getCalendarDays = async (calendarId: number): Promise<WorkflowCalendarDayDto[]> => {
  if (config.app.isMock) {
    const calendar = mockCalendars.find((c) => c.calendarId === calendarId);
    return Promise.resolve(calendar?.calendarDays || []);
  }
  const response = await api.get(`/api/calendars/${calendarId}/days`);
  return response.data;
};

// Add multiple days to a calendar in batch
export const addCalendarDaysBatch = async (
  calendarId: number,
  daysData: Omit<WorkflowCalendarDayDto, 'calendarDayId'>[]
): Promise<WorkflowCalendarDayDto[]> => {
  if (config.app.isMock) {
    const calendar = mockCalendars.find((c) => c.calendarId === calendarId);
    if (calendar) {
      const newDays = daysData.map((day, index) => ({
        ...day,
        calendarDayId: (calendar.calendarDays?.length || 0) + index + 1,
      }));
      if (!calendar.calendarDays) calendar.calendarDays = [];
      calendar.calendarDays.push(...newDays);
      return Promise.resolve(newDays);
    }
    return Promise.reject(new Error('Calendar not found'));
  }
  const response = await api.post(`/api/calendars/${calendarId}/days/batch`, daysData);
  return response.data;
};

// Check if a specific date is valid for workflow execution
export const validateCalendarDate = async (calendarId: number, date: string): Promise<boolean> => {
  if (config.app.isMock) {
    const calendar = mockCalendars.find((c) => c.calendarId === calendarId);
    if (!calendar) return Promise.resolve(false);
    const day = calendar.calendarDays.find(d => d.dayDate === date);
    return Promise.resolve(!day || (day.dayType !== 'HOLIDAY' && day.dayType !== 'WEEKEND'));
  }
  const response = await api.get(`/api/calendar/${calendarId}/can-execute`, { params: { date } });
  return response.data;
};

// Get the next valid date for workflow execution
export const getNextValidDate = async (calendarId: number, fromDate: string): Promise<string> => {
    if (config.app.isMock) {
        const calendar = mockCalendars.find((c) => c.calendarId === calendarId);
        if (!calendar) return Promise.reject(new Error('Calendar not found'));

        const sortedDays = [...calendar.calendarDays].sort((a, b) => new Date(a.dayDate).getTime() - new Date(b.dayDate).getTime());
        const from = new Date(fromDate);

        for (const day of sortedDays) {
            const dayDate = new Date(day.dayDate);
            if (dayDate > from && day.dayType !== 'HOLIDAY' && day.dayType !== 'WEEKEND') {
                return Promise.resolve(day.dayDate);
            }
        }
        return Promise.reject(new Error('No valid date found'));
    }
    const response = await api.get(`/api/calendar/${calendarId}/next-valid-date`, { params: { fromDate } });
    return response.data;
};

// Get all valid dates within a date range
export const getValidDatesRange = async (calendarId: number, startDate: string, endDate: string): Promise<string[]> => {
    if (config.app.isMock) {
        const calendar = mockCalendars.find((c) => c.calendarId === calendarId);
        if (!calendar) return Promise.resolve([]);

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const validDates = calendar.calendarDays
            .filter(day => {
                const dayDate = new Date(day.dayDate);
                return dayDate >= start && dayDate <= end && day.dayType !== 'HOLIDAY' && day.dayType !== 'WEEKEND';
            })
            .map(day => day.dayDate);
        
        return Promise.resolve(validDates);
    }
    const response = await api.get(`/api/calendar/${calendarId}/valid-dates`, { params: { startDate, endDate } });
    return response.data;
};