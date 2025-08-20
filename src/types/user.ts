export interface WorkflowUserDto {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: 'Y' | 'N';
  escalationTo?: number;
  createdBy: string;
  createdOn: string; // Assuming ISO 8601 format
  updatedBy?: string;
  updatedOn?: string; // Assuming ISO 8601 format
}

export interface PaginatedUsersResponse {
  content: WorkflowUserDto[];
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