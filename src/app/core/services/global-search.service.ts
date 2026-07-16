import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export type GlobalSearchEntityType = 'TICKET' | 'PROJECT' | 'USER';

export interface GlobalSearchResult {
  type: GlobalSearchEntityType;
  id: string;
  title: string;
  /** Secondary line under the title, e.g. "TICK-1042 · Infra · assigned to Nan" */
  subtitle: string;
  /** Right-aligned meta, e.g. relative time, ticket count, online status */
  meta?: string;
}

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly api = inject(ApiService);

  search(query: string): Observable<GlobalSearchResult[]> {
    return this.api.get<GlobalSearchResult[]>('/search', {
      q: query,
      types: 'TICKET,PROJECT,USER',
      limit: 5,
    });
  }
}
