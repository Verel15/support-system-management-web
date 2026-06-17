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
import { MenuItem } from 'primeng/api';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
  SortEvent,
} from '../../../../shared/components/data-table';
import { StatusChipComponent } from '../../../../shared/components/status-chip';

interface Ticket {
  id: string;
  title: string;
  project: string;
  assignee: string;
  timeRemaining: string;
  team: string;
  status: string;
  priority: 'high' | 'medium' | 'low' | 'none';
}

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
export class TicketListComponent {
  private readonly router = inject(Router);
  protected readonly actionMenu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);

  protected readonly statusFilter = signal<string | null>(null);
  protected readonly priorityFilter = signal<string | null>(null);
  protected readonly timeFilter = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  protected readonly statusOptions = [
    { label: 'สถานะ', value: null },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'In Review', value: 'In Review' },
    { label: 'Done', value: 'Done' },
    { label: 'Close', value: 'Close' },
    { label: 'Return', value: 'Return' },
  ];

  protected readonly priorityOptions = [
    { label: 'ลำดับความสำคัญ', value: null },
    { label: 'สำคัญมาก', value: 'high' },
    { label: 'สำคัญปานกลาง', value: 'medium' },
    { label: 'สำคัญน้อย', value: 'low' },
  ];

  protected readonly timeOptions = [
    { label: 'ระยะเวลาที่เหลือ', value: null },
    { label: 'เกินกำหนด', value: 'overdue' },
    { label: '0 วัน', value: '0' },
    { label: '7 วัน', value: '7' },
  ];

  protected readonly menuItems: MenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewTicket() },
    { label: 'แก้ไข', command: () => this.onEditTicket() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true },
    { field: 'project', header: 'โครงการ', sortable: true },
    { field: 'assignee', header: 'ผู้รับผิดชอบ', sortable: true },
    { field: 'timeRemaining', header: 'ระยะเวลาที่เหลือ', sortable: true },
    { field: 'team', header: 'ทีมรับเรื่อง', sortable: true },
    { field: 'status', header: 'สถานะ' },
  ];

  private readonly allTickets: Ticket[] = [
    { id: '1', title: 'Data Loss', project: 'Helpdesk', assignee: '-', timeRemaining: '-', team: 'EVT-DEV', status: 'Open', priority: 'none' },
    { id: '2', title: 'Email Not Sending', project: 'Helpdesk', assignee: '-', timeRemaining: '-', team: 'EVT-DEV', status: 'Open', priority: 'none' },
    { id: '3', title: 'การตรวจสอบเครือข่าย', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '7 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'medium' },
    { id: '4', title: 'การลงทะเบียนข้อมูล', project: 'Helpdesk', assignee: 'สิริ สวัสดี', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Return', priority: 'high' },
    { id: '5', title: 'แก้ไขโมดิตโครงการในแดช...', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '7 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { id: '6', title: 'การแก้ไขปัญหาเครือข่าย', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '2 วัน', team: 'EVT-DEV', status: 'In Review', priority: 'high' },
    { id: '7', title: 'การอัพเกรดระบบ', project: 'Helpdesk', assignee: 'มีตัง ต้นเตือน', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Done', priority: 'none' },
    { id: '8', title: 'การอัพเกรดระบบ', project: 'Helpdesk', assignee: 'มะลิลา ขึ้นต้นเป็นมะลิ...', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Done', priority: 'none' },
    { id: '9', title: 'อัพเกรดอุปกรณ์จัดเก็บ...', project: 'Helpdesk', assignee: 'แก้ว ดิ้นน้ำ', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Close', priority: 'none' },
    { id: '10', title: 'Installation Error', project: 'Helpdesk', assignee: 'ชูใจ ใจดี', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Close', priority: 'high' },
  ];

  protected readonly filteredTickets = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    return this.allTickets.filter((t) => {
      const matchesSearch = !query || t.title.toLowerCase().includes(query);
      const matchesStatus = !status || t.status === status;
      const matchesPriority = !priority || t.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredTickets().length);

  protected readonly tableData = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredTickets()
      .slice(start, start + this.pageSize())
      .map((t) => ({ ...t }));
  });

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected onSort(_event: SortEvent): void {
    this.currentPage.set(1);
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

  protected getPriorityIconClass(priority: unknown): string {
    switch (priority as string) {
      case 'high': return 'pi pi-caret-up text-error-600';
      case 'medium': return 'pi pi-minus text-warning-500';
      case 'low': return 'pi pi-caret-down text-primary-500';
      default: return '';
    }
  }
}
