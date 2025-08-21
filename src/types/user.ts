export interface WorkflowUserDto {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: 'Y' | 'N';
  createdBy: string;
  createdOn: string;
  updatedBy?: string;
  updatedOn?: string;
}

export interface PaginatedUsersResponse {
  content: WorkflowUserDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}