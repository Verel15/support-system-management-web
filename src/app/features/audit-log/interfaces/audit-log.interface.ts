export type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';

export type AuditLogModule =
  | 'TICKET'
  | 'PROJECT'
  | 'USER'
  | 'COMPANY'
  | 'STATUS_FLOW'
  | 'TICKET_TYPE'
  | 'PRIORITY'
  | 'FAQ'
  | 'AUTH';

export type AuditLogDateRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

export interface AuditLogFieldChange {
  field: string;
  fieldLabel: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditLogActor {
  id: string;
  name: string;
  email: string;
  accountType: string;
}

export interface AuditLogResponse {
  id: string;
  module: AuditLogModule;
  action: AuditLogAction;
  description: string;
  actor: AuditLogActor;
  targetId: string | null;
  targetLabel: string | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

/** Full record returned only by the detail endpoint — includes the field-level diff. */
export interface AuditLogDetailResponse extends AuditLogResponse {
  changes: AuditLogFieldChange[];
  metadata: Record<string, string> | null;
}

export interface AuditLogPageResponse {
  content: AuditLogResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AuditLogQuery {
  page?: number;
  size?: number;
  keyword?: string;
  module?: AuditLogModule | null;
  action?: AuditLogAction | null;
  actorId?: string | null;
  dateRange?: AuditLogDateRange | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}
