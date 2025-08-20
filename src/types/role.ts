export interface WorkflowRoleDto {
  roleId: number;
  roleName: string;
  isActive: 'Y' | 'N';
  createdBy: string;
  createdOn: string; // Assuming ISO 8601 format
  updatedBy?: string;
  updatedOn?: string; // Assuming ISO 8601 format
}

export interface PaginatedRolesResponse {
  content: WorkflowRoleDto[];
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