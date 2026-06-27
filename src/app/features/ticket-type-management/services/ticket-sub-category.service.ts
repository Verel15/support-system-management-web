import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  TicketSubCategoryPageResponse,
  TicketSubCategoryRequest,
  TicketSubCategoryResponse,
} from '../interfaces/ticket-type.interface';

@Injectable({ providedIn: 'root' })
export class TicketSubCategoryService {
  private readonly api = inject(ApiService);

  getAll(page = 0, size = 10): Observable<TicketSubCategoryPageResponse> {
    return this.api.get<TicketSubCategoryPageResponse>('/ticket-sub-categories', { page, size });
  }

  getById(id: string): Observable<TicketSubCategoryResponse> {
    return this.api.get<TicketSubCategoryResponse>(`/ticket-sub-categories/${id}`);
  }

  create(payload: TicketSubCategoryRequest): Observable<TicketSubCategoryResponse> {
    return this.api.post<TicketSubCategoryResponse>('/ticket-sub-categories', payload);
  }

  update(id: string, payload: TicketSubCategoryRequest): Observable<TicketSubCategoryResponse> {
    return this.api.put<TicketSubCategoryResponse>(`/ticket-sub-categories/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/ticket-sub-categories/${id}`);
  }
}
