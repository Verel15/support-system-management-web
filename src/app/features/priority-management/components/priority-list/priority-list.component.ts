import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
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
import {
  type PriorityIconKey,
  type PriorityColorKey,
  type PriorityDateRange,
  ICON_CLASSES,
  COLOR_HEX,
  SHAPE_TO_ICON_KEY,
  COLOR_TO_COLOR_KEY,
} from '../../interfaces/priority.interface';
import { PriorityService } from '../../services/priority.service';

interface Priority {
  id: string;
  name: string;
  icon: PriorityIconKey;
  color: PriorityColorKey;
  createdAt: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-priority-list',
  imports: [
    FormsModule,
    Button,
    Select,
    InputText,
    IconField,
    InputIcon,
    Menu,
    DataTableComponent,
    DataTableCellDirective,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
  ],
  templateUrl: './priority-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityListComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly priorityService = inject(PriorityService);

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingPriority = signal<Priority | null>(null);
  protected readonly deleting = signal(false);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewPriority() },
    { label: 'แก้ไข', command: () => this.onEditPriority() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeletePriority() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'ชื่อลำดับความสำคัญ', sortable: true },
    { field: 'createdAt', header: 'วันที่สร้าง', sortable: true },
  ];

  protected readonly dateOptions: { label: string; value: PriorityDateRange | null }[] = [
    { label: 'วันที่สร้าง', value: null },
    { label: 'วันนี้', value: 'TODAY' },
    { label: 'สัปดาห์นี้', value: 'THIS_WEEK' },
    { label: 'เดือนนี้', value: 'THIS_MONTH' },
  ];

  protected readonly selectedDate = signal<PriorityDateRange | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pagedPriorities = signal<Record<string, unknown>[]>([]);

  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
    });

    effect(() => {
      this.loadPriorities(
        this.currentPage(),
        this.pageSize(),
        this.searchQuery(),
        this.selectedDate(),
      );
    });
  }

  private loadPriorities(
    page: number,
    size: number,
    keyword: string,
    dateRange: PriorityDateRange | null,
  ): void {
    this.loading.set(true);
    this.priorityService.getAll(page - 1, size, keyword, dateRange).subscribe({
      next: (res) => {
        this.pagedPriorities.set(
          res.content.map((p) => ({
            id: p.id,
            name: p.name,
            icon: SHAPE_TO_ICON_KEY[p.iconShape],
            color: COLOR_TO_COLOR_KEY[p.iconColor],
            createdAt: new Date(p.createdAt).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          })),
        );
        this.totalRecords.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลลำดับความสำคัญได้',
          life: 4000,
        });
        this.loading.set(false);
      },
    });
  }

  protected iconClass(icon: string): string {
    return ICON_CLASSES[icon as PriorityIconKey] ?? 'pi pi-circle-fill';
  }

  protected colorHex(color: string): string {
    return COLOR_HEX[color as PriorityColorKey] ?? '#64748b';
  }

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

  protected onAdd(): void {
    this.router.navigate(['/ticket-priority-management/add']);
  }

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row);
    this.menu().toggle(event);
  }

  protected onViewPriority(): void {
    const id = this.activeRow()?.['id'] as string;
    if (!id) return;
    this.router.navigate(['/ticket-priority-management/detail', id]);
  }

  protected onEditPriority(): void {
    const id = this.activeRow()?.['id'] as string;
    if (!id) return;
    this.router.navigate(['/ticket-priority-management/edit', id]);
  }

  protected onDeletePriority(): void {
    const row = this.activeRow();
    if (!row) return;
    this.deletingPriority.set(row as unknown as Priority);
    this.showConfirmDialog.set(true);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(password: string): void {
    const id = this.deletingPriority()?.id;
    if (!id) return;
    this.deleting.set(true);
    this.priorityService.delete(id, password).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบลำดับความสำคัญเรียบร้อยแล้ว',
          life: 4000,
        });
        this.showDeleteDialog.set(false);
        this.deletingPriority.set(null);
        this.deleting.set(false);
        this.loadPriorities(
          this.currentPage(),
          this.pageSize(),
          this.searchQuery(),
          this.selectedDate(),
        );
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบลำดับความสำคัญได้',
          life: 4000,
        });
        this.deleting.set(false);
      },
    });
  }
}
