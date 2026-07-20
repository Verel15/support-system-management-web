export type AccountType = 'CUSTOMER' | 'STAFF' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserRequest {
  accountType: AccountType;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  companyId?: string;
  userTypeId?: string;
  departmentId?: string;
  positionId?: string;
}

export interface UserResponse {
  id: string;
  accountType: AccountType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImageUrl: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  companyName: string;
  userTypeId: string;
  userTypeName: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
}

export interface UserFilterRequest {
  accountType?: AccountType;
  companyId?: string;
  userTypeId?: string;
  keyword?: string;
  dateRange?: number;
}
