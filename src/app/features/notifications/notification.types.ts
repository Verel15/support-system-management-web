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
