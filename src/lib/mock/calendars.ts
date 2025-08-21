import { PaginatedCalendarsResponse, WorkflowCalendarDto } from '@/types/calendar';

export const mockCalendars: WorkflowCalendarDto[] = [
  {
    calendarId: 1,
    calendarName: 'Working Days Calendar',
    description: 'Standard 9-5 working days calendar for business operations.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    recurrence: 'WEEKLY',
    createdBy: 'admin@company.com',
    createdAt: new Date().toISOString(),
    updatedBy: 'admin@company.com',
    updatedAt: new Date().toISOString(),
    calendarDays: [],
  },
  {
    calendarId: 2,
    calendarName: 'Company Holidays',
    description: 'Official company holidays and non-working days.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    recurrence: 'YEARLY',
    createdBy: 'hr@company.com',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedBy: 'hr@company.com',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    calendarDays: [],
  },
  {
    calendarId: 3,
    calendarName: '24/7 Operations',
    description: '24/7 calendar for critical processes and emergency workflows.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    recurrence: 'DAILY',
    createdBy: 'operations@company.com',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedBy: 'operations@company.com',
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    calendarDays: [],
  },
];

export const mockPaginatedCalendars: PaginatedCalendarsResponse = {
  content: mockCalendars,
  totalElements: mockCalendars.length,
  totalPages: 1,
  size: 10,
  number: 0,
};