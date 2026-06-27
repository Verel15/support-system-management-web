import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

  protected readonly dateOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'วันนี้', value: 'today' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'เดือนนี้', value: 'month' },
  ];

  protected readonly selectedDate = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  private readonly allPriorities = signal<Priority[]>([]);

  constructor() {
    this.loadPriorities();
  }

  private loadPriorities(): void {
    this.loading.set(true);
    this.priorityService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.allPriorities.set(
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

  protected readonly filteredPriorities = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const date = this.selectedDate();
    const now = new Date();

    return this.allPriorities().filter((p) => {
      const matchesSearch = !query || p.name.toLowerCase().includes(query);
      if (!matchesSearch) return false;
      if (!date) return true;

      const createdDate = new Date(p.createdAt);
      if (date === 'today') {
        const todayStr = now.toLocaleDateString('th-TH');
        return createdDate.toLocaleDateString('th-TH') === todayStr;
      }
      if (date === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return createdDate >= weekAgo;
      }
      if (date === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return createdDate >= monthAgo;
      }
      return true;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredPriorities().length);

  protected readonly pagedPriorities = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredPriorities()
      .slice(start, start + this.pageSize())
      .map((p) => ({ ...p }));
  });

  protected iconClass(icon: string): string {
    return ICON_CLASSES[icon as PriorityIconKey] ?? 'pi pi-circle-fill';
  }

  protected colorHex(color: string): string {
    return COLOR_HEX[color as PriorityColorKey] ?? '#64748b';
  }

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
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

  protected onDeleteConfirmed(_password: string): void {
    const id = this.deletingPriority()?.id;
    if (!id) return;
    this.deleting.set(true);
    this.priorityService.delete(id).subscribe({
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
        this.loadPriorities();
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
