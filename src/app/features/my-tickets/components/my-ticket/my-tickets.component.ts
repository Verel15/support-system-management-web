import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Menu } from 'primeng/menu';
import { Tabs, TabList, Tab } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import {
  DataTableCellDirective,
  DataTableComponent,
  TableColumn,
} from '../../../../shared/components/data-table';
import { Project, ProjectCardComponent } from '../../../../shared/components/project-card';
import { SortEvent } from 'primeng/api';
import type { NotificationItem } from '../../../notifications/interfaces/notification.interface';
import { NotificationItemComponent } from '../../../notifications/components/notification-item/notification-item.component';
import { TicketService } from '../../../ticket-management/services/ticket.service';
import { ProjectService } from '../../../project-management/services/project.service';
import {
  TicketListResponse,
  PriorityResponse,
  PriorityIconColor,
  TicketFilterRequest,
  TicketRemainingTime,
} from '../../../ticket-management/interfaces/ticket.interface';
import { ProjectResponse } from '../../../project-management/interfaces/project.interface';

interface FeedbackItem {
  id: string;
  avatarUrl: string;
  projectName: string;
  ticketName: string;
  commenterName: string;
  commentPreview: string;
  timeLabel: string;
  isRead: boolean;
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
    Menu,
    NotificationItemComponent,
    StatusChipComponent,
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
export class MyTicketsComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly projectService = inject(ProjectService);
  private readonly messageService = inject(MessageService);

  protected readonly activeTab = signal(0);
  protected readonly priorityFilter = signal<string | null>(null);
  protected readonly timeFilter = signal<string | null>(null);
  protected readonly statusFilter = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  protected readonly sortByFilter = signal<string | null>(null);
  protected readonly dateFilter = signal<string | null>(null);
  protected readonly feedbackSearchQuery = signal('');

