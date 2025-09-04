import { Calendar, CalendarApiResponse, CalendarDay } from '@/types/calendar';

export const mockCalendars: Calendar[] = [
  {
    calendarId: 1,
    calendarName: 'Standard Business Calendar',
    description: 'Monday to Friday, 9 AM to 5 PM working hours for regular business operations.',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    recurrence: 'WEEKLY',
    createdBy: 'admin@company.com',
    createdAt: new Date().toISOString(),
    updatedBy: 'admin@company.com',
    updatedAt: new Date().toISOString(),
    calendarDays: [],
  },
  {
    calendarId: 2,
    calendarName: 'Company Holidays 2025',
    description: 'Official company holidays and non-working days for 2025.',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    recurrence: 'YEARLY',
    createdBy: 'hr@company.com',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedBy: 'hr@company.com',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    calendarDays: [],
  },
  {
    calendarId: 3,
    calendarName: '24/7 Operations Calendar',
    description: 'Round-the-clock calendar for critical processes and emergency workflows.',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    recurrence: 'DAILY',
    createdBy: 'operations@company.com',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedBy: 'operations@company.com',
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    calendarDays: [],
  },
  {
    calendarId: 4,
    calendarName: 'Financial Quarter Calendar',
    description: 'Calendar aligned with financial quarters for accounting and reporting workflows.',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    recurrence: 'MONTHLY',
    createdBy: 'finance@company.com',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedBy: 'finance@company.com',
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    calendarDays: [],
  },
  {
    calendarId: 5,
    calendarName: 'Project Delivery Calendar',
    description: 'Custom calendar for project milestones and delivery schedules.',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    recurrence: 'WEEKLY',
    createdBy: 'project@company.com',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedBy: 'project@company.com',
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
    calendarDays: [],
  },
  {
    calendarId: 6,
    calendarName: 'Maintenance Window Calendar',
    description: 'Scheduled maintenance windows for system updates and infrastructure work.',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    recurrence: 'MONTHLY',
    createdBy: 'it@company.com',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedBy: 'it@company.com',
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
    calendarDays: [],
  },
];

export const mockCalendarDays: CalendarDay[] = [
  // Standard Business Calendar days
  { calendarDayId: 1, calendarId: 1, dayDate: '2025-01-01', dayType: 'HOLIDAY', note: 'New Year\'s Day' },
  { calendarDayId: 2, calendarId: 1, dayDate: '2025-01-02', dayType: 'WORKING' },
  { calendarDayId: 3, calendarId: 1, dayDate: '2025-01-03', dayType: 'WORKING' },
  { calendarDayId: 4, calendarId: 1, dayDate: '2025-01-04', dayType: 'WEEKEND' },
  { calendarDayId: 5, calendarId: 1, dayDate: '2025-01-05', dayType: 'WEEKEND' },
  
  // Company Holidays
  { calendarDayId: 6, calendarId: 2, dayDate: '2025-01-01', dayType: 'HOLIDAY', note: 'New Year\'s Day' },
  { calendarDayId: 7, calendarId: 2, dayDate: '2025-07-04', dayType: 'HOLIDAY', note: 'Independence Day' },
  { calendarDayId: 8, calendarId: 2, dayDate: '2025-12-25', dayType: 'HOLIDAY', note: 'Christmas Day' },
  { calendarDayId: 9, calendarId: 2, dayDate: '2025-11-28', dayType: 'HOLIDAY', note: 'Thanksgiving Day' },
  
  // 24/7 Operations - all run days
  { calendarDayId: 10, calendarId: 3, dayDate: '2025-01-01', dayType: 'RUNDAY' },
  { calendarDayId: 11, calendarId: 3, dayDate: '2025-01-02', dayType: 'RUNDAY' },
  { calendarDayId: 12, calendarId: 3, dayDate: '2025-01-03', dayType: 'RUNDAY' },
  
  // Financial Quarter Calendar
  { calendarDayId: 13, calendarId: 4, dayDate: '2025-03-31', dayType: 'WORKING', note: 'Q1 End' },
  { calendarDayId: 14, calendarId: 4, dayDate: '2025-06-30', dayType: 'WORKING', note: 'Q2 End' },
  { calendarDayId: 15, calendarId: 4, dayDate: '2025-09-30', dayType: 'WORKING', note: 'Q3 End' },
  { calendarDayId: 16, calendarId: 4, dayDate: '2025-12-31', dayType: 'WORKING', note: 'Q4 End' },
];

export const mockPaginatedCalendars: CalendarApiResponse = {
  content: mockCalendars,
  totalElements: mockCalendars.length,
  totalPages: 1,
  size: 10,
  number: 0,
};