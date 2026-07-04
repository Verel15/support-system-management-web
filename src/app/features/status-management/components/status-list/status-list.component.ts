import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, map, of, startWith, Subject, switchMap } from 'rxjs';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
  SortEvent,
} from '../../../../shared/components/data-table';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../shared/components/dialogs';
import { StatusFlowService } from '../../services/status-flow.service';
import {
  StatusFlowDateRange,
  StatusFlowPageResponse,
  StatusFlowResponse,
} from '../../interfaces/status-flow.interface';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-status-list',
  imports: [
    FormsModule,
    Button,
    Select,
    Menu,
    DataTableComponent,
    DataTableCellDirective,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
    InputText,
    IconField,
    InputIcon
  ],
  templateUrl: './status-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusListComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly statusFlowService = inject(StatusFlowService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');

  protected readonly activeRow = signal<StatusFlowResponse | null>(null);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly refreshTrigger = signal(0);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewStatus() },
    { label: 'แก้ไข', command: () => this.onEditStatus() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeleteStatus() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'ชื่อสถานะ' },
    { field: 'createdByName', header: 'สร้างโดย' },
    { field: 'ticketCount', header: 'จำนวน Tickets ที่ใช้ทั้งหมด' },
    { field: 'updatedAt', header: 'วันที่แก้ไข' },
  ];

  protected readonly dateOptions: { label: string; value: StatusFlowDateRange | null }[] = [
    { label: 'วันที่สร้าง', value: null },
    { label: 'วันนี้', value: 'TODAY' },
    { label: 'สัปดาห์นี้', value: 'THIS_WEEK' },
    { label: 'เดือนนี้', value: 'THIS_MONTH' },
  ];

  protected readonly selectedDate = signal<StatusFlowDateRange | null>(null);
  protected readonly searchQuery = signal('');
  private readonly search$ = new Subject<string>();

  private readonly queryParams = computed(() => ({
    page: this.currentPage() - 1,
    size: this.pageSize(),
    keyword: this.searchQuery(),
    dateRange: this.selectedDate(),
    _refresh: this.refreshTrigger(),
  }));

  protected readonly pageData = signal<StatusFlowPageResponse | null>(null);
  protected readonly loading = signal(false);

  constructor() {
    this.search$.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
    });

    toObservable(this.queryParams)
      .pipe(
        switchMap(({ page, size, keyword, dateRange }) =>
          this.statusFlowService.getAll(page, size, keyword, dateRange).pipe(
            map((data) => ({ data, loading: false })),
            startWith({ data: null as StatusFlowPageResponse | null, loading: true }),
            catchError(() => of({ data: null as StatusFlowPageResponse | null, loading: false })),
          ),
        ),
      )
      .subscribe(({ data, loading }) => {
        this.pageData.set(data);
        this.loading.set(loading);
      });
  }

  protected readonly tableRows = computed<Record<string, unknown>[]>(() =>
    (this.pageData()?.content ?? []).map((r) => ({ ...r })),
  );

  protected readonly totalRecords = computed(() => this.pageData()?.totalElements ?? 0);

  protected onSearch(value: string): void {
    this.search$.next(value);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected onSort(_event: SortEvent): void {
    this.currentPage.set(1);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  protected onAddStatus(): void {
    this.router.navigate(['/status-management/add']);
  }

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row as unknown as StatusFlowResponse);
    this.menu().toggle(event);
  }

  protected onViewStatus(): void {
    const id = this.activeRow()?.id;
    if (id) this.router.navigate(['/status-management/detail', id]);
  }

  protected onEditStatus(): void {
    const id = this.activeRow()?.id;
    if (id) this.router.navigate(['/status-management/edit', id]);
  }

  protected onDeleteStatus(): void {
    if (!this.activeRow()) return;
    this.showConfirmDialog.set(true);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(password: string): void {
    const id = this.activeRow()?.id;
    if (!id) return;
    this.deleting.set(true);
    this.statusFlowService.delete(id, password).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteDialog.set(false);
        this.activeRow.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบสถานะเรียบร้อยแล้ว',
          life: 4000,
        });
        this.refreshTrigger.update((v) => v + 1);
      },
      error: () => {
        this.deleting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบสถานะได้',
          life: 4000,
        });
      },
    });
  }
}
