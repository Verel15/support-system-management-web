import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import { TicketService } from '../../services/ticket.service';
import {
  TicketListResponse,
  PriorityResponse,
  PriorityIconColor,
} from '../../interfaces/ticket.interface';

@Component({
  selector: 'app-ticket-list',
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
    StatusChipComponent,
  ],
  templateUrl: './ticket-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketService);
  private readonly messageService = inject(MessageService);

  protected readonly actionMenu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);

  protected readonly statusFilter = signal<string | null>(null);
  protected readonly priorityFilter = signal<string | null>(null);
  protected readonly overdueFilter = signal<boolean | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly tickets = signal<TicketListResponse[]>([]);
  protected readonly priorities = signal<PriorityResponse[]>([]);

  protected readonly statusOptions = [
    { label: 'สถานะทั้งหมด', value: null },
    { label: 'เริ่มต้น', value: 'START' },
    { label: 'กำลังดำเนินการ', value: 'PROCESS' },
    { label: 'สำเร็จ', value: 'SUCCESS' },
    { label: 'ล้มเหลว', value: 'FAILED' },
  ];

  protected readonly priorityOptions = computed(() => [
    { label: 'ลำดับความสำคัญทั้งหมด', value: null },
    ...this.priorities().map((p) => ({ label: p.name, value: p.id })),
  ]);

  protected readonly timeOptions = [
    { label: 'ระยะเวลาที่เหลือ', value: null },
    { label: 'เกินกำหนด', value: 'overdue' },
  ];

  protected readonly menuItems: MenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewTicket() },
    { label: 'แก้ไข', command: () => this.onEditTicket() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true, maxWidth: '300px' },
    { field: 'projectName', header: 'โครงการ', sortable: true },
    { field: 'assigneesDisplay', header: 'ผู้รับผิดชอบ' },
    { field: 'dueDateDisplay', header: 'ครบกำหนด' },
    { field: 'statusFlowName', header: 'StatusFlow' },
    { field: 'currentStatusName', header: 'สถานะ' },
  ];

  protected readonly tableData = computed<Record<string, unknown>[]>(() =>
    this.tickets().map((t) => ({
      ...t,
      assigneesDisplay:
        t.assignees.length > 0 ? t.assignees.map((a) => a.fullName).join(', ') : '-',
      dueDateDisplay: t.dueDate ? this.formatDueDate(t.dueDate) : '-',
    })),
  );

  ngOnInit(): void {
    this.loadPriorities();
    this.loadTickets();
  }

  private loadPriorities(): void {
    this.ticketService.getPriorities().subscribe({
      next: (res) => this.priorities.set(res.content),
      error: () => {},
    });
  }

  private loadTickets(): void {
    this.loading.set(true);
    const filter: Record<string, unknown> = {};
    if (this.searchQuery().trim()) filter['keyword'] = this.searchQuery().trim();
    if (this.priorityFilter()) filter['priorityId'] = this.priorityFilter();
    if (this.overdueFilter()) filter['overdue'] = true;

    this.ticketService.getAll(filter, this.currentPage() - 1, this.pageSize()).subscribe({
      next: (res) => {
        this.tickets.set(res.content);
        this.totalRecords.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดรายการ Ticket ได้',
          life: 3000,
        });
      },
    });
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadTickets();
  }

  protected onTimeFilterChange(value: string | null): void {
    this.overdueFilter.set(value === 'overdue' ? true : null);
    this.onFilterChange();
  }

  protected onSort(_event: SortEvent): void {
    this.currentPage.set(1);
    this.loadTickets();
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTickets();
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadTickets();
  }

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row);
    this.actionMenu().toggle(event);
  }

  protected onAddTicket(): void {
    this.router.navigate(['/ticket-management/add']);
  }

  protected onViewTicket(): void {
    const row = this.activeRow();
    if (!row) return;
    this.router.navigate(['/ticket-management/detail', row['id']]);
  }

  protected onEditTicket(): void {
    const row = this.activeRow();
    if (!row) return;
    this.router.navigate(['/ticket-management/edit', row['id']]);
  }

  protected getPriorityIconClass(row: Record<string, unknown>): string {
    const shape = row['priorityIconShape'] as string;
    const color = row['priorityIconColor'] as PriorityIconColor;
    if (!shape || !color) return '';
    const colorClass = this.priorityColorClass(color);
    const iconClass = this.priorityShapeIcon(shape);
    return `${iconClass} ${colorClass}`;
  }

  private priorityShapeIcon(shape: string): string {
    switch (shape) {
      case 'ARROWUP':
      case 'CHEVRONUP':
      case 'TRIUP':
        return 'pi pi-caret-up';
      case 'ARROWDOWN':
      case 'CHEVRONDOWN':
      case 'TRIDOWN':
        return 'pi pi-caret-down';
      case 'CIRCLE':
        return 'pi pi-circle-fill';
      default:
        return 'pi pi-minus';
    }
  }

  private priorityColorClass(color: PriorityIconColor): string {
    switch (color) {
      case 'RED':
        return 'text-error-600';
      case 'ORANGE':
        return 'text-orange-500';
      case 'YELLOW':
        return 'text-warning-500';
      case 'LIME':
      case 'GREEN':
        return 'text-primary-500';
      case 'BLUE':
        return 'text-blue-500';
      case 'PINK':
        return 'text-pink-500';
      default:
        return 'text-slate-400';
    }
  }

  private formatDueDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `เกินกำหนด ${Math.abs(days)} วัน`;
    if (days === 0) return '0 วัน';
    return `${days} วัน`;
  }
}
