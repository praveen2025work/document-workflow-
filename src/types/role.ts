import { YesNo } from './user';

export interface Role {
  roleId: number;
  roleName: string;
  isActive: YesNo;
  createdBy: string;
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
}