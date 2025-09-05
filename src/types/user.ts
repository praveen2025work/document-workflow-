export type YesNo = 'Y' | 'N';

export interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: YesNo;
  isAdmin: YesNo;
  createdBy: string;
  createdOn: string;
  roles?: string[];
  lastLogin?: string;
}

export interface UserApiResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserSearchCriteria {
  username?: string;
  firstName?: string;
  page?: number;
  size?: number;
}

export interface NewUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: YesNo;
  isAdmin: YesNo;
  createdBy: string;
}

export interface UpdateUser {
  firstName: string;
  lastName: string;
  email: string;
}