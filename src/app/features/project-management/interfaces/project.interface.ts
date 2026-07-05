export type ProjectDateRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
export type ProjectStatus = 'OPEN' | 'WAITING' | 'CLOSED';

export interface ProjectRequest {
  name: string;
  color?: string;
  companyId: string;
  startDate: string;
  endDate: string;
}

export interface ProjectMemberSummary {
  id: string;
  fullName: string;
  profileImageUrl: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  color?: string;
  companyId: string;
  companyName: string;
  startDate: string;
  endDate: string;
  totalMembers: number;
  customerCount: number;
  assigneeCount: number;
  documentCount: number;
  members?: ProjectMemberSummary[];
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  totalTickets: number;
  successTicketCount: number;
}

export interface ProjectMemberRequest {
  userId: string;
  role: 'CUSTOMER' | 'ASSIGNEE';
}

export interface ProjectMemberResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  role: 'CUSTOMER' | 'ASSIGNEE';
  createdAt: string;
}

export interface ProjectDocumentResponse {
  id: string;
  fileName: string;
  fileUrl: string;
  contentType?: string;
  fileSize?: number;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
