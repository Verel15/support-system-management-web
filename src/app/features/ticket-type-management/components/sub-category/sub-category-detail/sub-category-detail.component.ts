import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { MenuItem, MessageService } from 'primeng/api';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
} from '../../../../../shared/components/data-table';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../../shared/components/dialogs';

interface SubCategoryDetail {
  name: string;
  priority: string;
  relatedPosition: string;
  createdDate: string;
  createdTime: string;
  createdBy: string;
}

interface TicketItem {
  title: string;
  project: string;
  assignee: string;
  team: string;
  status: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
  selector: 'app-sub-category-detail',
  imports: [
    FormsModule,
    Button,
    Menu,
    Select,
    Tag,
    DataTableComponent,
    DataTableCellDirective,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
  ],
  templateUrl: './sub-category-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubCategoryDetailComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);

  // TODO: receive via route params / service
  protected readonly subCategory = signal<SubCategoryDetail>({
    name: 'Network Design',
    priority: 'น้อย',
    relatedPosition: 'Back-end',
    createdDate: 'วันจันทร์ที่ 3 ก.ค. 2566',
    createdTime: '15:30',
    createdBy: 'ชื่อ นามสกุล',
  });

  protected readonly selectedStatus = signal<string>('active');

  protected readonly statusOptions = [
    { value: 'active', label: 'ใช้งาน' },
    { value: 'inactive', label: 'ไม่ใช้งาน' },
  ];

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข Sub-Category', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDialog.set(true) },
  ];

  protected readonly ticketColumns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true },
    { field: 'project', header: 'โครงการ', sortable: true },
    { field: 'assignee', header: 'ผู้รับผิดชอบ', sortable: true },
    { field: 'team', header: 'ทีมรับเรื่อง', sortable: true },
    { field: 'status', header: '' },
  ];

  private readonly allTickets: TicketItem[] = [
    { title: 'Network Design', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', team: 'EVT-DEV', status: 'Open' },
    { title: 'Network Design', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', team: 'EVT-DEV', status: 'Pending' },
    { title: 'Network Design', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', team: 'EVT-DEV', status: 'Return' },
    { title: 'Network Design', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', team: 'EVT-DEV', status: 'In Progress' },
    { title: 'Network Design', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', team: 'EVT-DEV', status: 'In Review' },
    { title: 'Network Design', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', team: 'EVT-DEV', status: 'Done' },
    { title: 'Network Design', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', team: 'EVT-DEV', status: 'Reject' },
    { title: 'Network Design', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', team: 'EVT-DEV', status: 'Close' },
  ];

  protected readonly tickets = signal<Record<string, unknown>[]>(
    this.allTickets.map((t) => ({ ...t }) as Record<string, unknown>),
  );
  protected readonly totalRecords = signal(this.allTickets.length);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  protected statusSeverity(status: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      Open: 'info',
      Pending: 'warn',
      Return: 'warn',
      'In Progress': 'warn',
      'In Review': 'info',
      Done: 'success',
      Reject: 'danger',
      Close: 'secondary',
    };
    return map[status] ?? 'secondary';
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/list']);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/ticket-type-management/sub-category/edit']);
  }

  protected onStatusChange(value: string): void {
    this.selectedStatus.set(value);
    this.messageService.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'อัปเดตสถานะเรียบร้อยแล้ว',
      life: 3000,
    });
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.deleting.set(true);
    this.messageService.add({
      severity: 'success',
      summary: 'ลบสำเร็จ',
      detail: 'ลบ Sub-Category เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-type-management/list']);
    this.deleting.set(false);
  }
}
