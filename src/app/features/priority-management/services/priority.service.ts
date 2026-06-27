import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  PriorityPageResponse,
  PriorityRequest,
  PriorityResponse,
} from '../interfaces/priority.interface';

@Injectable({ providedIn: 'root' })
export class PriorityService {
  private readonly api = inject(ApiService);

  getAll(page = 0, size = 10): Observable<PriorityPageResponse> {
    return this.api.get<PriorityPageResponse>('/priorities', { page, size });
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

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/priorities/${id}`);
  }
}
