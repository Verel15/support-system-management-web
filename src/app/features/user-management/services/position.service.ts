import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PageResponse, PositionRequest, PositionResponse } from '../interfaces/position.interface';

@Injectable({ providedIn: 'root' })
export class PositionService {
  private readonly api = inject(ApiService);

  getAll(page = 0, size = 100): Observable<PageResponse<PositionResponse>> {
    return this.api.get<PageResponse<PositionResponse>>('/positions', { page, size });
  }

  getById(id: string): Observable<PositionResponse> {
    return this.api.get<PositionResponse>(`/positions/${id}`);
  }

  create(payload: PositionRequest): Observable<PositionResponse> {
    return this.api.post<PositionResponse>('/positions', payload);
  }

  update(id: string, payload: PositionRequest): Observable<PositionResponse> {
    return this.api.put<PositionResponse>(`/positions/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/positions/${id}`);
  }
}
