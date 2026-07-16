import { TicketStatusGroup } from './ticket.interface';

export interface ReportFilterRequest {
  dateFrom?: string;
  dateTo?: string;
  companyIds?: string[];
  projectIds?: string[];
  priorityId?: string;
  statusGroup?: TicketStatusGroup;
  assigneeId?: string;
}

export interface ReportSummaryResponse {
  totalTickets: number;
  resolvedTickets: number;
  overdueTickets: number;
  avgResolutionHours: number;
  slaCompliancePercent: number;
}

export interface ReportTicketRow {
  id: string;
  ticketId: string;
  title: string;
  companyId: string;
  companyName: string;
  projectId: string;
  projectName: string;
  assigneeIds: string[];
  assigneesDisplay: string;
  priorityName: string;
  currentStatusName: string;
  currentStatusGroup: TicketStatusGroup;
  createdAt: string;
  resolvedAt: string | null;
  resolutionHours: number | null;
  overdue: boolean;
}

export type ReportExportFormat = 'excel' | 'pdf';

export type ReportField =
  | 'ticketId'
  | 'title'
  | 'projectName'
  | 'companyName'
  | 'assigneesDisplay'
  | 'priorityName'
  | 'currentStatusName'
  | 'createdAt'
  | 'resolvedAt'
  | 'resolutionHours'
  | 'overdue';

export interface ReportFieldOption {
  field: ReportField;
  label: string;
}

export const REPORT_FIELD_OPTIONS: ReportFieldOption[] = [
  { field: 'ticketId', label: 'รหัส Ticket' },
  { field: 'title', label: 'หัวข้องาน' },
  { field: 'companyName', label: 'บริษัท' },
  { field: 'projectName', label: 'โครงการ' },
  { field: 'assigneesDisplay', label: 'ผู้รับผิดชอบ' },
  { field: 'priorityName', label: 'ลำดับความสำคัญ' },
  { field: 'currentStatusName', label: 'สถานะ' },
  { field: 'createdAt', label: 'วันที่สร้าง' },
  { field: 'resolvedAt', label: 'วันที่ปิดงาน' },
  { field: 'resolutionHours', label: 'เวลาที่ใช้แก้ไข (ชม.)' },
  { field: 'overdue', label: 'เกินกำหนด' },
];

export const DEFAULT_REPORT_FIELDS: ReportField[] = [
  'ticketId',
  'title',
  'projectName',
  'assigneesDisplay',
  'priorityName',
  'currentStatusName',
];

export interface ReportExportRequest {
  filter: ReportFilterRequest;
  companyIds: string[];
  projectIds: string[];
  fields: ReportField[];
  format: ReportExportFormat;
}

export interface FilterOption<T> {
  label: string;
  value: T | null;
}
