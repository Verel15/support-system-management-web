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
} from '../../priority.types';

export interface Priority {
  name: string;
  icon: PriorityIconKey;
  color: PriorityColorKey;
  createdBy: string;
  ticketCount: number;
  createdDate: string;
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
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingPriority = signal<Priority | null>(null);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewPriority() },
    { label: 'แก้ไข', command: () => this.onEditPriority() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeletePriority() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'ชื่อลำดับความสำคัญ', sortable: true },
    { field: 'ticketCount', header: 'จำนวนที่ Ticket ใช้', sortable: true },
    { field: 'createdBy', header: 'ผู้สร้าง', sortable: true },
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

  private readonly allPriorities: Priority[] = [
    { name: 'น้อยมาก', icon: 'arrow-down', color: 'green', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-06-01' },
    { name: 'น้อย', icon: 'tri-down', color: 'lime', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-06-02' },
    { name: 'ปานกลาง', icon: 'circle', color: 'blue', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-06-03' },
    { name: 'มาก', icon: 'tri-up', color: 'orange', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-06-04' },
    { name: 'มากมาก', icon: 'tri-up', color: 'red', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-06-05' },
    { name: 'มากมากมาก', icon: 'arrow-up', color: 'red', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-05-28' },
    { name: 'มากมากมากมาก', icon: 'chevron-up', color: 'pink', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-05-29' },
    { name: 'มากมากมากมากมาก', icon: 'chevron-up', color: 'red', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-05-30' },
    { name: 'น้อยมากมาก', icon: 'chevron-down', color: 'lime', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-05-31' },
    { name: 'น้อยมากมากมาก', icon: 'arrow-down', color: 'green', createdBy: 'ใจดี งามมากมาย', ticketCount: 100, createdDate: '2026-06-06' },
  ];

  protected readonly filteredPriorities = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const date = this.selectedDate();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return this.allPriorities.filter((p) => {
      const matchesSearch = !query || p.name.toLowerCase().includes(query);
      let matchesDate = true;
      if (date === 'today') {
        matchesDate = p.createdDate === todayStr;
      } else if (date === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = new Date(p.createdDate) >= weekAgo;
      } else if (date === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        matchesDate = new Date(p.createdDate) >= monthAgo;
      }
      return matchesSearch && matchesDate;
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
    this.router.navigate(['/ticket-priority-management/detail']);
  }

  protected onEditPriority(): void {
    this.router.navigate(['/ticket-priority-management/edit']);
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
    // TODO: call delete API
    this.messageService.add({
      severity: 'success',
      summary: 'ลบสำเร็จ',
      detail: 'ลบลำดับความสำคัญเรียบร้อยแล้ว',
      life: 4000,
    });
    this.deletingPriority.set(null);
  }
}
