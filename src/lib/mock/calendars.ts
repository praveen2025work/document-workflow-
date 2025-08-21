import { PaginatedCalendarsResponse, WorkflowCalendarDto } from '@/types/calendar';

export const mockCalendars: WorkflowCalendarDto[] = [
  {
    id: '1',
    name: 'Working Days',
    description: 'Standard 9-5 working days calendar.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Holidays',
    description: 'Company holidays calendar.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: '24/7',
    description: '24/7 calendar for critical processes.',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockPaginatedCalendars: PaginatedCalendarsResponse = {
  data: mockCalendars,
  page: 1,
  size: 10,
  total: mockCalendars.length,
};