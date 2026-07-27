import { TicketAttachmentResponse } from '../../../interfaces/ticket.interface';

export interface FeedUser {
  name: string;
  avatarInitial: string;
  avatarColor: string;
}

export interface CommentItem {
  type: 'comment';
  id: string;
  author: FeedUser;
  content: string;
  timestamp: string;
  attachments: TicketAttachmentResponse[];
}

export interface ActivityItem {
  type: 'activity';
  id: string;
  actor: string;
  action: string;
  statusLabel: string;
  statusGroup: 'START' | 'PROCESS' | 'SUCCESS' | 'FAILED' | null;
  timestamp: string;
  oldValue?: string | null;
}

export type FeedItem = CommentItem | ActivityItem;

export interface AssigneeUser extends FeedUser {
  id: string;
  userId: string;
  role: string;
  selected: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface PriorityOption extends SelectOption {
  color: string;
}
