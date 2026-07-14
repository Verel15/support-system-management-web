import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tabs, TabList, Tab } from 'primeng/tabs';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import {
  NotificationFilterState,
  NotificationGroup,
  NotificationItem,
} from '../../interfaces/notification.interface';
import { NotificationFilterComponent } from '../notification-filter/notification-filter.component';
import { NotificationItemComponent } from '../notification-item/notification-item.component';
import {
  NotificationService
} from '../../services/notification.service';
import { toNotificationItem } from '../../utils/notification-mapper';

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
export class NotificationsComponent implements OnInit, OnDestroy {
  private readonly filterPanel = viewChild.required<NotificationFilterComponent>('filterPanel');
  private readonly notificationService = inject(NotificationService);

  private readonly _now = new Date();
  private readonly _todayBase = new Date(
    this._now.getFullYear(),
    this._now.getMonth(),
    this._now.getDate(),
  );

  protected readonly activeTab = signal<string>('all');
  protected readonly searchQuery = signal('');
  protected readonly dateFilter = signal<string | null>(null);
  protected readonly activeFilter = signal<NotificationFilterState>({ sorts: [], categories: [] });
  protected readonly loading = signal(false);

  private readonly _notifications = signal<NotificationItem[]>([]);
  private _sseSource: EventSource | null = null;

  protected readonly dateOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'วันนี้', value: 'today' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'เดือนนี้', value: 'month' },
  ];

  protected readonly unreadCount = computed(
    () => this._notifications().filter((n) => !n.isRead).length,
  );

  protected readonly displayedGroups = computed<NotificationGroup[]>(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().toLowerCase().trim();
    const dateRange = this.dateFilter();
    const todayBase = this._todayBase;

    let items = this._notifications();

    if (tab === 'unread') {
      items = items.filter((n) => !n.isRead);
    }

    if (query) {
      items = items.filter((n) => {
        const title = n.titleSegments
          .map((s) => s.text)
          .join('')
          .toLowerCase();
        const desc = n.descriptionParts
          .filter((p) => p.type === 'text')
          .map((p) => p.text ?? '')
          .join('')
          .toLowerCase();
        return title.includes(query) || desc.includes(query);
      });
    }

    if (dateRange) {
      const base = new Date(todayBase);
      items = items.filter((n) => {
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

    const todayItems = items.filter((n) => n.timestamp >= todayBase);
    const beforeItems = items.filter((n) => n.timestamp < todayBase);

    const groups: NotificationGroup[] = [];
    if (todayItems.length > 0) groups.push({ groupLabel: 'วันนี้', items: todayItems });
    if (beforeItems.length > 0) groups.push({ groupLabel: 'ก่อนหน้านี้', items: beforeItems });
    return groups;
  });

  ngOnInit(): void {
    this.loadNotifications();
    this.connectSse();
  }

  ngOnDestroy(): void {
    this._sseSource?.close();
    this._sseSource = null;
  }

  private connectSse(): void {
    const [source, events$] = this.notificationService.subscribeToFeed();
    this._sseSource = source;
    events$.subscribe(n => {
      const todayBase = this._todayBase;
      const item = toNotificationItem(n, todayBase);
      this._notifications.update(list => [item, ...list.filter(x => x.id !== item.id)]);
    });
  }

  private loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getFeed(0, 50).subscribe({
      next: (page) => {
        const todayBase = this._todayBase;
        this._notifications.set(page.content.map((n) => toNotificationItem(n, todayBase)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onTabChange(value: string | number | undefined): void {
    if (typeof value === 'string') this.activeTab.set(value);
  }

  protected onFilterApply(filter: NotificationFilterState): void {
    this.activeFilter.set(filter);
  }

  protected onFilterClick(event: MouseEvent): void {
    this.filterPanel().toggle(event);
  }

  protected onItemClick(id: string): void {
    const item = this._notifications().find((n) => n.id === id);
    if (!item || item.isRead) return;

    this._notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );

    this.notificationService.markAsRead(id).subscribe();
  }
}
