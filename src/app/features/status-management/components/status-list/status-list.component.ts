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
import { catchError, map, of, startWith, switchMap } from 'rxjs';
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
import { StatusFlowPageResponse, StatusFlowResponse } from '../../interfaces/status-flow.interface';

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
    { field: 'name', header: 'ชื่อสถานะ', sortable: true },
    { field: 'createdByName', header: 'สร้างโดย', sortable: true },
    { field: 'ticketCount', header: 'จำนวน Tickets ที่ใช้ทั้งหมด', sortable: true },
    { field: 'updatedAt', header: 'วันที่แก้ไข', sortable: true },
  ];

  protected readonly dateOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'วันนี้', value: 'today' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'เดือนนี้', value: 'month' },
  ];

  protected readonly selectedDate = signal<string | null>(null);

  private readonly queryParams = computed(() => ({
    page: this.currentPage() - 1,
    size: this.pageSize(),
    _refresh: this.refreshTrigger(),
  }));

  protected readonly pageData = signal<StatusFlowPageResponse | null>(null);
  protected readonly loading = signal(false);

  constructor() {
    toObservable(this.queryParams)
      .pipe(
        switchMap(({ page, size }) =>
          this.statusFlowService.getAll(page, size).pipe(
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

  protected onDeleteConfirmed(_password: string): void {
    const id = this.activeRow()?.id;
    if (!id) return;
    this.deleting.set(true);
    this.statusFlowService.delete(id).subscribe({
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
