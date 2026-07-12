export type ProjectDateRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
export type ProjectStatus = 'OPEN' | 'WAITING' | 'CLOSED';

export interface ProjectFilterOption<T> {
  label: string;
  value: T | null;
}

export const PROJECT_STATUS_OPTIONS: ProjectFilterOption<ProjectStatus>[] = [
  { label: 'สถานะ', value: null },
  { label: 'เปิด', value: 'OPEN' },
  { label: 'รอดำเนินการ', value: 'WAITING' },
  { label: 'ปิด', value: 'CLOSED' },
];

export const PROJECT_DATE_OPTIONS: ProjectFilterOption<ProjectDateRange>[] = [
  { label: 'วันที่สร้าง', value: null },
  { label: 'วันนี้', value: 'TODAY' },
  { label: 'สัปดาห์นี้', value: 'THIS_WEEK' },
  { label: 'เดือนนี้', value: 'THIS_MONTH' },
];

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

export type TicketStatusGroup = 'START' | 'PROCESS' | 'SUCCESS' | 'FAILED';

export interface TicketStatusGroupCount {
  statusGroup: TicketStatusGroup;
  count: number;
}

export interface TicketStatsResponse {
  projectId: string;
  totalTickets: number;
  statusGroups: TicketStatusGroupCount[];
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
