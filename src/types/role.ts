import { YesNo } from './user';

export interface Role {
  roleId: number;
  roleName: string;
  isActive: YesNo;
  createdBy: string;
  createdOn: string;
  updatedBy?: string | null;
  updatedOn?: string | null;
}

export interface RoleApiResponse {
  content: Role[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface NewRole {
  roleName: string;
  isActive: YesNo;
  createdBy: string;
  updatedBy?: string | null;
  updatedOn?: string | null;
}