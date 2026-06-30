import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  PageResponse,
  TicketListResponse,
  TicketDetailResponse,
  TicketTimelineItem,
  TicketAssigneeResponse,
  TicketFilterRequest,
  CreateTicketRequest,
  UpdateTicketRequest,
  ChangeTicketStatusRequest,
  AddCommentRequest,
  AddAssigneeRequest,
  TicketTypeSelectorResponse,
  TicketSubCategoryDetail,
  PriorityResponse,
  StatusFlowResponse,
} from '../interfaces/ticket.interface';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly api = inject(ApiService);

  getAll(
    filter: TicketFilterRequest = {},
    page = 0,
    size = 10,
  ): Observable<PageResponse<TicketListResponse>> {
    return this.api.get<PageResponse<TicketListResponse>>('/tickets', {
      ...filter,
      page,
      size,
    });
  }

  getById(id: string): Observable<TicketDetailResponse> {
    return this.api.get<TicketDetailResponse>(`/tickets/${id}`);
  }

  create(payload: CreateTicketRequest): Observable<TicketDetailResponse> {
    return this.api.post<TicketDetailResponse>('/tickets', payload);
  }

  update(id: string, payload: UpdateTicketRequest): Observable<TicketDetailResponse> {
    return this.api.put<TicketDetailResponse>(`/tickets/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/tickets/${id}`);
  }

  changeStatus(id: string, payload: ChangeTicketStatusRequest): Observable<TicketDetailResponse> {
    return this.api.post<TicketDetailResponse>(`/tickets/${id}/status`, payload);
  }

  // Timeline (comments + status changes)
  getTimeline(ticketId: string): Observable<TicketTimelineItem[]> {
    return this.api.get<TicketTimelineItem[]>(`/tickets/${ticketId}/comments/timeline`);
  }

  addComment(ticketId: string, payload: AddCommentRequest): Observable<TicketTimelineItem> {
    return this.api.post<TicketTimelineItem>(`/tickets/${ticketId}/comments`, payload);
  }

  // Assignees
  getAssignees(ticketId: string): Observable<TicketAssigneeResponse[]> {
    return this.api.get<TicketAssigneeResponse[]>(`/tickets/${ticketId}/assignees`);
  }

  addAssignee(ticketId: string, payload: AddAssigneeRequest): Observable<TicketAssigneeResponse> {
    return this.api.post<TicketAssigneeResponse>(`/tickets/${ticketId}/assignees`, payload);
  }

  removeAssignee(ticketId: string, userId: string): Observable<void> {
    return this.api.delete<void>(`/tickets/${ticketId}/assignees/${userId}`);
  }

  // Ticket types (for selector dialog)
  getTicketTypeSelector(): Observable<TicketTypeSelectorResponse[]> {
    return this.api.get<TicketTypeSelectorResponse[]>('/ticket-types/selector');
  }

  getSubCategoryDetail(id: string): Observable<TicketSubCategoryDetail> {
    return this.api.get<TicketSubCategoryDetail>(`/ticket-sub-categories/${id}`);
  }

  // Priorities (for dropdowns)
  getPriorities(): Observable<PageResponse<PriorityResponse>> {
    return this.api.get<PageResponse<PriorityResponse>>('/priorities', { page: 0, size: 100 });
  }

  getPriorityById(id: string): Observable<PriorityResponse> {
    return this.api.get<PriorityResponse>(`/priorities/${id}`);
  }

  // Status flows (for dropdowns + status panel)
  getStatusFlows(): Observable<PageResponse<StatusFlowResponse>> {
    return this.api.get<PageResponse<StatusFlowResponse>>('/status-flows', { page: 0, size: 100 });
  }

  getStatusFlow(id: string): Observable<StatusFlowResponse> {
    return this.api.get<StatusFlowResponse>(`/status-flows/${id}`);
  }
}
