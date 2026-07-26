import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  AuditLogDetailResponse,
  AuditLogPageResponse,
  AuditLogQuery,
} from '../interfaces/audit-log.interface';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly api = inject(ApiService);

  getAll(query: AuditLogQuery): Observable<AuditLogPageResponse> {
    return this.api.get<AuditLogPageResponse>('/audit-logs', {
      page: query.page ?? 0,
      size: query.size ?? 10,
      keyword: query.keyword || undefined,
      module: query.module || undefined,
      action: query.action || undefined,
      actorId: query.actorId || undefined,
      dateRange: query.dateRange || undefined,
    });
  }

  getById(id: string): Observable<AuditLogDetailResponse> {
    return this.api.get<AuditLogDetailResponse>(`/audit-logs/${id}`);
  }
}
