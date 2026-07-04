import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  StatusFlowDateRange,
  StatusFlowPageResponse,
  StatusFlowRequest,
  StatusFlowResponse,
} from '../interfaces/status-flow.interface';

@Injectable({ providedIn: 'root' })
export class StatusFlowService {
  private readonly api = inject(ApiService);

  getAll(
    page = 0,
    size = 10,
    keyword?: string,
    dateRange?: StatusFlowDateRange | null,
  ): Observable<StatusFlowPageResponse> {
    return this.api.get<StatusFlowPageResponse>('/status-flows', {
      page,
      size,
      keyword: keyword || undefined,
      dateRange: dateRange || undefined,
    });
  }

  getById(id: string): Observable<StatusFlowResponse> {
    return this.api.get<StatusFlowResponse>(`/status-flows/${id}`);
  }

  create(payload: StatusFlowRequest): Observable<StatusFlowResponse> {
    return this.api.post<StatusFlowResponse>('/status-flows', payload);
  }

  update(id: string, payload: StatusFlowRequest): Observable<StatusFlowResponse> {
    return this.api.put<StatusFlowResponse>(`/status-flows/${id}`, payload);
  }

  delete(id: string, password: string): Observable<void> {
    return this.api.delete<void>(`/status-flows/${id}`, { password });
  }
}
