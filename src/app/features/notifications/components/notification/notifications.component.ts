import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tabs, TabList, Tab } from 'primeng/tabs';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { NotificationFilterState, NotificationGroup, NotificationItem } from '../../notification.types';
import { NotificationFilterComponent } from '../notification-filter/notification-filter.component';
import { NotificationItemComponent } from '../notification-item/notification-item.component';

const _now = new Date();
const _todayBase = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate());
const _threeDaysAgo = new Date(_todayBase.getTime() - 3 * 24 * 60 * 60 * 1000);
const _fourDaysAgo = new Date(_todayBase.getTime() - 4 * 24 * 60 * 60 * 1000);
const _oldDate = new Date(2023, 6, 10, 15, 0);

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    categoryIcon: 'pi-file',
    categoryLabel: 'Tickets ทั้งหมด',
    titleSegments: [
      { text: 'ลบ ticket ', bold: false },
      { text: '"server ล่ม"', bold: true },
      { text: ' ในโครงการ ', bold: false },
      { text: '"Helpdesk"', bold: true },
    ],
    descriptionParts: [
      { type: 'text', text: 'สุรเชษฐ์ แดนหินผา', bold: true },
      { type: 'text', text: ' ได้ทำการลบ ticket ' },
      { type: 'text', text: 'server ล่ม', bold: true },
      { type: 'text', text: ' ใน ' },
      { type: 'text', text: 'Helpdesk', bold: true },
    ],
    isRead: true,
    actorName: 'สุรเชษฐ์ แดนหินผา',
    actorInitial: 'ส',
    avatarUrl: 'https://i.pravatar.cc/40?img=3',
    timestamp: _todayBase,
    timeLabel: '',
  },
  {
    id: '2',
    categoryIcon: 'pi-table',
    categoryLabel: 'จัดการข้อมูล',
    titleSegments: [
      { text: 'เพิ่มสถานะ ในทีม ', bold: false },
      { text: '"Development"', bold: true },
    ],
    descriptionParts: [
      { type: 'text', text: 'มีตัง ต้นเตือน', bold: true },
      { type: 'text', text: ' ได้เพิ่มสถานะ ' },
      { type: 'chip', chipLabel: 'In Progress', chipSeverity: 'warn' },
      { type: 'text', text: ' ในทีม ' },
      { type: 'text', text: 'Development', bold: true },
    ],
    isRead: true,
    actorName: 'มีตัง ต้นเตือน',
    actorInitial: 'ม',
    avatarUrl: 'https://i.pravatar.cc/40?img=5',
    timestamp: _todayBase,
    timeLabel: '',
  },
  {
    id: '3',
    categoryIcon: 'pi-file',
    categoryLabel: 'Tickets ทั้งหมด',
    titleSegments: [
      { text: 'อัพเดตสถานะ ticket ', bold: false },
      { text: '"server ล่ม"', bold: true },
      { text: ' ของ ', bold: false },
      { text: '"Helpdesk"', bold: true },
    ],
    descriptionParts: [
      { type: 'text', text: 'มีตัง ต้นเตือน', bold: true },
      { type: 'text', text: ' ได้ทำการอัพเดตสถานะ tickets จาก ' },
      { type: 'chip', chipLabel: 'In Review', chipSeverity: 'warn' },
      { type: 'text', text: ' เป็น ' },
      { type: 'chip', chipLabel: 'Done', chipSeverity: 'success' },
    ],
    isRead: false,
    actorName: 'มีตัง ต้นเตือน',
    actorInitial: 'ม',
    avatarUrl: 'https://i.pravatar.cc/40?img=5',
    timestamp: _threeDaysAgo,
    timeLabel: '3 วัน',
  },
  {
    id: '4',
    categoryIcon: 'pi-envelope',
    categoryLabel: 'Tickets ของฉัน',
    titleSegments: [
      { text: 'Assign เข้าโครงการ ', bold: false },
      { text: '"Helpdesk"', bold: true },
    ],
    descriptionParts: [
      { type: 'text', text: 'สุรเชษฐ์ แดนหินผา', bold: true },
      { type: 'text', text: ' ได้ทำการ Assign คุณเข้าโครงการ ' },
      { type: 'text', text: 'Helpdesk', bold: true },
    ],
    isRead: false,
    actorName: 'สุรเชษฐ์ แดนหินผา',
    actorInitial: 'ส',
    avatarUrl: 'https://i.pravatar.cc/40?img=3',
    timestamp: _fourDaysAgo,
    timeLabel: '4 วัน',
  },
  {
    id: '5',
    categoryIcon: 'pi-users',
    categoryLabel: 'จัดการผู้ใช้',
    titleSegments: [{ text: 'แก้ไขข้อมูลผู้ใช้', bold: false }],
    descriptionParts: [
      { type: 'text', text: 'สุรเชษฐ์ แดนหินผา', bold: true },
      { type: 'text', text: ' ได้ทำการแก้ไขข้อมูลผู้ใช้ ' },
      { type: 'text', text: 'แสนดี ที่สุดเลย', bold: true },
    ],
    isRead: true,
    actorName: 'สุรเชษฐ์ แดนหินผา',
    actorInitial: 'ส',
    avatarUrl: 'https://i.pravatar.cc/40?img=3',
    timestamp: _oldDate,
    timeLabel: 'วันอังคารที่ 10 ก.ค. 2566 เวลา 15:00 น.',
  },
];

