import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CompanyRequest, CompanyResponse } from '../interfaces/company.interface';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api = inject(ApiService);

  getAll(): Observable<CompanyResponse[]> {
    return this.api.get<CompanyResponse[]>('/companies');
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
}
