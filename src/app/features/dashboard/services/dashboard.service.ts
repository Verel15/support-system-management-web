import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ProjectStatusDistributionResponse, TicketStatusDistributionResponse, TicketSummaryResponse, TicketTrendResponse, TopProjectResponse } from '../interfaces/dashboard.interface';


@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getTicketSummary(year?: number): Observable<TicketSummaryResponse> {
    return this.api.get<TicketSummaryResponse>('/dashboard/tickets/summary', { year });
  }

  getProjectStatusDistribution(year?: number): Observable<ProjectStatusDistributionResponse> {
    return this.api.get<ProjectStatusDistributionResponse>('/dashboard/projects/status-distribution', { year });
  }

  getTicketStatusDistribution(year?: number, month?: number): Observable<TicketStatusDistributionResponse> {
    return this.api.get<TicketStatusDistributionResponse>('/dashboard/tickets/status-distribution', { year, month });
  }

  getTopProjects(year?: number, month?: number): Observable<TopProjectResponse> {
    return this.api.get<TopProjectResponse>('/dashboard/tickets/top-projects', { year, month });
  }

  getTicketTrend(year?: number): Observable<TicketTrendResponse> {
    return this.api.get<TicketTrendResponse>('/dashboard/tickets/trend', { year });
  }
}
