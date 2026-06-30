import { TemplateRef } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
  maxWidth?: string;
  cellTemplate?: TemplateRef<{ $implicit: Record<string, unknown>; value: unknown }>;
}

export interface SortEvent {
  field: string;
  direction: SortDirection;
}
