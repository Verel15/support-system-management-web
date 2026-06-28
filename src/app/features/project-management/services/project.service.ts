import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';
import {
  PageResponse,
  ProjectDocumentResponse,
  ProjectMemberRequest,
  ProjectMemberResponse,
  ProjectRequest,
  ProjectResponse,
} from '../interfaces/project.interface';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(page = 0, size = 100): Observable<PageResponse<ProjectResponse>> {
    return this.api.get<PageResponse<ProjectResponse>>('/projects', { page, size });
  }

  getById(id: string): Observable<ProjectResponse> {
    return this.api.get<ProjectResponse>(`/projects/${id}`);
  }

  create(payload: ProjectRequest): Observable<ProjectResponse> {
    return this.api.post<ProjectResponse>('/projects', payload);
  }

  update(id: string, payload: ProjectRequest): Observable<ProjectResponse> {
    return this.api.put<ProjectResponse>(`/projects/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/projects/${id}`);
  }

  getMembers(projectId: string): Observable<ProjectMemberResponse[]> {
    return this.api.get<ProjectMemberResponse[]>(`/projects/${projectId}/members`);
  }

  addMember(projectId: string, payload: ProjectMemberRequest): Observable<ProjectMemberResponse> {
    return this.api.post<ProjectMemberResponse>(`/projects/${projectId}/members`, payload);
  }

  removeMember(projectId: string, memberId: string): Observable<void> {
    return this.api.delete<void>(`/projects/${projectId}/members/${memberId}`);
  }

  getDocuments(projectId: string): Observable<ProjectDocumentResponse[]> {
    return this.api.get<ProjectDocumentResponse[]>(`/projects/${projectId}/documents`);
  }

  uploadDocument(projectId: string, file: File): Observable<ProjectDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ data: ProjectDocumentResponse }>(`${this.baseUrl}/projects/${projectId}/documents`, formData)
      .pipe(map((res) => res.data));
  }

  deleteDocument(projectId: string, documentId: string): Observable<void> {
    return this.api.delete<void>(`/projects/${projectId}/documents/${documentId}`);
  }
}
