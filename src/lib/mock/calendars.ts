import { Calendar, CalendarDay, Recurrence, DayType, Region, YesNo } from '@/types/calendar';

export let mockCalendars: Calendar[] = [
  {
    calendarId: 1,
    calendarName: 'US Business Calendar 2025',
    description: 'Standard US business days, excluding federal holidays.',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    recurrence: 'YEARLY',
    cronExpression: '0 0 9 * * MON-FRI',
    timezone: 'America/New_York',
    region: 'US',
    offsetDays: 0,
    isActive: 'Y',
    createdBy: 'admin@example.com',
    createdAt: '2024-01-15T10:00:00Z',
    updatedBy: null,
    updatedAt: null,
  },
  {
    calendarId: 2,
    calendarName: 'EU Month-End Close',
    description: 'Fiscal calendar for month-end reporting in the EU.',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    recurrence: 'MONTHLY',
    cronExpression: '0 0 8 L * ?',
    timezone: 'Europe/Brussels',
    region: 'EU',
    offsetDays: -2,
    isActive: 'Y',
    createdBy: 'finance@example.com',
    createdAt: '2024-02-20T11:30:00Z',
    updatedBy: 'finance@example.com',
    updatedAt: '2024-06-01T09:00:00Z',
  },
  {
    calendarId: 3,
    calendarName: 'APAC Trading Days',
    description: 'Active trading days for APAC markets.',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    recurrence: 'WEEKLY',
    cronExpression: '0 1 9 * * MON-FRI',
    timezone: 'Asia/Tokyo',
    region: 'APAC',
    offsetDays: 0,
    isActive: 'N',
    createdBy: 'trader@example.com',
    createdAt: '2024-03-10T08:00:00Z',
    updatedBy: null,
    updatedAt: null,
  },
];

export let mockCalendarDays: CalendarDay[] = [
  // Days for Calendar 1 (US Business Calendar)
  { calendarDayId: 1, calendarId: 1, dayDate: '2025-01-01', dayType: 'HOLIDAY', note: "New Year's Day" },
  { calendarDayId: 2, calendarId: 1, dayDate: '2025-01-20', dayType: 'HOLIDAY', note: 'Martin Luther King, Jr. Day' },
  { calendarDayId: 3, calendarId: 1, dayDate: '2025-05-26', dayType: 'HOLIDAY', note: 'Memorial Day' },
  { calendarDayId: 4, calendarId: 1, dayDate: '2025-07-04', dayType: 'HOLIDAY', note: 'Independence Day' },
  { calendarDayId: 5, calendarId: 1, dayDate: '2025-09-01', dayType: 'HOLIDAY', note: 'Labor Day' },
  { calendarDayId: 6, calendarId: 1, dayDate: '2025-11-27', dayType: 'HOLIDAY', note: 'Thanksgiving Day' },
  { calendarDayId: 7, calendarId: 1, dayDate: '2025-12-25', dayType: 'HOLIDAY', note: 'Christmas Day' },

  // Days for Calendar 2 (EU Month-End Close)
  { calendarDayId: 8, calendarId: 2, dayDate: '2025-01-01', dayType: 'HOLIDAY', note: "New Year's Day" },
  { calendarDayId: 9, calendarId: 2, dayDate: '2025-04-18', dayType: 'HOLIDAY', note: 'Good Friday' },
  { calendarDayId: 10, calendarId: 2, dayDate: '2025-04-21', dayType: 'HOLIDAY', note: 'Easter Monday' },
  { calendarDayId: 11, calendarId: 2, dayDate: '2025-05-01', dayType: 'HOLIDAY', note: 'Labour Day' },
  { calendarDayId: 12, calendarId: 2, dayDate: '2025-12-25', dayType: 'HOLIDAY', note: 'Christmas Day' },
  { calendarDayId: 13, calendarId: 2, dayDate: '2025-12-26', dayType: 'HOLIDAY', note: 'Boxing Day' },
  { calendarDayId: 14, calendarId: 2, dayDate: '2025-01-31', dayType: 'RUNDAY', note: 'January Close' },
  { calendarDayId: 15, calendarId: 2, dayDate: '2025-02-28', dayType: 'RUNDAY', note: 'February Close' },

  // No specific days for Calendar 3 initially
];