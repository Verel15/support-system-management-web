import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface ApiEnvelope<T> {
  data: T;
  message: string;
  success: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<ApiEnvelope<T>>(this.url(path), { params: this.buildParams(params) })
      .pipe(map((res) => res.data));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiEnvelope<T>>(this.url(path), body)
      .pipe(map((res) => res.data));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiEnvelope<T>>(this.url(path), body)
      .pipe(map((res) => res.data));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiEnvelope<T>>(this.url(path), body)
      .pipe(map((res) => res.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiEnvelope<T> | null>(this.url(path))
      .pipe(map((res) => res?.data as T));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private buildParams(params?: QueryParams): HttpParams | undefined {
    if (!params) return undefined;
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null),
    ) as Record<string, string>;
    return new HttpParams({ fromObject: filtered });
  }
}
