import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  AuditLogDetailResponse,
  AuditLogPageResponse,
  AuditLogQuery,
  AuditLogTrendQuery,
  AuditLogTrendResponse,
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
      dateFrom: query.dateFrom || undefined,
      dateTo: query.dateTo || undefined,
    });
  }

  getById(id: string): Observable<AuditLogDetailResponse> {
    return this.api.get<AuditLogDetailResponse>(`/audit-logs/${id}`);
  }

  getTrend(query: AuditLogTrendQuery): Observable<AuditLogTrendResponse> {
    return this.api.get<AuditLogTrendResponse>('/audit-logs/trend', {
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      module: query.module || undefined,
      action: query.action || undefined,
    });
  }
}
