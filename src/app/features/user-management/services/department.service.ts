import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DepartmentRequest, DepartmentResponse } from '../interfaces/department.interface';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly api = inject(ApiService);

  getAll(): Observable<DepartmentResponse[]> {
    return this.api.get<DepartmentResponse[]>('/departments');
  }

  getById(id: string): Observable<DepartmentResponse> {
    return this.api.get<DepartmentResponse>(`/departments/${id}`);
  }

  create(payload: DepartmentRequest): Observable<DepartmentResponse> {
    return this.api.post<DepartmentResponse>('/departments', payload);
  }

  update(id: string, payload: DepartmentRequest): Observable<DepartmentResponse> {
    return this.api.put<DepartmentResponse>(`/departments/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/departments/${id}`);
  }
}
