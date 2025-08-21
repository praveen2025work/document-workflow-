export interface WorkflowRoleDto {
  roleId: number;
  roleName: string;
  isActive: 'Y' | 'N';
  createdBy: string;
  createdOn: string;
  updatedBy?: string;
  updatedOn?: string;
}

export interface PaginatedRolesResponse {
  content: WorkflowRoleDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}