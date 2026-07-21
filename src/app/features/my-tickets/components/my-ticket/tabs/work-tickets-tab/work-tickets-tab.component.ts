import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  TicketFilterRequest,
  TicketRemainingTime,
  TICKET_TIME_OPTIONS,
} from '../../../../../ticket-management/interfaces/ticket.interface';
import { getPriorityIconClass } from '../../../../../ticket-management/utils/priority-icon.util';
import { AuthStore } from '../../../../../authentication/store/auth.store';

@Component({
  selector: 'app-work-tickets-tab',
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
  templateUrl: './work-tickets-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkTicketsTabComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly ticketService = inject(TicketService);
  private readonly messageService = inject(MessageService);

  protected readonly getPriorityIconClass = getPriorityIconClass;

  protected readonly timeFilter = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  protected readonly tickets = signal<TicketListResponse[]>([]);

  protected readonly timeOptions = TICKET_TIME_OPTIONS;

  protected readonly columns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true, maxWidth: '300px' },
    { field: 'projectName', header: 'โครงการ', sortable: true },
    { field: 'assigneesDisplay', header: 'ผู้รับผิดชอบ' },
    { field: 'remainingTime', header: 'ระยะเวลาที่เหลือ' },
    { field: 'currentStatusName', header: 'สถานะ' },
  ];

  protected readonly actionMenuItems = [
    { label: 'ดูรายละเอียด', icon: 'pi pi-eye', command: () => this.onViewTicket() },
  ];

  private activeRow: Record<string, unknown> | null = null;

  private readonly filteredTicketsRaw = computed(() =>
    this.tickets().filter(
      (t) => t.currentStatusGroup === 'PROCESS' || t.currentStatusGroup === 'START',
    ),
  );

  protected readonly tableData = computed<Record<string, unknown>[]>(() =>
    this.filteredTicketsRaw().map((t) => ({
      ...t,
      assigneesDisplay: t.assignees.length > 0 ? t.assignees.map((a) => a.fullName).join(', ') : '-',
    })),
  );

  protected readonly displayTotalRecords = computed(() => this.filteredTicketsRaw().length);

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.loading.set(true);
    const filter: TicketFilterRequest = {};
    if (this.searchQuery().trim()) filter.keyword = this.searchQuery().trim();
    if (this.timeFilter()) filter.remainingTime = this.timeFilter() as TicketRemainingTime;

    this.ticketService.getMy(filter, this.currentPage() - 1, this.pageSize()).subscribe({
      next: (res) => {
        this.tickets.set(res.content);
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

  protected onRowClick(row: Record<string, unknown>): void {
    this.navigateToDetail(row);
  }

  protected onMenuOpen(row: Record<string, unknown>): void {
    this.activeRow = row;
  }

  protected onViewTicket(): void {
    if (this.activeRow) this.navigateToDetail(this.activeRow);
  }

  private navigateToDetail(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    const base = this.authStore.user()?.accountType === 'CUSTOMER' ? '/my-tickets' : '/ticket-management';
    this.router.navigate([base, 'detail', id]);
  }
}
