import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Menu } from 'primeng/menu';
import { Tabs, TabList, Tab } from 'primeng/tabs';
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import { DataTableCellDirective, DataTableComponent, TableColumn } from '../../../../shared/components/data-table';
import { Project, ProjectCardComponent } from '../../../../shared/components/project-card';
import { SortEvent } from 'primeng/api';
import type { NotificationItem } from '../../../notifications/notification.types';
import { NotificationItemComponent } from '../../../notifications/components/notification-item/notification-item.component';


type TicketStatus = 'Open' | 'In Progress' | 'In Review' | 'Return' | 'Done' | 'Close';
type TicketPriority = 'high' | 'medium' | 'low';

interface Ticket {
  title: string;
  project: string;
  assignee: string;
  timeRemaining: string;
  team: string;
  status: TicketStatus;
  priority: TicketPriority;
}

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
export class MyTicketsComponent {
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

  protected readonly workColumns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true },
    { field: 'project', header: 'โครงการ', sortable: true },
    { field: 'assignee', header: 'ผู้รับผิดชอบ', sortable: true },
    { field: 'timeRemaining', header: 'ระยะเวลาที่เหลือ', sortable: true },
    { field: 'team', header: 'ทีมรับเรื่อง', sortable: true },
    { field: 'status', header: '', sortable: false },
  ];

  protected readonly myTicketColumns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true },
    { field: 'project', header: 'โครงการ', sortable: true },
    { field: 'assignee', header: 'ผู้รับผิดชอบ', sortable: true },
    { field: 'timeRemaining', header: 'ระยะเวลาที่เหลือ', sortable: true },
    { field: 'team', header: 'ทีมรับเรื่อง', sortable: true },
    { field: 'status', header: '', sortable: false },
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

  protected readonly statusOptions = [
    { label: 'ทุกสถานะ', value: null },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'In Review', value: 'In Review' },
    { label: 'Return', value: 'Return' },
    { label: 'Done', value: 'Done' },
    { label: 'Close', value: 'Close' },
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

  protected readonly recentProjects: Project[] = [
    {
      name: 'IT Supporting and Helpdesk',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
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
      accentColor: '#3b82f6',
      attachmentCount: 2,
    },
    {
      name: 'Book Bank System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
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
      accentColor: '#ef4444',
      attachmentCount: 2,
    },
    {
      name: 'Life Insurance System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
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
      accentColor: '#22c55e',
      attachmentCount: 2,
    },
    {
      name: 'Rent a car System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
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
      accentColor: '#f59e0b',
      attachmentCount: 2,
    },
  ];

  private readonly workTickets: Ticket[] = [
    { title: 'แก้ไขบัคโครงการในแดช...', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '7 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { title: 'การอัพเกรดระบบ', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '7 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { title: 'แอปพลิเคชันมัดข้อง', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '7 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { title: 'การเชื่อมต่อเครือข่าย', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '6 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { title: 'การตรวจสอบเครือข่าย', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '6 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { title: 'อัพเกรดอุปกรณ์จัดเก็บ...', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '6 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'medium' },
    { title: 'Wireless Network', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '5 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { title: 'การกำหนดค่าเซิร์ฟเวอร์', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '5 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'medium' },
    { title: 'การตั้งค่าบัญชี', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '4 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { title: 'Installation Error', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '3 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
  ];

  private readonly myTickets: Ticket[] = [
    { title: 'Data Loss', project: 'Helpdesk', assignee: '-', timeRemaining: '-', team: 'EVT-DEV', status: 'Open', priority: 'medium' },
    { title: 'Email Not Sending', project: 'Helpdesk', assignee: '-', timeRemaining: '-', team: 'EVT-DEV', status: 'Open', priority: 'medium' },
    { title: 'การตรวจสอบเครือข่าย', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '7 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { title: 'การละเมิดข้อมูล', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Return', priority: 'high' },
    { title: 'แก้ไขบัคโครงการในแดช...', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '7 วัน', team: 'EVT-DEV', status: 'In Progress', priority: 'high' },
    { title: 'การแก้ไขปัญหาเครือข่าย', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '2 วัน', team: 'EVT-DEV', status: 'In Review', priority: 'high' },
    { title: 'การอัพเกรดระบบ', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Done', priority: 'high' },
    { title: 'การอัพเกรดระบบ', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Done', priority: 'high' },
    { title: 'อัพเกรดอุปกรณ์จัดเก็บ...', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Close', priority: 'medium' },
    { title: 'Installation Error', project: 'Helpdesk', assignee: 'ใจงาม สุดใจจริง', timeRemaining: '0 วัน', team: 'EVT-DEV', status: 'Close', priority: 'high' },
  ];

  protected readonly feedbackItems: FeedbackItem[] = [
    { id: '1', avatarUrl: 'https://i.pravatar.cc/40?img=5', projectName: 'Helpdesk', ticketName: 'บัคหน้าแดชบอร์ด', commenterName: 'มานี มีตา', commentPreview: 'กำลังดำเนินการแก้ไขค่ะ', timeLabel: '1 นาที', isRead: false },
    { id: '2', avatarUrl: 'https://i.pravatar.cc/40?img=5', projectName: 'Helpdesk', ticketName: 'บัคหน้าแดชบอร์ด', commenterName: 'มานี มีตา', commentPreview: 'กำลังดำเนินการแก้ไขค่ะ', timeLabel: '1 นาที', isRead: false },
    { id: '3', avatarUrl: 'https://i.pravatar.cc/40?img=3', projectName: 'Healthcare & spa', ticketName: 'server มีปัญหา', commenterName: 'สิริ สวัสดิ์', commentPreview: 'กำลังดำเนินการแก้ไขค่ะ', timeLabel: '3 ชั่วโมง', isRead: false },
    { id: '4', avatarUrl: 'https://i.pravatar.cc/40?img=3', projectName: 'Healthcare & spa', ticketName: 'server มีปัญหา', commenterName: 'สิริ สวัสดิ์', commentPreview: 'กำลังดำเนินการแก้ไขค่ะ', timeLabel: '3 ชั่วโมง', isRead: false },
    { id: '5', avatarUrl: 'https://i.pravatar.cc/40?img=3', projectName: 'Healthcare & spa', ticketName: 'server มีปัญหา', commenterName: 'สิริ สวัสดิ์', commentPreview: 'ปัญหาเกิดขึ้นตอนไหนคะ', timeLabel: '3 วัน', isRead: true },
    { id: '6', avatarUrl: 'https://i.pravatar.cc/40?img=3', projectName: 'Healthcare & spa', ticketName: 'server มีปัญหา', commenterName: 'สิริ สวัสดิ์', commentPreview: 'ปัญหาเกิดขึ้นตอนไหนคะ', timeLabel: '3 วัน', isRead: true },
    { id: '7', avatarUrl: 'https://i.pravatar.cc/40?img=3', projectName: 'Healthcare & spa', ticketName: 'server มีปัญหา', commenterName: 'สิริ สวัสดิ์', commentPreview: 'ปัญหาเกิดขึ้นตอนไหนคะ', timeLabel: '3 วัน', isRead: true },
    { id: '8', avatarUrl: 'https://i.pravatar.cc/40?img=5', projectName: 'Helpdesk', ticketName: 'บัคหน้าแดชบอร์ด', commenterName: 'มานี มีตา', commentPreview: 'เกิดปัญหามาที่วันแล้วค่ะ', timeLabel: 'วันจันทร์ที่ 10 ก.ค. เวลา 15:00 น.', isRead: true },
    { id: '9', avatarUrl: 'https://i.pravatar.cc/40?img=5', projectName: 'Helpdesk', ticketName: 'บัคหน้าแดชบอร์ด', commenterName: 'มานี มีตา', commentPreview: 'เกิดปัญหามาที่วันแล้วค่ะ', timeLabel: 'วันจันทร์ที่ 10 ก.ค. เวลา 15:00 น.', isRead: true },
    { id: '10', avatarUrl: 'https://i.pravatar.cc/40?img=5', projectName: 'Helpdesk', ticketName: 'บัคหน้าแดชบอร์ด', commenterName: 'มานี มีตา', commentPreview: 'เกิดปัญหามาที่วันแล้วค่ะ', timeLabel: 'วันจันทร์ที่ 10 ก.ค. เวลา 15:00 น.', isRead: true },
  ];

  protected readonly activeColumns = computed(() =>
    this.activeTab() === 0 ? this.workColumns : this.myTicketColumns,
  );

  private readonly activeTickets = computed(() =>
    this.activeTab() === 0 ? this.workTickets : this.myTickets,
  );

  protected readonly filteredTickets = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const priority = this.priorityFilter();
    const status = this.statusFilter();
    return this.activeTickets().filter((t) => {
      const matchSearch =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.project.toLowerCase().includes(query) ||
        t.assignee.toLowerCase().includes(query);
      const matchPriority = !priority || t.priority === priority;
      const matchStatus = !status || t.status === status;
      return matchSearch && matchPriority && matchStatus;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredTickets().length);

  protected readonly pagedTickets = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredTickets()
      .slice(start, start + this.pageSize())
      .map((t) => ({ ...t }));
  });

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

    return items.map((f): NotificationItem => ({
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
    }));
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

  protected getPriorityDotClass(priority: string): string {
    const map: Record<string, string> = {
      high: 'bg-error-500',
      medium: 'bg-warning-500',
      low: 'bg-primary-400',
    };
    return map[priority] ?? 'bg-slate-400';
  }

  protected onTabChange(tab: number): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.searchQuery.set('');
    this.priorityFilter.set(null);
    this.timeFilter.set(null);
    this.statusFilter.set(null);
  }

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  protected onFeedbackSearch(value: string): void {
    this.feedbackSearchQuery.set(value);
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

  protected onMarkAllRead(): void {
    // TODO: mark all feedback as read
  }
}
