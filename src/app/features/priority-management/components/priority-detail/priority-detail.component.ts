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
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
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

interface PriorityData {
  name: string;
  icon: PriorityIconKey;
  color: PriorityColorKey;
  duration: string;
  createdBy: string;
  createdDate: string;
}

interface TicketRow {
  title: string;
  project: string;
  assignee: string;
  team: string;
  status: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

const TICKET_STATUSES = [
  'Open', 'Pending', 'Return', 'In Progress', 'In Review', 'Done', 'Reject', 'Close',
];

@Component({
  selector: 'app-priority-detail',
  imports: [
    Button,
    Menu,
    DataTableComponent,
    DataTableCellDirective,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
  ],
  templateUrl: './priority-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityDetailComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);

  // TODO: receive via route params / service
  protected readonly priority = signal<PriorityData>({
    name: 'มากมาก',
    icon: 'tri-up',
    color: 'red',
    duration: '1 วัน',
    createdBy: 'ชื่อ นามสกุล',
    createdDate: 'วันจันทร์ที่ 3 ก.ค. 2566 เวลา 15:30 น.',
  });

  protected readonly ticketColumns: TableColumn[] = [
    { field: 'title', header: 'หัวข้อ Ticket', sortable: true },
    { field: 'project', header: 'โครงการ', sortable: true },
    { field: 'assignee', header: 'ผู้รับผิดชอบ', sortable: true },
    { field: 'team', header: 'ทีมรับเรื่อง', sortable: true },
    { field: 'status', header: '' },
  ];

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  private readonly allTickets: TicketRow[] = Array.from({ length: 15 }, (_, i) => ({
    title: 'Text',
    project: 'Text',
    assignee: 'Text',
    team: 'Text',
    status: TICKET_STATUSES[i % TICKET_STATUSES.length],
  }));

  protected readonly totalTickets = computed(() => this.allTickets.length);

  protected readonly pagedTickets = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allTickets.slice(start, start + this.pageSize()).map((t) => ({ ...t }));
  });

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDialog.set(true) },
  ];

  protected iconClass(icon: PriorityIconKey): string {
    return ICON_CLASSES[icon];
  }

  protected colorHex(color: PriorityColorKey): string {
    return COLOR_HEX[color];
  }

  protected statusBgColor(status: string): string {
    const map: Record<string, string> = {
      'Open': '#dbeafe',
      'Pending': '#fed7aa',
      'Return': '#fee2e2',
      'In Progress': '#fff7ed',
      'In Review': '#fef3c7',
      'Done': '#dcfce7',
      'Reject': '#fee2e2',
      'Close': '#f1f5f9',
    };
    return map[status] ?? '#f1f5f9';
  }

  protected statusTextColor(status: string): string {
    const map: Record<string, string> = {
      'Open': '#2563eb',
      'Pending': '#c2410c',
      'Return': '#dc2626',
      'In Progress': '#ea580c',
      'In Review': '#d97706',
      'Done': '#16a34a',
      'Reject': '#dc2626',
      'Close': '#64748b',
    };
    return map[status] ?? '#64748b';
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-priority-management/list']);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/ticket-priority-management/edit']);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    // TODO: call delete API with _password
    this.messageService.add({
      severity: 'success',
      summary: 'ลบสำเร็จ',
      detail: 'ลบลำดับความสำคัญเรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-priority-management/list']);
  }
}
