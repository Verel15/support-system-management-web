export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TicketAssigneeSummary {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
}

export interface TicketListResponse {
  id: string;
  ticketId: string;
  title: string;
  projectId: string;
  projectName: string;
  currentStatusId: string;
  currentStatusName: string;
  currentStatusGroup: 'START' | 'PROCESS' | 'SUCCESS' | 'FAILED';
  statusFlowId: string;
  statusFlowName: string;
  priorityId: string;
  priorityName: string;
  priorityIconShape: PriorityIconShape;
  priorityIconColor: PriorityIconColor;
  dueDate: string | null;
  createdAt: string;
  assignees: TicketAssigneeSummary[];
}

export interface TicketAssigneeResponse {
  id: string;
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  assignedAt: string;
}

export interface TicketDetailResponse {
  id: string;
  ticketId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  projectName: string;
  ticketTypeId: string;
  ticketTypeName: string;
  currentStatusId: string;
  currentStatusName: string;
  currentStatusGroup: 'START' | 'PROCESS' | 'SUCCESS' | 'FAILED';
  statusFlowId: string;
  statusFlowName: string;
  priorityId: string;
  priorityName: string;
  priorityIconShape: PriorityIconShape;
  priorityIconColor: PriorityIconColor;
  priorityIntervalValue: number;
  priorityIntervalUnit: PriorityIntervalUnit;
  dueDate: string | null;
  requesterId: string;
  requesterFullName: string;
  requesterProfileImageUrl: string | null;
  assignees: TicketAssigneeResponse[];
}

export interface TicketTimelineItem {
  id: string;
  type: 'COMMENT' | 'STATUS_CHANGE';
  createdAt: string;
  authorId: string;
  authorFullName: string;
  authorProfileImageUrl: string | null;
  content: string | null;
  fromStatusId: string | null;
  fromStatusName: string | null;
  toStatusId: string | null;
  toStatusName: string | null;
  note: string | null;
}

export interface TicketFilterRequest {
  projectId?: string;
  statusId?: string;
  priorityId?: string;
  statusFlowId?: string;
  keyword?: string;
  overdue?: boolean;
}

export interface CreateTicketRequest {
  title: string;
  projectId: string;
  subCategoryId: string;
  description?: string;
}

export interface UpdateTicketRequest {
  title?: string;
  projectId: string;
  ticketTypeId: string;
  priorityId: string;
  statusFlowId: string;
  description?: string;
}

export interface ChangeTicketStatusRequest {
  toStatusId: string;
  note?: string;
}

export interface AddCommentRequest {
  content: string;
}

export interface AddAssigneeRequest {
  userId: string;
}

// Ticket Types (for selector dialog)
export interface TicketSubCategoryItem {
  id: string;
  name: string;
}

export interface TicketSubCategoryDetail {
  id: string;
  name: string;
  priorityLevelId: string;
  priorityLevelName: string;
  positionId: string;
  positionName: string;
}

export interface TicketCategoryItem {
  id: string;
  name: string;
  statusFlowId: string;
  statusFlowName: string;
  subCategories: TicketSubCategoryItem[];
}

export interface TicketTypeSelectorResponse {
  id: string;
  name: string;
  categories: TicketCategoryItem[];
}

// Priority
export interface PriorityResponse {
  id: string;
  name: string;
  description: string | null;
  iconShape: PriorityIconShape;
  iconColor: PriorityIconColor;
  intervalValue: number;
  intervalUnit: PriorityIntervalUnit;
}

// Status Flow
export interface StatusItemResponse {
  id: string;
  name: string;
  group: 'START' | 'PROCESS' | 'SUCCESS' | 'FAILED';
}

export interface StatusFlowResponse {
  id: string;
  name: string;
  statuses: StatusItemResponse[];
}

// Project (minimal for dropdown)
export interface ProjectSummary {
  id: string;
  name: string;
}

export type PriorityIconShape =
  | 'CIRCLE'
  | 'TRIUP'
  | 'TRIDOWN'
  | 'ARROWUP'
  | 'ARROWDOWN'
  | 'CHEVRONUP'
  | 'CHEVRONDOWN';

export type PriorityIconColor =
  | 'BLUE'
  | 'ORANGE'
  | 'YELLOW'
  | 'LIME'
  | 'GREEN'
  | 'RED'
  | 'PINK';

export type PriorityIntervalUnit =
  | 'MINUTE'
  | 'HOUR'
  | 'DAY'
  | 'WEEK'
  | 'MONTH'
  | 'YEAR';
