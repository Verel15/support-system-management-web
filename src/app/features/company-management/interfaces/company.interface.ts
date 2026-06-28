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
