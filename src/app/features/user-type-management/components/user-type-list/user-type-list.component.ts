import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { formatDate } from '@angular/common';
import {
  DataTableCellDirective,
  DataTableComponent,
  SortEvent,
  TableColumn,
} from '../../../../shared/components/data-table';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../shared/components/dialogs';
import { UserTypeService } from '../../services/user-type.service';
import { UserTypePageResponse } from '../../interfaces/user-type.interface';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-user-type-list',
  imports: [
    Button,
    Menu,
    DataTableComponent,
    DataTableCellDirective,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
  ],
  templateUrl: './user-type-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTypeListComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly userTypeService = inject(UserTypeService);

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showConfirmDeleteDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingId = signal<string | null>(null);
  protected readonly deletingName = signal('');
  protected readonly deleting = signal(false);
  private readonly refreshTrigger = signal(0);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewUserType() },
    { label: 'แก้ไข', command: () => this.onEditUserType() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeleteUserType() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'typeName', header: 'ประเภท', sortable: true },
    { field: 'updatedAt', header: 'วันที่แก้ไขล่าสุด', sortable: true },
  ];

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  private readonly queryParams = computed(() => ({
    page: this.currentPage() - 1,
    size: this.pageSize(),
    _refresh: this.refreshTrigger(),
  }));

  private readonly response = toSignal(
    toObservable(this.queryParams).pipe(
      switchMap(({ page, size }) =>
        this.userTypeService.getAll(page, size).pipe(
          map((data) => ({ data, loading: false })),
          startWith({ data: null as UserTypePageResponse | null, loading: true }),
          catchError(() => of({ data: null as UserTypePageResponse | null, loading: false })),
        ),
      ),
      startWith({ data: null as UserTypePageResponse | null, loading: true }),
    ),
  );

  protected readonly loading = computed(() => this.response()?.loading ?? true);

  protected readonly totalRecords = computed(
    () => this.response()?.data?.totalElements ?? 0,
  );

  protected readonly pagedUserTypes = computed<Record<string, unknown>[]>(() =>
    (this.response()?.data?.content ?? []).map((u) => ({
      id: u.id,
      typeName: u.name,
      updatedAt: formatDate(u.updatedAt, 'dd/MM/yyyy HH:mm', 'en-US'),
    })),
  );

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

  protected onAddUserType(): void {
    this.router.navigate(['/user-type-management/add']);
  }

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row);
    this.menu().toggle(event);
  }

  protected onViewUserType(): void {
    const id = this.activeRow()?.['id'];
    if (id) this.router.navigate(['/user-type-management/detail', id]);
  }

  protected onEditUserType(): void {
    const id = this.activeRow()?.['id'];
    if (id) this.router.navigate(['/user-type-management/edit', id]);
  }

  protected onDeleteUserType(): void {
    const row = this.activeRow();
    if (!row) return;
    this.deletingId.set(row['id'] as string);
    this.deletingName.set(row['typeName'] as string);
    this.showConfirmDeleteDialog.set(true);
  }

  protected onConfirmDelete(): void {
    this.showConfirmDeleteDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    const id = this.deletingId();
    if (!id) return;
    this.deleting.set(true);
    this.userTypeService.delete(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteDialog.set(false);
        this.deletingId.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'ลบประเภทผู้ใช้เรียบร้อยแล้ว',
          life: 4000,
        });
        this.refreshTrigger.update((n) => n + 1);
      },
      error: () => this.deleting.set(false),
    });
  }
}
