import { api } from './api';
import {
  Calendar,
  CalendarApiResponse,
  NewCalendarWithDays,
  UpdateCalendarWithDays,
  CalendarDay,
  UpdateCalendarPayload,
  NewCalendarDayPayload,
  UpdateCalendarDayPayload,
} from '@/types/calendar';
import { mockCalendars, mockCalendarDays } from './mock/calendars';
import { config } from './config';

const shouldUseMock = () => config.app.isMock || config.isPreview || !config.app.env || ['local', 'mock', 'development'].includes(config.app.env);

// Calendar operations
export const searchCalendars = async (params: any): Promise<CalendarApiResponse> => {
  if (shouldUseMock()) {
    console.log('Using mock calendar data for searchCalendars');
    const page = params.page || 0;
    const size = params.size || 10;
    const filteredCalendars = mockCalendars.filter(c => {
      return (!params.calendarName || c.calendarName.toLowerCase().includes(params.calendarName.toLowerCase())) &&
             (!params.recurrence || c.recurrence === params.recurrence) &&
             (!params.region || c.region === params.region) &&
             (!params.isActive || c.isActive === params.isActive);
    });
    const paginatedCalendars = filteredCalendars.slice(page * size, (page + 1) * size);
    return Promise.resolve({
      content: paginatedCalendars,
      totalElements: filteredCalendars.length,
      totalPages: Math.ceil(filteredCalendars.length / size),
      size,
      number: page,
    });
  }
  const response = await api.get('/calendar/search', { params });
  return response.data;
};

export const getCalendarById = async (calendarId: number): Promise<Calendar> => {
  if (shouldUseMock()) {
    console.log(`Using mock calendar data for getCalendarById: ${calendarId}`);
    const calendar = mockCalendars.find(c => c.calendarId === calendarId);
    if (!calendar) throw new Error('Calendar not found');
    calendar.calendarDays = mockCalendarDays.filter(d => d.calendarId === calendarId);
    return Promise.resolve(calendar);
  }
  const response = await api.get(`/calendar/${calendarId}`);
  return response.data;
};

export const createCalendarWithDays = async (data: NewCalendarWithDays): Promise<Calendar> => {
  if (shouldUseMock()) {
    console.log('Using mock for createCalendarWithDays');
    const newId = Math.max(0, ...mockCalendars.map(c => c.calendarId)) + 1;
    const newCalendar: Calendar = {
      ...data,
      calendarId: newId,
      createdAt: new Date().toISOString(),
      calendarDays: [],
    };
    mockCalendars.push(newCalendar);

    let dayIdCounter = Math.max(0, ...mockCalendarDays.map(d => d.calendarDayId || 0));
    data.calendarDays.forEach(day => {
      const newDay: CalendarDay = {
        ...day,
        calendarDayId: ++dayIdCounter,
        calendarId: newId,
      };
      mockCalendarDays.push(newDay);
      newCalendar.calendarDays?.push(newDay);
    });
    return Promise.resolve(newCalendar);
  }
  const response = await api.post('/calendar/with-days', data);
  return response.data;
};

export const updateCalendar = async (calendarId: number, data: UpdateCalendarPayload): Promise<Calendar> => {
    if (shouldUseMock()) {
        console.log(`Mock: Updating calendar ${calendarId}`);
        const index = mockCalendars.findIndex(c => c.calendarId === calendarId);
        if (index === -1) throw new Error('Calendar not found');
        mockCalendars[index] = { ...mockCalendars[index], ...data, updatedAt: new Date().toISOString() };
        return Promise.resolve(mockCalendars[index]);
    }
    const response = await api.put(`/calendar/${calendarId}`, data);
    return response.data;
};

export const updateCalendarWithDays = async (calendarId: number, data: UpdateCalendarWithDays): Promise<Calendar> => {
  if (shouldUseMock()) {
    console.log(`Using mock for updateCalendarWithDays: ${calendarId}`);
    const calendarIndex = mockCalendars.findIndex(c => c.calendarId === calendarId);
    if (calendarIndex === -1) throw new Error('Calendar not found');
    
    const updatedCalendar = { ...mockCalendars[calendarIndex], ...data, updatedAt: new Date().toISOString() };
    mockCalendars[calendarIndex] = updatedCalendar;

    // Remove old days
    const newDayIds = data.calendarDays.map(d => d.calendarDayId).filter(id => id);
    mockCalendarDays = mockCalendarDays.filter(d => d.calendarId !== calendarId || newDayIds.includes(d.calendarDayId));

    let dayIdCounter = Math.max(0, ...mockCalendarDays.map(d => d.calendarDayId || 0));
    const updatedDays = data.calendarDays.map(day => {
      if (day.calendarDayId) {
        const dayIndex = mockCalendarDays.findIndex(d => d.calendarDayId === day.calendarDayId);
        if (dayIndex !== -1) {
          mockCalendarDays[dayIndex] = { ...mockCalendarDays[dayIndex], ...day };
          return mockCalendarDays[dayIndex];
        }
      }
      const newDay = { ...day, calendarDayId: ++dayIdCounter, calendarId };
      mockCalendarDays.push(newDay);
      return newDay;
    });
    updatedCalendar.calendarDays = updatedDays;
    return Promise.resolve(updatedCalendar);
  }
  // The API spec does not have a direct equivalent, so we simulate it with multiple calls if needed,
  // or assume a backend endpoint handles this. For this implementation, we'll just use the base update.
  const response = await api.put(`/calendar/${calendarId}`, data);
  return response.data;
};

export const deleteCalendar = async (calendarId: number): Promise<void> => {
  if (shouldUseMock()) {
    console.log(`Mock: Deleting calendar ${calendarId}`);
    const index = mockCalendars.findIndex(c => c.calendarId === calendarId);
    if (index > -1) {
      mockCalendars.splice(index, 1);
      mockCalendarDays = mockCalendarDays.filter(d => d.calendarId !== calendarId);
    }
    return Promise.resolve();
  }
  await api.delete(`/calendar/${calendarId}`);
};

// Calendar Day operations
export const addCalendarDay = async (calendarId: number, data: NewCalendarDayPayload): Promise<CalendarDay> => {
    if (shouldUseMock()) {
        console.log(`Mock: Adding day to calendar ${calendarId}`);
        const newDay: CalendarDay = {
            ...data,
            calendarDayId: Math.max(0, ...mockCalendarDays.map(d => d.calendarDayId || 0)) + 1,
            calendarId,
        };
        mockCalendarDays.push(newDay);
        return Promise.resolve(newDay);
    }
    const response = await api.post(`/calendar/${calendarId}/days`, data);
    return response.data;
};

export const updateCalendarDay = async (dayId: number, data: UpdateCalendarDayPayload): Promise<CalendarDay> => {
    if (shouldUseMock()) {
        console.log(`Mock: Updating calendar day ${dayId}`);
        const index = mockCalendarDays.findIndex(d => d.calendarDayId === dayId);
        if (index === -1) throw new Error('Day not found');
        mockCalendarDays[index] = { ...mockCalendarDays[index], ...data };
        return Promise.resolve(mockCalendarDays[index]);
    }
    const response = await api.put(`/calendar/days/${dayId}`, data);
    return response.data;
};

export const deleteCalendarDay = async (dayId: number): Promise<void> => {
    if (shouldUseMock()) {
        console.log(`Mock: Deleting calendar day ${dayId}`);
        const index = mockCalendarDays.findIndex(d => d.calendarDayId === dayId);
        if (index > -1) {
            mockCalendarDays.splice(index, 1);
        }
        return Promise.resolve();
    }
    await api.delete(`/calendar/days/${dayId}`);
};