@Component({
  selector: 'app-notifications',
  imports: [
    FormsModule,
    Tabs,
    TabList,
    Tab,
    Select,
    InputText,
    InputGroup,
    InputGroupAddon,
    NotificationFilterComponent,
    NotificationItemComponent,
  ],
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly filterPanel = viewChild.required<NotificationFilterComponent>('filterPanel');

  protected readonly activeTab = signal<string>('all');
  protected readonly searchQuery = signal('');
  protected readonly dateFilter = signal<string | null>(null);
  protected readonly activeFilter = signal<NotificationFilterState>({ sorts: [], categories: [] });

  protected readonly dateOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'วันนี้', value: 'today' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'เดือนนี้', value: 'month' },
  ];

  protected readonly unreadCount = computed(
    () => MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
  );

  protected readonly displayedGroups = computed<NotificationGroup[]>(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().toLowerCase().trim();
    const dateRange = this.dateFilter();

    let items = MOCK_NOTIFICATIONS;

    if (tab === 'unread') {
      items = items.filter(n => !n.isRead);
    }

    if (query) {
      items = items.filter(n => {
        const title = n.titleSegments.map(s => s.text).join('').toLowerCase();
        const desc = n.descriptionParts
          .filter(p => p.type === 'text')
          .map(p => p.text ?? '')
          .join('')
          .toLowerCase();
        return title.includes(query) || desc.includes(query);
      });
    }

    if (dateRange) {
      const base = new Date(_todayBase);
      items = items.filter(n => {
        if (dateRange === 'today') return n.timestamp >= base;
        if (dateRange === 'week') {
          const weekStart = new Date(base.getTime() - 7 * 24 * 60 * 60 * 1000);
          return n.timestamp >= weekStart;
        }
        if (dateRange === 'month') {
          const monthStart = new Date(base.getFullYear(), base.getMonth(), 1);
          return n.timestamp >= monthStart;
        }
        return true;
      });
    }

    const todayItems = items.filter(n => n.timestamp >= _todayBase);
    const beforeItems = items.filter(n => n.timestamp < _todayBase);

    const groups: NotificationGroup[] = [];
    if (todayItems.length > 0) groups.push({ groupLabel: 'วันนี้', items: todayItems });
    if (beforeItems.length > 0) groups.push({ groupLabel: 'ก่อนหน้านี้', items: beforeItems });
    return groups;
  });

  protected onTabChange(value: string | number | undefined): void {
    if (typeof value === 'string') this.activeTab.set(value);
  }

  protected onFilterApply(filter: NotificationFilterState): void {
    this.activeFilter.set(filter);
  }

  protected onFilterClick(event: MouseEvent): void {
    this.filterPanel().toggle(event);
  }
}
