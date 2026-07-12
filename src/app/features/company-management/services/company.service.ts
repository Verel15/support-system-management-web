import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  CompanyProjectFilterRequest,
  CompanyRequest,
  CompanyResponse,
  CompanyUserFilterRequest,
  CompanyUserResponse,
} from '../interfaces/company.interface';
import {
  PageResponse,
  ProjectResponse,
} from '../../project-management/interfaces/project.interface';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api = inject(ApiService);

  getAll(keyword?: string): Observable<CompanyResponse[]> {
    return this.api.get<CompanyResponse[]>('/companies', { keyword: keyword || undefined });
  }

  getById(id: string): Observable<CompanyResponse> {
    return this.api.get<CompanyResponse>(`/companies/${id}`);
  }

  create(payload: CompanyRequest): Observable<CompanyResponse> {
    return this.api.post<CompanyResponse>('/companies', payload);
  }

  update(id: string, payload: CompanyRequest): Observable<CompanyResponse> {
    return this.api.put<CompanyResponse>(`/companies/${id}`, payload);
  }

  delete(id: string, password: string): Observable<void> {
    return this.api.delete<void>(`/companies/${id}`, { password });
  }

  getUsers(
    id: string,
    filter: CompanyUserFilterRequest = {},
    page = 0,
    size = 10,
  ): Observable<PageResponse<CompanyUserResponse>> {
    return this.api.get<PageResponse<CompanyUserResponse>>(`/companies/${id}/users`, {
      accountType: filter.accountType,
      dateRange: filter.dateRange,
      keyword: filter.keyword || undefined,
      page,
      size,
    });
  }

  getProjects(id: string): Observable<ProjectResponse[]> {
    return this.api.get<ProjectResponse[]>(`/companies/${id}/projects`);
  }
}
