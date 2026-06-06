import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import { Tabs, TabList, Tab } from 'primeng/tabs';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
  SortEvent,
} from '../../shared/components/data-table';
import { ProjectCardComponent, Project } from '../../shared/components/project-card';

type TicketStatus = 'In Progress' | 'Done' | 'Todo' | 'Blocked';
type TicketPriority = 'high' | 'medium' | 'low';

interface Ticket {
  title: string;
  project: string;
  assignee: string;
  timeRemaining: string;
  status: TicketStatus;
  priority: TicketPriority;
}

@Component({
  selector: 'app-my-tickets',
  imports: [
    FormsModule,
    RouterLink,
    Button,
    Select,
    InputText,
    IconField,
    InputIcon,
    Tag,
    Tabs,
    TabList,
    Tab,
    DataTableComponent,
    DataTableCellDirective,
    ProjectCardComponent,
  ],
  templateUrl: './my-tickets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTicketsComponent {
  protected readonly activeTab = signal(0);
  protected readonly priorityFilter = signal<string | null>(null);
  protected readonly timeFilter = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  protected readonly columns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true },
    { field: 'project', header: 'โครงการ', sortable: true },
    { field: 'assignee', header: 'ผู้รับมอบหมาย', sortable: true },
    { field: 'timeRemaining', header: 'ระยะเวลาที่เหลือ', sortable: true },
    { field: 'status', header: 'สถานะ', sortable: true },
  ];

  protected readonly priorityOptions = [
    { label: 'ทุกระดับความสำคัญ', value: null },
    { label: 'สูง', value: 'high' },
    { label: 'กลาง', value: 'medium' },
    { label: 'ต่ำ', value: 'low' },
  ];

  protected readonly timeOptions = [
    { label: 'ระยะเวลาที่เหลือ', value: null },
    { label: 'น้อยกว่า 3 วัน', value: 'lt3' },
    { label: '3–7 วัน', value: '3to7' },
    { label: 'มากกว่า 7 วัน', value: 'gt7' },
  ];

  protected readonly recentProjects: Project[] = [
    {
      name: 'IT Supporting and Helpdesk',
      status: 'Open',
      date: '31/07/66',
      owner: 'ผู้รับ ข้าว จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'อ', color: '#f59e0b' },
        { initials: 'ส', color: '#3b82f6' },
        { initials: 'ม', color: '#10b981' },
        { initials: 'ป', color: '#8b5cf6' },
      ],
      highCount: 8,
      normalCount: 2,
    },
    {
      name: 'Book Bank System',
      status: 'Open',
      date: '31/07/66',
      owner: 'ผู้รับ ข้าว จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ก', color: '#ef4444' },
        { initials: 'ข', color: '#f59e0b' },
        { initials: 'ค', color: '#3b82f6' },
        { initials: 'ง', color: '#10b981' },
      ],
      highCount: 6,
      normalCount: 2,
    },
    {
      name: 'Life Insurance System',
      status: 'Open',
      date: '31/07/66',
      owner: 'ผู้รับ ข้าว จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'จ', color: '#8b5cf6' },
        { initials: 'ฉ', color: '#ef4444' },
        { initials: 'ช', color: '#f59e0b' },
        { initials: 'ซ', color: '#3b82f6' },
      ],
      highCount: 8,
      normalCount: 3,
    },
    {
      name: 'Rent a car System',
      status: 'Open',
      date: '31/07/66',
      owner: 'ผู้รับ ข้าว จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ด', color: '#10b981' },
        { initials: 'ต', color: '#8b5cf6' },
        { initials: 'ถ', color: '#ef4444' },
        { initials: 'ท', color: '#f59e0b' },
      ],
      highCount: 8,
      normalCount: 3,
    },
  ];

  private readonly allTickets: Ticket[] = [
    {
      title: 'แก้ไขโค้ดการดำเนินแอพพลิเคชั่น',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '7 วัน',
      status: 'In Progress',
      priority: 'high',
    },
    {
      title: 'การอัพเกรตระบบ',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '7 วัน',
      status: 'In Progress',
      priority: 'high',
    },
    {
      title: 'แอพพลิเคชั่นล่มบ่อย',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '7 วัน',
      status: 'In Progress',
      priority: 'high',
    },
    {
      title: 'การเชื่อมต่อเครือข่าย',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '6 วัน',
      status: 'In Progress',
      priority: 'high',
    },
    {
      title: 'การตรวจสอบเครือข่าย',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '6 วัน',
      status: 'In Progress',
      priority: 'high',
    },
    {
      title: 'อัพเดตอุปกรณ์ปลายทางทั้งหมด',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '6 วัน',
      status: 'In Progress',
      priority: 'medium',
    },
    {
      title: 'Wireless Network',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '5 วัน',
      status: 'In Progress',
      priority: 'high',
    },
    {
      title: 'การกำหนดค่าเซิร์ฟเวอร์',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '5 วัน',
      status: 'In Progress',
      priority: 'medium',
    },
    {
      title: 'การดำเนินการปัญหา',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '4 วัน',
      status: 'In Progress',
      priority: 'high',
    },
    {
      title: 'Installation Error',
      project: 'Helpdesk',
      assignee: 'ใจงาม สุดใจจริง',
      timeRemaining: '3 วัน',
      status: 'In Progress',
      priority: 'high',
    },
    {
      title: 'Database Backup',
      project: 'Book Bank',
      assignee: 'แสนดี ที่สุดเลย',
      timeRemaining: '2 วัน',
      status: 'Todo',
      priority: 'medium',
    },
    {
      title: 'UI Design Update',
      project: 'Life Insurance',
      assignee: 'มานี มีตา',
      timeRemaining: '8 วัน',
      status: 'Done',
      priority: 'low',
    },
  ];

  protected readonly filteredTickets = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const priority = this.priorityFilter();
    return this.allTickets.filter((t) => {
      const matchSearch =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.project.toLowerCase().includes(query) ||
        t.assignee.toLowerCase().includes(query);
      const matchPriority = !priority || t.priority === priority;
      return matchSearch && matchPriority;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredTickets().length);

  protected readonly pagedTickets = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredTickets()
      .slice(start, start + this.pageSize())
      .map((t) => ({ ...t }));
  });

  protected getStatusSeverity(
    status: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'In Progress': 'warn',
      Done: 'success',
      Todo: 'secondary',
      Blocked: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  protected getPriorityDotClass(priority: string): string {
    const map: Record<string, string> = {
      high: 'bg-error-500',
      medium: 'bg-warning-500',
      low: 'bg-primary-400',
    };
    return map[priority] ?? 'bg-slate-400';
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

  protected onAddTicket(): void {
    // TODO: open create-ticket dialog
  }
}
