export type DayType = 'WORKING' | 'HOLIDAY' | 'WEEKEND' | 'RUNDAY';
export type Recurrence = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'NONE';

export interface CalendarDay {
  calendarDayId?: number;
  calendarId?: number;
  dayDate: string; // "YYYY-MM-DD"
  dayType: DayType;
  note?: string;
}

export interface Calendar {
  calendarId: number;
  calendarName: string;
  description?: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  recurrence: Recurrence;
  isActive?: 'Y' | 'N';
  createdBy: string;
  createdAt: string; // "YYYY-MM-DDTHH:mm:ss"
  updatedBy?: string | null;
  updatedAt?: string | null;
  calendarDays?: CalendarDay[];
}

export interface NewCalendarWithDays {
  calendarName: string;
  description?: string;
  startDate: string;
  endDate: string;
  recurrence: Recurrence;
  createdBy: string;
  calendarDays: Omit<CalendarDay, 'calendarDayId' | 'calendarId'>[];
}

export interface UpdateCalendarWithDays extends Omit<NewCalendarWithDays, 'createdBy'> {
  calendarId: number;
  updatedBy: string;
}

export interface CalendarApiResponse {
  content: Calendar[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}