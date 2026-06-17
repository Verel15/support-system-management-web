import { ChangeDetectionStrategy, Component, output, signal, viewChild } from '@angular/core';
import { Popover } from 'primeng/popover';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import {
  NotificationCategory,
  NotificationFilterState,
  NotificationSortType,
} from '../../notification.types';

@Component({
  selector: 'app-notification-filter',
  imports: [Popover, Button, Divider],
  templateUrl: './notification-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationFilterComponent {
  readonly apply = output<NotificationFilterState>();

  protected readonly selectedSorts = signal<NotificationSortType[]>([]);
  protected readonly selectedCategories = signal<NotificationCategory[]>([]);

  private readonly panelRef = viewChild.required<Popover>('panel');

  protected readonly sortOptions: { label: string; value: NotificationSortType }[] = [
    { label: 'มอบหมายให้ฉัน', value: 'assigned' },
    { label: '@การกล่าวถึง', value: 'mentioned' },
    { label: 'การตอบกลับ', value: 'replied' },
  ];

  protected readonly categoryOptions: { label: string; value: NotificationCategory }[] = [
    { label: 'Tickets ของฉัน', value: 'my-tickets' },
    { label: 'โครงการของฉัน', value: 'my-projects' },
    { label: 'จัดการข้อมูล', value: 'data-management' },
    { label: 'Tickets ทั้งหมด', value: 'all-tickets' },
    { label: 'จัดการผู้ใช้', value: 'user-management' },
    { label: 'จัดการโครงการ', value: 'project-management' },
  ];

  toggle(event: MouseEvent): void {
    this.panelRef().toggle(event);
  }

  protected toggleSort(value: NotificationSortType): void {
    this.selectedSorts.update(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value],
    );
  }

  protected toggleCategory(value: NotificationCategory): void {
    this.selectedCategories.update(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value],
    );
  }

  protected clear(): void {
    this.selectedSorts.set([]);
    this.selectedCategories.set([]);
  }

  protected search(): void {
    this.apply.emit({
      sorts: this.selectedSorts(),
      categories: this.selectedCategories(),
    });
    this.panelRef().hide();
  }

  protected isSortSelected(value: NotificationSortType): boolean {
    return this.selectedSorts().includes(value);
  }

  protected isCategorySelected(value: NotificationCategory): boolean {
    return this.selectedCategories().includes(value);
  }
}
