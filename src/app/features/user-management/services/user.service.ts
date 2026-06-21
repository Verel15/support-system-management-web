import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PageResponse } from '../interfaces/position.interface';
import { UserFilterRequest, UserRequest, UserResponse } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getAll(
    filter: UserFilterRequest = {},
    page = 0,
    size = 20,
    sort?: string,
  ): Observable<PageResponse<UserResponse>> {
    return this.api.get<PageResponse<UserResponse>>('/users', {
      ...filter,
      page,
      size,
      ...(sort ? { sort } : {}),
    });
  }

  getById(id: string): Observable<UserResponse> {
    return this.api.get<UserResponse>(`/users/${id}`);
  }

  create(payload: UserRequest): Observable<UserResponse> {
    return this.api.post<UserResponse>('/users', payload);
  }

  update(id: string, payload: UserRequest): Observable<UserResponse> {
    return this.api.put<UserResponse>(`/users/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }
}
