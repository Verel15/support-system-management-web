import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  PriorityDateRange,
  PriorityPageResponse,
  PriorityRequest,
  PriorityResponse,
} from '../interfaces/priority.interface';

@Injectable({ providedIn: 'root' })
export class PriorityService {
  private readonly api = inject(ApiService);

  getAll(
    page = 0,
    size = 10,
    keyword?: string,
    dateRange?: PriorityDateRange | null,
  ): Observable<PriorityPageResponse> {
    return this.api.get<PriorityPageResponse>('/priorities', {
      page,
      size,
      keyword: keyword || undefined,
      dateRange: dateRange || undefined,
    });
  }

  getById(id: string): Observable<PriorityResponse> {
    return this.api.get<PriorityResponse>(`/priorities/${id}`);
  }

  create(payload: PriorityRequest): Observable<PriorityResponse> {
    return this.api.post<PriorityResponse>('/priorities', payload);
  }

  update(id: string, payload: PriorityRequest): Observable<PriorityResponse> {
    return this.api.put<PriorityResponse>(`/priorities/${id}`, payload);
  }

  delete(id: string, password: string): Observable<void> {
    return this.api.delete<void>(`/priorities/${id}`, { password });
  }
}
