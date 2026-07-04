import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  TicketCategoryPageResponse,
  TicketCategoryRequest,
  TicketCategoryResponse,
  TicketTypeDateRange,
} from '../interfaces/ticket-type.interface';

@Injectable({ providedIn: 'root' })
export class TicketCategoryService {
  private readonly api = inject(ApiService);

  getAll(
    page = 0,
    size = 10,
    keyword?: string,
    dateRange?: TicketTypeDateRange | null,
  ): Observable<TicketCategoryPageResponse> {
    return this.api.get<TicketCategoryPageResponse>('/ticket-categories', {
      page,
      size,
      keyword: keyword || undefined,
      dateRange: dateRange || undefined,
    });
  }

  getById(id: string): Observable<TicketCategoryResponse> {
    return this.api.get<TicketCategoryResponse>(`/ticket-categories/${id}`);
  }

  create(payload: TicketCategoryRequest): Observable<TicketCategoryResponse> {
    return this.api.post<TicketCategoryResponse>('/ticket-categories', payload);
  }

  update(id: string, payload: TicketCategoryRequest): Observable<TicketCategoryResponse> {
    return this.api.put<TicketCategoryResponse>(`/ticket-categories/${id}`, payload);
  }

  delete(id: string, password: string): Observable<void> {
    return this.api.delete<void>(`/ticket-categories/${id}`, { password });
  }
}
