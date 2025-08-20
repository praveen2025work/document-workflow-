export interface WorkflowCalendarDayDto {
  calendarDayId: number;
  dayDate: string; // Assuming ISO 8601 format
  dayType: 'HOLIDAY' | 'RUNDAY' | 'WEEKEND';
  note?: string;
}

export interface WorkflowCalendarDto {
  calendarId: number;
  calendarName: string;
  description?: string;
  startDate: string; // Assuming ISO 8601 format
  endDate: string; // Assuming ISO 8601 format
  recurrence: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  createdBy: string;
  createdAt: string; // Assuming ISO 8601 format
  updatedBy?: string;
  updatedAt?: string; // Assuming ISO 8601 format
  calendarDays: WorkflowCalendarDayDto[];
}

export interface PaginatedCalendarsResponse {
  content: WorkflowCalendarDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}