export type ESuggestedAssigneeReason = 'NO_POSITION_MATCH' | 'NO_PROJECT_MEMBERS';

export interface SuggestedAssigneeUser {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  positionName: string;
  openTicketCount: number;
}

export interface SuggestedAssigneeResponse {
  suggested: SuggestedAssigneeUser | null;
  reason: ESuggestedAssigneeReason | null;
}
