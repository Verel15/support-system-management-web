import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChildren,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Skeleton } from 'primeng/skeleton';
import { DataTableCellDirective } from './data-table-cell.directive';
import { PaginationComponent } from './pagination.component';
import { SortDirection, SortEvent, TableColumn } from './data-table.types';

@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, Skeleton, PaginationComponent],
  templateUrl: './data-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<Record<string, unknown>[]>();
  readonly totalRecords = input(0);
  readonly pageSize = input(10);
  readonly currentPage = input(1);
  readonly loading = input(false);
  readonly showActions = input(true);
  readonly emptyMessage = input('ไม่พบข้อมูล');

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  readonly sortChange = output<SortEvent>();
  readonly actionClick = output<Record<string, unknown>>();
  readonly rowClick = output<Record<string, unknown>>();

  protected readonly cellTemplates = contentChildren(DataTableCellDirective);

  protected readonly sortField = signal<string | null>(null);
  protected readonly sortDirection = signal<SortDirection>(null);

  protected readonly loadingRows = Array.from({ length: 5 });

  protected readonly cellTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const t of this.cellTemplates()) {
      map.set(t.dataTableCell(), t.template);
    }
    return map;
  });

  getFieldValue(row: Record<string, unknown>, field: string): unknown {
    return row[field];
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field || this.sortDirection() === null) return 'pi-arrow-down';
    return this.sortDirection() === 'asc' ? 'pi-arrow-up' : 'pi-arrow-down';
  }

  onSort(field: string): void {
    const col = this.columns().find(c => c.field === field);
    if (!col?.sortable) return;

    if (this.sortField() === field) {
      const next: SortDirection =
        this.sortDirection() === null ? 'asc' :
        this.sortDirection() === 'asc' ? 'desc' : null;
      this.sortDirection.set(next);
      if (next === null) this.sortField.set(null);
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }

    this.sortChange.emit({ field: this.sortField() ?? field, direction: this.sortDirection() });
  }

  onActionClick(event: Event, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.actionClick.emit(row);
  }

  onRowClick(row: Record<string, unknown>): void {
    this.rowClick.emit(row);
  }
}
