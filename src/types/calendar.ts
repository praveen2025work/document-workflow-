export type DayType = 'HOLIDAY' | 'RUNDAY';
export type Recurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type Region = 'US' | 'EU' | 'APAC' | 'GLOBAL';
export type YesNo = 'Y' | 'N';

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
  cronExpression?: string | null;
  timezone?: string | null;
  region?: Region | null;
  offsetDays?: number;
  isActive: YesNo;
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
  cronExpression?: string;
  timezone?: string;
  region?: Region;
  offsetDays?: number;
  isActive: YesNo;
  createdBy: string;
  calendarDays: Omit<CalendarDay, 'calendarDayId' | 'calendarId'>[];
}

export interface UpdateCalendarWithDays {
  calendarId: number;
  calendarName: string;
  description?: string;
  startDate: string;
  endDate: string;
  recurrence: Recurrence;
  cronExpression?: string;
  timezone?: string;
  region?: Region;
  offsetDays?: number;
  isActive: YesNo;
  updatedBy: string;
  calendarDays: CalendarDay[];
}

export interface CalendarApiResponse {
  content: Calendar[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UpdateCalendarPayload {
  calendarName: string;
  description?: string;
  endDate: string;
  cronExpression?: string;
  timezone?: string;
  region?: Region;
  offsetDays?: number;
  isActive: YesNo;
  updatedBy: string;
}

export interface NewCalendarDayPayload {
  dayDate: string;
  dayType: DayType;
  note?: string;
}

export interface UpdateCalendarDayPayload {
  dayType: DayType;
  note?: string;
}