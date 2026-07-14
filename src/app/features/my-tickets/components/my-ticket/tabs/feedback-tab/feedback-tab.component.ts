import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { NotificationItem } from '../../../../../notifications/interfaces/notification.interface';
import { NotificationItemComponent } from '../../../../../notifications/components/notification-item/notification-item.component';
import { NotificationService } from '../../../../../notifications/services/notification.service';
import { toNotificationItem } from '../../../../../notifications/utils/notification-mapper';

@Component({
  selector: 'app-feedback-tab',
  imports: [FormsModule, Button, Select, InputText, IconField, InputIcon, NotificationItemComponent],
  templateUrl: './feedback-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackTabComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  private readonly _now = new Date();
  private readonly _todayBase = new Date(
    this._now.getFullYear(),
    this._now.getMonth(),
    this._now.getDate(),
  );

  protected readonly sortByFilter = signal<string | null>(null);
  protected readonly dateFilter = signal<string | null>(null);
  protected readonly feedbackSearchQuery = signal('');

  private readonly feedbackItems = signal<NotificationItem[]>([]);

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

  protected readonly filteredFeedback = computed(() => {
    const query = this.feedbackSearchQuery().toLowerCase().trim();
    const items = this.feedbackItems();
    if (!query) return items;
    return items.filter((n) => {
      const title = n.titleSegments.map((s) => s.text).join('').toLowerCase();
      const desc = n.descriptionParts
        .filter((p) => p.type === 'text')
        .map((p) => p.text ?? '')
        .join('')
        .toLowerCase();
      return (
        title.includes(query) ||
        desc.includes(query) ||
        n.actorName.toLowerCase().includes(query)
      );
    });
  });

  ngOnInit(): void {
    this.loadFeedback();
  }

  private loadFeedback(): void {
    this.notificationService.getFeed(0, 50, 'TICKET_COMMENT_ADDED').subscribe({
      next: (page) => {
        this.feedbackItems.set(page.content.map((n) => toNotificationItem(n, this._todayBase)));
      },
      error: () => this.feedbackItems.set([]),
    });
  }

  protected onFeedbackSearch(value: string): void {
    this.feedbackSearchQuery.set(value);
  }

  protected onMarkAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.feedbackItems.update((list) => list.map((n) => ({ ...n, isRead: true })));
      },
      error: () => {},
    });
  }
}
