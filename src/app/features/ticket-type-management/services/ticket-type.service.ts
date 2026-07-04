import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  TicketTypeDateRange,
  TicketTypePageResponse,
  TicketTypeRequest,
  TicketTypeResponse,
  TicketTypeSelectorResponse,
} from '../interfaces/ticket-type.interface';

@Injectable({ providedIn: 'root' })
export class TicketTypeService {
  private readonly api = inject(ApiService);

  getAll(
    page = 0,
    size = 10,
    keyword?: string,
    dateRange?: TicketTypeDateRange | null,
  ): Observable<TicketTypePageResponse> {
    return this.api.get<TicketTypePageResponse>('/ticket-types', {
      page,
      size,
      keyword: keyword || undefined,
      dateRange: dateRange || undefined,
    });
  }

  getAllForSelector(): Observable<TicketTypeSelectorResponse[]> {
    return this.api.get<TicketTypeSelectorResponse[]>('/ticket-types/selector');
  }

  getById(id: string): Observable<TicketTypeResponse> {
    return this.api.get<TicketTypeResponse>(`/ticket-types/${id}`);
  }

  create(payload: TicketTypeRequest): Observable<TicketTypeResponse> {
    return this.api.post<TicketTypeResponse>('/ticket-types', payload);
  }

  update(id: string, payload: TicketTypeRequest): Observable<TicketTypeResponse> {
    return this.api.put<TicketTypeResponse>(`/ticket-types/${id}`, payload);
  }

  delete(id: string, password: string): Observable<void> {
    return this.api.delete<void>(`/ticket-types/${id}`, { password });
  }
}
