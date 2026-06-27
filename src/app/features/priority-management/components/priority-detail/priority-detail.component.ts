import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  SHAPE_TO_ICON_KEY,
  COLOR_TO_COLOR_KEY,
  findDurationValue,
  DURATION_OPTIONS,
} from '../../interfaces/priority.interface';
import { PriorityService } from '../../services/priority.service';

interface PriorityData {
  name: string;
  icon: PriorityIconKey;
  color: PriorityColorKey;
  duration: string;
  createdAt: string;
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
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly priorityService = inject(PriorityService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);
  protected readonly loading = signal(true);

  protected readonly priority = signal<PriorityData>({
    name: '',
    icon: 'circle',
    color: 'blue',
    duration: '',
    createdAt: '',
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

  constructor() {
    this.loadPriority();
  }

  private loadPriority(): void {
    this.priorityService.getById(this.id).subscribe({
      next: (res) => {
        const durationLabel =
          DURATION_OPTIONS.find(
            (d) =>
              d.value === findDurationValue(res.intervalValue, res.intervalUnit),
          )?.label ?? `${res.intervalValue} ${res.intervalUnit}`;

        this.priority.set({
          name: res.name,
          icon: SHAPE_TO_ICON_KEY[res.iconShape],
          color: COLOR_TO_COLOR_KEY[res.iconColor],
          duration: durationLabel,
          createdAt: new Date(res.createdAt).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          }),
        });
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลลำดับความสำคัญได้',
          life: 4000,
        });
        this.router.navigate(['/ticket-priority-management/list']);
      },
    });
  }

  protected iconClass(icon: PriorityIconKey): string {
    return ICON_CLASSES[icon];
  }

  protected colorHex(color: PriorityColorKey): string {
    return COLOR_HEX[color];
  }

  protected statusBgColor(status: string): string {
    const map: Record<string, string> = {
      Open: '#dbeafe',
      Pending: '#fed7aa',
      Return: '#fee2e2',
      'In Progress': '#fff7ed',
      'In Review': '#fef3c7',
      Done: '#dcfce7',
      Reject: '#fee2e2',
      Close: '#f1f5f9',
    };
    return map[status] ?? '#f1f5f9';
  }

  protected statusTextColor(status: string): string {
    const map: Record<string, string> = {
      Open: '#2563eb',
      Pending: '#c2410c',
      Return: '#dc2626',
      'In Progress': '#ea580c',
      'In Review': '#d97706',
      Done: '#16a34a',
      Reject: '#dc2626',
      Close: '#64748b',
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
    this.router.navigate(['/ticket-priority-management/edit', this.id]);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.deleting.set(true);
    this.priorityService.delete(this.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบลำดับความสำคัญเรียบร้อยแล้ว',
          life: 4000,
        });
        this.router.navigate(['/ticket-priority-management/list']);
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
