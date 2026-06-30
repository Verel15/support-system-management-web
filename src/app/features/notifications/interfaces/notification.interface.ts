export type NotificationCategory =
  | 'my-tickets'
  | 'my-projects'
  | 'data-management'
  | 'all-tickets'
  | 'user-management'
  | 'project-management';

export type NotificationSortType = 'assigned' | 'mentioned' | 'replied';

export interface TitleSegment {
  text: string;
  bold: boolean;
}

export interface DescriptionPart {
  type: 'text' | 'chip';
  text?: string;
  bold?: boolean;
  chipLabel?: string;
  chipSeverity?: 'success' | 'warn' | 'info' | 'secondary' | 'danger' | 'contrast';
}

export interface NotificationItem {
  id: string;
  categoryIcon: string;
  categoryLabel: string;
  titleSegments: TitleSegment[];
  descriptionParts: DescriptionPart[];
  isRead: boolean;
  actorName: string;
  actorInitial: string;
  avatarUrl?: string;
  timestamp: Date;
  timeLabel: string;
}

export interface NotificationGroup {
  groupLabel: string;
  items: NotificationItem[];
}

export interface NotificationFilterState {
  sorts: NotificationSortType[];
  categories: NotificationCategory[];
}


export type NotificationApiType =
  | 'TICKET_CREATED'
  | 'TICKET_UPDATED'
  | 'TICKET_DELETED'
  | 'TICKET_STATUS_CHANGED'
  | 'TICKET_ASSIGNED'
  | 'TICKET_UNASSIGNED'
  | 'TICKET_COMMENT_ADDED'
  | 'PROJECT_MEMBER_ADDED'
  | 'PROJECT_MEMBER_REMOVED'
  | 'PROJECT_UPDATED';

export type NotificationApiCategory = 'TICKETS' | 'MY_TICKETS' | 'PROJECT';

export interface NotificationResponse {
  id: string;
  type: NotificationApiType;
  category: NotificationApiCategory;
  entityType: string;
  entityId: string;
  title: string;
  message: string;
  read: boolean;
  actorId: string;
  actorFullName: string;
  actorProfileImageUrl: string;
  metadata: Record<string, unknown>;
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

export interface UnreadCountResponse {
  count: number;
}
