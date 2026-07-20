export type CompanyStatus = 'ACTIVE' | 'INACTIVE';

export interface CompanyRequest {
  name: string;
  logoImageUrl?: string;
  status: CompanyStatus;
}

export interface CompanyResponse {
  id: string;
  name: string;
  logoImageUrl?: string;
  status: CompanyStatus;
  customerCount: number;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CompanyUserDateRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

export interface CompanyUserFilterRequest {
  accountType?: 'CUSTOMER' | 'STAFF';
  dateRange?: CompanyUserDateRange;
  keyword?: string;
}

export interface CompanyUserResponse {
  id: string;
  accountType: 'CUSTOMER' | 'STAFF';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProjectFilterRequest {
  keyword?: string;
  dateRange?: CompanyUserDateRange;
  status?: 'WAITING' | 'OPEN' | 'CLOSED';
}
