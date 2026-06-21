import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UserTypeRequest, UserTypeResponse } from '../interfaces/user-type.interface';

@Injectable({ providedIn: 'root' })
export class UserTypeService {
  private readonly api = inject(ApiService);

  getAll(): Observable<UserTypeResponse[]> {
    return this.api.get<UserTypeResponse[]>('/user-types');
  }

  getById(id: string): Observable<UserTypeResponse> {
    return this.api.get<UserTypeResponse>(`/user-types/${id}`);
  }

  create(payload: UserTypeRequest): Observable<UserTypeResponse> {
    return this.api.post<UserTypeResponse>('/user-types', payload);
  }

  update(id: string, payload: UserTypeRequest): Observable<UserTypeResponse> {
    return this.api.put<UserTypeResponse>(`/user-types/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/user-types/${id}`);
  }
}
