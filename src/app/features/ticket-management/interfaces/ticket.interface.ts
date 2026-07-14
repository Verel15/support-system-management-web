export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type TicketStatusGroup = 'START' | 'PROCESS' | 'SUCCESS' | 'FAILED';

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
  currentStatusGroup: TicketStatusGroup;
  statusFlowId: string;
  statusFlowName: string;
  priorityId: string;
  priorityName: string;
  priorityIconShape: PriorityIconShape;
  priorityIconColor: PriorityIconColor;
  dueDate: string | null;
  createdAt: string;
  assignees: TicketAssigneeSummary[];
  remainingTime: string;
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
  subCategoryId: string;
  subCategoryName: string;
  currentStatusId: string;
  currentStatusName: string;
  currentStatusGroup: TicketStatusGroup;
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
  type: 'COMMENT' | 'STATUS_CHANGE' | 'ASSIGNEE_ADDED' | 'ASSIGNEE_REMOVED' | 'FIELD_UPDATED';
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
  assigneeFullName: string | null;
  assigneeUserId: string | null;
  assigneeProfileImageUrl: string | null;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
}

export type TicketRemainingTime =
  | 'LESS_THAN_30_MIN'
  | 'LESS_THAN_1_DAY'
  | 'LESS_THAN_3_DAYS'
  | 'LESS_THAN_7_DAYS'
  | 'OVERDUE';

export interface FilterOption<T> {
  label: string;
  value: T | null;
}

export const TICKET_STATUS_OPTIONS: FilterOption<TicketStatusGroup>[] = [
  { label: 'สถานะ', value: null },
  { label: 'เริ่มต้น', value: 'START' },
  { label: 'กำลังดำเนินการ', value: 'PROCESS' },
  { label: 'สำเร็จ', value: 'SUCCESS' },
  { label: 'ล้มเหลว', value: 'FAILED' },
];

export const TICKET_TIME_OPTIONS: FilterOption<TicketRemainingTime>[] = [
  { label: 'ระยะเวลาที่เหลือ', value: null },
  { label: 'น้อยกว่า 30 นาที', value: 'LESS_THAN_30_MIN' },
  { label: 'น้อยกว่า 1 วัน', value: 'LESS_THAN_1_DAY' },
  { label: 'น้อยกว่า 3 วัน', value: 'LESS_THAN_3_DAYS' },
  { label: 'น้อยกว่า 7 วัน', value: 'LESS_THAN_7_DAYS' },
  { label: 'เกินกำหนด', value: 'OVERDUE' },
];

export function buildPriorityOptions(
  priorities: PriorityResponse[],
): FilterOption<string>[] {
  return [
    { label: 'ลำดับความสำคัญ', value: null },
    ...priorities.map((p) => ({ label: p.name, value: p.id })),
  ];
}

export interface TicketFilterRequest {
  projectId?: string;
  statusId?: string;
  statusGroup?: TicketStatusGroup;
  priorityId?: string;
  statusFlowId?: string;
  keyword?: string;
  remainingTime?: TicketRemainingTime;
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
  subCategoryId: string;
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
  group: TicketStatusGroup;
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
