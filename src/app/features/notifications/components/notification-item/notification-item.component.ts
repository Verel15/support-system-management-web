import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { NotificationItem } from '../../notification.types';

@Component({
  selector: 'app-notification-item',
  imports: [Avatar, Tag],
  templateUrl: './notification-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItemComponent {
  readonly notification = input.required<NotificationItem>();
}