  protected readonly tickets = signal<TicketListResponse[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly priorities = signal<PriorityResponse[]>([]);
  protected readonly recentProjects = signal<Project[]>([]);

  protected readonly columns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true, maxWidth: '300px' },
    { field: 'projectName', header: 'โครงการ', sortable: true },
    { field: 'assigneesDisplay', header: 'ผู้รับผิดชอบ' },
    { field: 'remainingTime', header: 'ระยะเวลาที่เหลือ' },
    { field: 'priorityName', header: 'ลำดับความสำคัญ' },
    { field: 'currentStatusName', header: 'สถานะ' },
  ];

  protected readonly priorityOptions = computed(() => [
    { label: 'ทุกระดับความสำคัญ', value: null },
    ...this.priorities().map((p) => ({ label: p.name, value: p.id })),
  ]);

  protected readonly timeOptions = [
    { label: 'ระยะเวลาที่เหลือ', value: null },
    { label: 'น้อยกว่า 30 นาที', value: 'LESS_THAN_30_MIN' },
    { label: 'น้อยกว่า 1 วัน', value: 'LESS_THAN_1_DAY' },
    { label: 'น้อยกว่า 3 วัน', value: 'LESS_THAN_3_DAYS' },
    { label: 'น้อยกว่า 7 วัน', value: 'LESS_THAN_7_DAYS' },
    { label: 'เกินกำหนด', value: 'OVERDUE' },
  ];

  protected readonly statusOptions = [
    { label: 'ทุกสถานะ', value: null },
    { label: 'เริ่มต้น', value: 'START' },
    { label: 'กำลังดำเนินการ', value: 'PROCESS' },
    { label: 'สำเร็จ', value: 'SUCCESS' },
    { label: 'ล้มเหลว', value: 'FAILED' },
  ];

  protected readonly sortByOptions = [
    { label: 'ล่าสุด', value: null },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  protected readonly feedbackDateOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'วันนี้', value: 'today' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'เดือนนี้', value: 'month' },
  ];

  protected readonly feedbackItems: FeedbackItem[] = [
    {
      id: '1',
      avatarUrl: 'https://i.pravatar.cc/40?img=5',
      projectName: 'Helpdesk',
      ticketName: 'บัคหน้าแดชบอร์ด',
      commenterName: 'มานี มีตา',
      commentPreview: 'กำลังดำเนินการแก้ไขค่ะ',
      timeLabel: '1 นาที',
      isRead: false,
    },
    {
      id: '2',
      avatarUrl: 'https://i.pravatar.cc/40?img=5',
      projectName: 'Helpdesk',
      ticketName: 'บัคหน้าแดชบอร์ด',
      commenterName: 'มานี มีตา',
      commentPreview: 'กำลังดำเนินการแก้ไขค่ะ',
      timeLabel: '1 นาที',
      isRead: false,
    },
    {
      id: '3',
      avatarUrl: 'https://i.pravatar.cc/40?img=3',
      projectName: 'Healthcare & spa',
      ticketName: 'server มีปัญหา',
      commenterName: 'สิริ สวัสดิ์',
      commentPreview: 'กำลังดำเนินการแก้ไขค่ะ',
      timeLabel: '3 ชั่วโมง',
      isRead: false,
    },
    {
      id: '4',
      avatarUrl: 'https://i.pravatar.cc/40?img=3',
      projectName: 'Healthcare & spa',
      ticketName: 'server มีปัญหา',
      commenterName: 'สิริ สวัสดิ์',
      commentPreview: 'กำลังดำเนินการแก้ไขค่ะ',
      timeLabel: '3 ชั่วโมง',
      isRead: false,
    },
    {
      id: '5',
      avatarUrl: 'https://i.pravatar.cc/40?img=3',
      projectName: 'Healthcare & spa',
      ticketName: 'server มีปัญหา',
      commenterName: 'สิริ สวัสดิ์',
      commentPreview: 'ปัญหาเกิดขึ้นตอนไหนคะ',
      timeLabel: '3 วัน',
      isRead: true,
    },
    {
      id: '6',
      avatarUrl: 'https://i.pravatar.cc/40?img=3',
      projectName: 'Healthcare & spa',
      ticketName: 'server มีปัญหา',
      commenterName: 'สิริ สวัสดิ์',
      commentPreview: 'ปัญหาเกิดขึ้นตอนไหนคะ',
      timeLabel: '3 วัน',
      isRead: true,
    },
    {
      id: '7',
      avatarUrl: 'https://i.pravatar.cc/40?img=3',
      projectName: 'Healthcare & spa',
      ticketName: 'server มีปัญหา',
      commenterName: 'สิริ สวัสดิ์',
      commentPreview: 'ปัญหาเกิดขึ้นตอนไหนคะ',
      timeLabel: '3 วัน',
      isRead: true,
    },
    {
      id: '8',
      avatarUrl: 'https://i.pravatar.cc/40?img=5',
      projectName: 'Helpdesk',
      ticketName: 'บัคหน้าแดชบอร์ด',
      commenterName: 'มานี มีตา',
      commentPreview: 'เกิดปัญหามาที่วันแล้วค่ะ',
      timeLabel: 'วันจันทร์ที่ 10 ก.ค. เวลา 15:00 น.',
      isRead: true,
    },
    {
      id: '9',
      avatarUrl: 'https://i.pravatar.cc/40?img=5',
      projectName: 'Helpdesk',
      ticketName: 'บัคหน้าแดชบอร์ด',
      commenterName: 'มานี มีตา',
      commentPreview: 'เกิดปัญหามาที่วันแล้วค่ะ',
      timeLabel: 'วันจันทร์ที่ 10 ก.ค. เวลา 15:00 น.',
      isRead: true,
    },
    {
      id: '10',
      avatarUrl: 'https://i.pravatar.cc/40?img=5',
      projectName: 'Helpdesk',
      ticketName: 'บัคหน้าแดชบอร์ด',
      commenterName: 'มานี มีตา',
      commentPreview: 'เกิดปัญหามาที่วันแล้วค่ะ',
      timeLabel: 'วันจันทร์ที่ 10 ก.ค. เวลา 15:00 น.',
      isRead: true,
    },
  ];

  private readonly memberColors = [
    '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
    '#ef4444', '#ec4899', '#f97316', '#06b6d4',
  ];

  protected readonly filteredTicketsRaw = computed(() => {
    if (this.activeTab() !== 0) return this.tickets();
    return this.tickets().filter(
      (t) => t.currentStatusGroup === 'PROCESS' || t.currentStatusGroup === 'START',
    );
  });

  protected readonly tableData = computed<Record<string, unknown>[]>(() =>
    this.filteredTicketsRaw().map((t) => ({
      ...t,
      assigneesDisplay:
        t.assignees.length > 0 ? t.assignees.map((a) => a.fullName).join(', ') : '-',
    })),
  );

  protected readonly displayTotalRecords = computed(() =>
    this.activeTab() === 0 ? this.filteredTicketsRaw().length : this.totalRecords(),
  );

  protected readonly filteredFeedback = computed(() => {
    const query = this.feedbackSearchQuery().toLowerCase();
    const items = !query
      ? this.feedbackItems
      : this.feedbackItems.filter(
          (f) =>
            f.projectName.toLowerCase().includes(query) ||
            f.ticketName.toLowerCase().includes(query) ||
            f.commenterName.toLowerCase().includes(query) ||
            f.commentPreview.toLowerCase().includes(query),
        );

    return items.map(
      (f): NotificationItem => ({
        id: f.id,
        categoryIcon: 'pi-folder',
        categoryLabel: f.projectName,
        titleSegments: [
          { text: `โครงการ ${f.projectName}`, bold: !f.isRead },
          { text: `tickets "${f.ticketName}"`, bold: !f.isRead },
        ],
        descriptionParts: [
          { type: 'text', text: f.commenterName, bold: true },
          { type: 'text', text: `การตอบกลับ "${f.commentPreview}"` },
        ],
        isRead: f.isRead,
        actorName: f.commenterName,
        actorInitial: f.commenterName.charAt(0),
        avatarUrl: f.avatarUrl,
        timestamp: new Date(),
        timeLabel: f.timeLabel,
      }),
    );
  });

  protected readonly unreadFeedbackCount = computed(
    () => this.feedbackItems.filter((f) => !f.isRead).length,
  );

  protected actionMenuItems = [
    { label: 'ดูรายละเอียด', icon: 'pi pi-eye' },
    { separator: true },
    { label: 'สำคัญปานกลาง', icon: 'pi pi-circle-fill', styleClass: 'text-warning-500' },
    { label: 'สำคัญน้อย', icon: 'pi pi-circle-fill', styleClass: 'text-primary-400' },
    { label: 'สำคัญมาก', icon: 'pi pi-circle-fill', styleClass: 'text-error-500' },
  ];

  ngOnInit(): void {
    this.loadPriorities();
    this.loadTickets();
    this.loadRecentProjects();
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

  private loadRecentProjects(): void {
    this.projectService.getMy(0, 4).subscribe({
      next: (res) => this.recentProjects.set(res.content.map((r) => this.mapToProject(r))),
      error: () => this.recentProjects.set([]),
    });
  }

  private mapToProject(r: ProjectResponse): Project {
    return {
      id: r.id,
      name: r.name,
      status: r.status,
      date: this.formatDate(r.endDate),
      owner: r.companyName ?? '',
      totalTickets: r.totalTickets,
      successTicketCount: r.successTicketCount,
      members: (r.members ?? []).map((m, i) => ({
        initials: m.fullName.charAt(0),
        color: this.memberColors[i % this.memberColors.length],
        avatarUrl: m.profileImageUrl || undefined,
        fullName: m.fullName,
      })),
      highCount: 0,
      normalCount: 0,
      accentColor: r.color ?? '#3b82f6',
      attachmentCount: r.documentCount ?? 0,
    };
  }

  private formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = ((d.getFullYear() + 543) % 100).toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
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

  protected getPriorityIconClass(row: Record<string, unknown>): string {
    const shape = row['priorityIconShape'] as string;
    const color = row['priorityIconColor'] as PriorityIconColor;
    if (!shape || !color) return '';
    return `${this.priorityShapeIcon(shape)} ${this.priorityColorClass(color)}`;
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

  protected onTabChange(tab: number): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.searchQuery.set('');
    this.priorityFilter.set(null);
    this.timeFilter.set(null);
    this.statusFilter.set(null);
    this.loadTickets();
  }

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    this.loadTickets();
  }

  protected onFeedbackSearch(value: string): void {
    this.feedbackSearchQuery.set(value);
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

  protected onAddTicket(): void {
    // TODO: open create-ticket dialog
  }

  protected onMarkAllRead(): void {
    // TODO: mark all feedback as read
  }
}
