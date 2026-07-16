import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService, QueryParams } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';
import { PageResponse } from '../interfaces/ticket.interface';
import {
  ReportExportRequest,
  ReportFilterRequest,
  ReportSummaryResponse,
  ReportTicketRow,
} from '../interfaces/report.interface';

// Export must stay server-side scoped by role too (CUSTOMER limited to own company) —
// the client-side lock in the export dialog is defense-in-depth, not the source of truth.
@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getTicketReport(
    filter: ReportFilterRequest = {},
    page = 0,
    size = 10,
  ): Observable<PageResponse<ReportTicketRow>> {
    return this.api.get<PageResponse<ReportTicketRow>>('/reports/tickets', {
      ...this.toParams(filter),
      page,
      size,
    });
  }

  getSummary(filter: ReportFilterRequest = {}): Observable<ReportSummaryResponse> {
    return this.api.get<ReportSummaryResponse>('/reports/tickets/summary', this.toParams(filter));
  }

  export(request: ReportExportRequest): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/reports/tickets/export`, request, {
      responseType: 'blob',
    });
  }

  private toParams(filter: ReportFilterRequest): QueryParams {
    return {
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      companyIds: filter.companyIds,
      projectIds: filter.projectIds,
      priorityId: filter.priorityId,
      statusGroup: filter.statusGroup,
      assigneeId: filter.assigneeId,
    };
  }
}
