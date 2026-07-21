import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  FaqArticlePageResponse,
  FaqArticleRequest,
  FaqArticleResponse,
  FaqDateRange,
} from '../interfaces/faq.interface';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly api = inject(ApiService);

  getAll(
    page = 0,
    size = 10,
    keyword?: string,
    category?: string | null,
    published?: boolean | null,
    dateRange?: FaqDateRange | null,
  ): Observable<FaqArticlePageResponse> {
    return this.api.get<FaqArticlePageResponse>('/faq-articles', {
      page,
      size,
      keyword: keyword || undefined,
      category: category || undefined,
      published: published ?? undefined,
      dateRange: dateRange || undefined,
    });
  }

  getPublished(
    page = 0,
    size = 10,
    keyword?: string,
    category?: string | null,
  ): Observable<FaqArticlePageResponse> {
    return this.api.get<FaqArticlePageResponse>('/faq-articles/published', {
      page,
      size,
      keyword: keyword || undefined,
      category: category || undefined,
    });
  }

  getCategories(): Observable<string[]> {
    return this.api.get<string[]>('/faq-articles/categories');
  }

  getById(id: string): Observable<FaqArticleResponse> {
    return this.api.get<FaqArticleResponse>(`/faq-articles/${id}`);
  }

  create(payload: FaqArticleRequest): Observable<FaqArticleResponse> {
    return this.api.post<FaqArticleResponse>('/faq-articles', payload);
  }

  update(id: string, payload: FaqArticleRequest): Observable<FaqArticleResponse> {
    return this.api.put<FaqArticleResponse>(`/faq-articles/${id}`, payload);
  }

  delete(id: string, password: string): Observable<void> {
    return this.api.delete<void>(`/faq-articles/${id}`, { password });
  }
}
