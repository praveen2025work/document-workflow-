export interface WorkflowCalendarDayDto {
  calendarDayId: number;
  dayDate: string;
  dayType: 'HOLIDAY' | 'RUNDAY' | 'WEEKEND';
  note?: string;
}

export interface WorkflowCalendarDto {
  calendarId: number;
  calendarName: string;
  description?: string;
  startDate: string;
  endDate: string;
  recurrence: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  calendarDays: WorkflowCalendarDayDto[];
}

export type CreateCalendarDto = Omit<WorkflowCalendarDto, 'calendarId' | 'createdAt' | 'updatedAt' | 'calendarDays'> & {
  calendarDays: Omit<WorkflowCalendarDayDto, 'calendarDayId'>[];
};

export interface PaginatedCalendarsResponse {
  content: WorkflowCalendarDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}