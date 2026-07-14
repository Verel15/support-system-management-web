import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Menu } from 'primeng/menu';
import { MessageService, SortEvent } from 'primeng/api';
import { StatusChipComponent } from '../../../../../../shared/components/status-chip';
import {
  DataTableCellDirective,
  DataTableComponent,
  TableColumn,
} from '../../../../../../shared/components/data-table';
import { TicketService } from '../../../../../ticket-management/services/ticket.service';
import {
  TicketListResponse,
  PriorityResponse,
  TicketFilterRequest,
  TicketRemainingTime,
  TICKET_STATUS_OPTIONS,
  TICKET_TIME_OPTIONS,
  buildPriorityOptions,
} from '../../../../../ticket-management/interfaces/ticket.interface';
import { getPriorityIconClass } from '../../../../../ticket-management/utils/priority-icon.util';

@Component({
  selector: 'app-my-tickets-tab',
  imports: [
    FormsModule,
    Select,
    InputText,
    IconField,
    InputIcon,
    Menu,
    StatusChipComponent,
    DataTableComponent,
    DataTableCellDirective,
  ],
  templateUrl: './my-tickets-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTicketsTabComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly messageService = inject(MessageService);

  protected readonly getPriorityIconClass = getPriorityIconClass;

  protected readonly statusFilter = signal<string | null>(null);
  protected readonly priorityFilter = signal<string | null>(null);
  protected readonly timeFilter = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  protected readonly tickets = signal<TicketListResponse[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly priorities = signal<PriorityResponse[]>([]);

  protected readonly statusOptions = TICKET_STATUS_OPTIONS;
  protected readonly timeOptions = TICKET_TIME_OPTIONS;
  protected readonly priorityOptions = computed(() => buildPriorityOptions(this.priorities()));

  protected readonly columns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true, maxWidth: '300px' },
    { field: 'projectName', header: 'โครงการ', sortable: true },
    { field: 'assigneesDisplay', header: 'ผู้รับผิดชอบ' },
    { field: 'remainingTime', header: 'ระยะเวลาที่เหลือ' },
    { field: 'priorityName', header: 'ลำดับความสำคัญ' },
    { field: 'currentStatusName', header: 'สถานะ' },
  ];

  protected readonly actionMenuItems = [
    { label: 'ดูรายละเอียด', icon: 'pi pi-eye' },
    { separator: true },
    { label: 'สำคัญปานกลาง', icon: 'pi pi-circle-fill', styleClass: 'text-warning-500' },
    { label: 'สำคัญน้อย', icon: 'pi pi-circle-fill', styleClass: 'text-primary-400' },
    { label: 'สำคัญมาก', icon: 'pi pi-circle-fill', styleClass: 'text-error-500' },
  ];

  protected readonly tableData = computed<Record<string, unknown>[]>(() =>
    this.tickets().map((t) => ({
      ...t,
      assigneesDisplay: t.assignees.length > 0 ? t.assignees.map((a) => a.fullName).join(', ') : '-',
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
    const filter: TicketFilterRequest = {};
    if (this.searchQuery().trim()) filter.keyword = this.searchQuery().trim();
    if (this.priorityFilter()) filter.priorityId = this.priorityFilter()!;
    if (this.statusFilter()) filter.statusGroup = this.statusFilter() as TicketFilterRequest['statusGroup'];
    if (this.timeFilter()) filter.remainingTime = this.timeFilter() as TicketRemainingTime;

    this.ticketService.getMy(filter, this.currentPage() - 1, this.pageSize()).subscribe({
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

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    this.loadTickets();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadTickets();
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
}
