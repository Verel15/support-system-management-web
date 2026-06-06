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

interface Status {
  name: string;
  createdBy: string;
  ticketCount: number;
  updatedDate: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-status-list',
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
  templateUrl: './status-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusListComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingStatus = signal<Status | null>(null);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewStatus() },
    { label: 'แก้ไข', command: () => this.onEditStatus() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeleteStatus() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'ชื่อสถานะ', sortable: true },
    { field: 'createdBy', header: 'สร้างโดย', sortable: true },
    { field: 'ticketCount', header: 'จำนวน Tickets ที่ใช้ทั้งหมด', sortable: true },
    { field: 'updatedDate', header: 'วันที่แก้ไข', sortable: true },
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

  private readonly allStatuses: Status[] = [
    { name: 'เปิด', createdBy: 'สมชาย ใจดี', ticketCount: 42, updatedDate: '2026-06-01' },
    { name: 'กำลังดำเนินการ', createdBy: 'วิภาวรรณ สวัสดี', ticketCount: 18, updatedDate: '2026-06-02' },
    { name: 'รอการอนุมัติ', createdBy: 'ใจงาม สุดใจจริง', ticketCount: 7, updatedDate: '2026-06-03' },
    { name: 'ปิด', createdBy: 'แสนดี ที่สุดเลย', ticketCount: 125, updatedDate: '2026-06-04' },
    { name: 'ยกเลิก', createdBy: 'มานี มีตา', ticketCount: 15, updatedDate: '2026-06-05' },
    { name: 'รอดำเนินการ', createdBy: 'ตุ๊กตุ๊ก ตุ๊กแก', ticketCount: 33, updatedDate: '2026-05-28' },
    { name: 'เสร็จสิ้น', createdBy: 'สิริ สวัสดิ', ticketCount: 89, updatedDate: '2026-05-30' },
    { name: 'รอตอบกลับ', createdBy: 'ชูใจ ใจดี', ticketCount: 5, updatedDate: '2026-06-06' },
  ];

  protected readonly filteredStatuses = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const date = this.selectedDate();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return this.allStatuses.filter((s) => {
      const matchesSearch = !query || s.name.toLowerCase().includes(query);

      let matchesDate = true;
      if (date === 'today') {
        matchesDate = s.updatedDate === todayStr;
      } else if (date === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = new Date(s.updatedDate) >= weekAgo;
      } else if (date === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        matchesDate = new Date(s.updatedDate) >= monthAgo;
      }

      return matchesSearch && matchesDate;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredStatuses().length);

  protected readonly pagedStatuses = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredStatuses()
      .slice(start, start + this.pageSize())
      .map((s) => ({ ...s }));
  });

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

  protected onAddStatus(): void {
    this.router.navigate(['/status-management/add']);
  }

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row);
    this.menu().toggle(event);
  }

  protected onViewStatus(): void {
    this.router.navigate(['/status-management/detail']);
  }

  protected onEditStatus(): void {
    this.router.navigate(['/status-management/edit']);
  }

  protected onDeleteStatus(): void {
    const row = this.activeRow();
    if (!row) return;
    this.deletingStatus.set(row as unknown as Status);
    this.showConfirmDialog.set(true);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    // TODO: call delete API with this.deletingStatus() and _password
    this.messageService.add({
      severity: 'success',
      summary: 'ลบสำเร็จ',
      detail: 'ลบสถานะเรียบร้อยแล้ว',
      life: 4000,
    });
    this.deletingStatus.set(null);
  }
}
